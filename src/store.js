import Path from 'path-browserify'
import mime from 'mime'
import _update from 'lodash-es/update'
import _cloneDeep from 'lodash-es/cloneDeep'
import _sortBy from 'lodash-es/sortBy'

const IGNORE_FILES = ['/.ui', '/index.json']
const MAX_Z_INDEX = 999999
const drive = beaker.hyperdrive.drive(document.location.origin)

async function readFile(file, type = 'buffer') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = resolve
    reader.onerror = reject
    if(type === 'buffer') reader.readAsArrayBuffer(file)
    if(type === 'text') reader.readAsText(file)
    if(type === 'url') reader.readAsDataURL(file)
  })
}

function getCoords({top, left}) {
  const x = left - (window.innerWidth / 2)
  const y = top - (window.innerHeight / 2)

  return {x, y}
}

window.objectCache = {}

function getPosition(entry, drag) {
  let {x, y, z, width, height} = entry.stat.metadata

  x = x ? Number(x) : 0
  y = y ? Number(y) : 0
  z = z ? Number(z) : 1
  width = width ? Number(width) : undefined
  height = height ? Number(height) : undefined

  if(drag && drag.entry === entry.path) {
    z = MAX_Z_INDEX
    if(drag.resize) {
      width = drag.resize.width
      height = drag.resize.height
      x = (drag.resize.left + (width / 2)) - (window.innerWidth / 2)
      y = (drag.resize.top + (height / 2)) - (window.innerHeight / 2)
    } else {
      x += drag.dx
      y += drag.dy
    }
  }

  return {x, y, z, width, height}
}

export default {
  state: {
    path: '/',
    info: {},
    stat: null,
    baseStat: null,
    entries: [],
    drag: null,
    interacting: false,
    selection: new Set(),
    hover: null
  },
  getters: {
    name(state) {
      return Path.basename(state.path)
    },
    writable(state) {
      return state.info && state.info.writable
    },
    baseEntry(state, getters) {
      let path = state.path
      if(state.stat) {
        if(state.stat.isFile()) {
          path = Path.dirname(path)
        }
      }
      if(path && state.baseStat) return getters.createEntry(path, state.baseStat)
    },
    isFile(state) {
      return state.stat && state.stat.isFile && state.stat.isFile()
    },
    isDirectory(state) {
      return state.stat && state.stat.isDirectory && state.stat.isDirectory()
    },
    parent(state, getters) {
      return Path.dirname(getters.base)
    },
    entry(state, getters) {
      return getters.createEntry(state.path, state.stat)
    },
    findEntry(state, getters) {
      return path => {
        const entry = state.entries.find(entry => entry.path === path)
        return entry
      }
    },
    createEntry(state, getters) {
      return (path, stat) => {
        const isDirectory = stat.isDirectory()
        const isFile = stat.isFile()

        const metadata = stat.metadata || {}

        const type = metadata.type
        let kind = isDirectory ? 'directory' : 'file'

        if(type) {
          if(type === 'directory') kind = 'directory'
          if(type === 'application/pdf') kind = 'pdf'
          if(type.startsWith('image/')) kind = 'image'
          if(type.startsWith('video/')) kind = 'video'
          if(type.startsWith('text/')) kind = 'text'
        }

        let icon = (kind === 'directory') ? 'folder' : 'insert_drive_file'
        if(kind === 'image') icon = 'image'
        if(kind === 'video') icon = 'movie'
        if(kind === 'pdf') icon = 'picture_as_pdf'

        const base = isFile ? Path.dirname(path) : path

        const parent = isDirectory ? Path.dirname(base) : base

        const segs = path.split('/').filter(p => p)
        const name = segs[segs.length-1]

        const displayPath = path === '/' ? 'Home' : path.replace(/^\//, '').replace(/\/$/, '')

        const form = isDirectory ? 'folder' : 'file'

        const link = isDirectory ? (path.endsWith('/') ? path : path+'/') : path
        const parentLink = parent.endsWith('/')  ? parent : parent+'/'

        const ext = Path.extname(path)

        return {
          path, displayPath, base, parent, parentLink, kind, name, stat, isDirectory, isFile, form, type, icon, link, ext
        }
      }
    },
    spatialEntries(state, getters) {
      return state.entries.map(entry => {
        let dragging = false

        let {x, y, z, width, height} = getPosition(entry, state.drag)

        if(state.drag && state.drag.entry === entry.name) dragging = true

        let style = {
          position: 'absolute',
          top: `calc(50% + ${y}px)`,
          left: `calc(50% + ${x}px)`,
          transform: 'translate(-50%, -50%)',
          zIndex: z
        }

        if(width && height) {
          style = {
            ...style,
            width: `${width}px`,
            height: `${height}px`,
          }
        }

        const resizable = entry.kind !== 'directory'
        const draggable = true
        const aspect = entry.kind !== 'text'

        const selected = state.selection.has(entry.path)
        const hover = state.hover === entry.path

        return {entry, style, resizable, draggable, dragging, aspect, selected, hover}
      })
    },
    getEntryText(state, getters) {
      return async entry => {
        if(entry.kind === 'text') return await drive.readFile(entry.path, {encoding: 'utf8'})
      }
    },
    getEntryContent(state, getters) {
      return async entry => {
        const cached = window.objectCache[entry.path]
        if(cached) return cached

        const buf = await drive.readFile(entry.path, {encoding: 'binary'})
        const blob = new Blob([buf], {type: entry.type})
        const url = URL.createObjectURL(blob)

        window.objectCache[entry.path] = url

        return url
      }
    },
    single(state, getters) {
      return path => getters.findEntry(path)
    }
  },
  actions: {
    async init({commit, dispatch}, path) {
      commit('updatePath', path)
      await dispatch('fetchBase')
      dispatch('fetchEntries')
    },
    async navigate({commit, dispatch}, path) {
      commit('updatePath', path)
      dispatch('select', {entry: null})
      await dispatch('fetchBase')
      dispatch('fetchEntries')
    },
    async fetchBase({state, commit, getters}) {
      const info = await drive.getInfo()
      commit('update', {info})

      let baseStat

      const stat = await drive.stat(state.path)
      if(stat.isDirectory()) {
        baseStat = stat
      } else {
        const base = Path.dirname(state.path)
        baseStat = await drive.stat(base)
      }

      commit('update', {baseStat})
    },
    async fetchEntries({state, commit, getters}) {
      const stat = await drive.stat(state.path)
      commit('update', {stat})

      let entries = await drive.readdir(getters.baseEntry.base)

      entries = entries.filter(entry => {
        const path = Path.join(getters.baseEntry.path, entry)
        return !IGNORE_FILES.includes(path)
      })

      const stats = await Promise.all(entries.map(async entry => {
        const path = Path.join(getters.baseEntry.base, entry)
        return await drive.stat(path)
      }))

      entries = entries.map((name, i) => {
        const stat = stats[i]
        const path = Path.join(getters.baseEntry.base, name)
        return getters.createEntry(path, stat)
      })

      commit('update', {entries})
    },
    async updateMetadata({commit}, {entry, metadata}) {
      commit('updateLocalEntryMetadata', {entry, metadata})
      await drive.updateMetadata(entry.path, metadata)
    },
    async deleteEntry({dispatch}, entry) {
      if(entry.isDirectory) {
        await drive.rmdir(entry.path, {recursive: true})
      } else {
        await drive.unlink(entry.path)
      }
      dispatch('fetchEntries')
    },
    async renameEntry({dispatch}, {entry, name}) {
      const destExt = Path.extname(name)
      if(entry.ext !== destExt) {
        name = Path.parse(name).name+entry.ext
      }

      let dest = Path.join(entry.parent, name)

      if(entry.path !== dest) await drive.rename(entry.path, dest)

      if(entry.isDirectory) dest = dest+'/'

      return dest
    },
    async identifyEntry({dispatch}, entry) {
      let type

      if(entry.stat.isDirectory()) type = 'directory'

      const ext = Path.extname(entry.name)

      if(ext) type = mime.getType(ext)

      if(type) {
        const metadata = {type}
        dispatch('updateMetadata', {entry, metadata})
      }
    },
    dragStart({commit}, entry) {
      const drag = {entry, dx: 0, dy: 0}
      commit('update', {drag, interacting: true})
    },
    dragMove({state, commit}, {dx, dy, resize}) {
      const drag = {
        ...state.drag,
        dx: state.drag.dx + dx,
        dy: state.drag.dy + dy,
        resize: resize
      }
      commit('update', {drag})
    },
    async dragEnd({commit, getters, state, dispatch}) {
      const entry = getters.findEntry(state.drag.entry)

      if(entry) {
        const {x, y, z, width, height} = getPosition(entry, state.drag)
        const metadata = {x, y, z, width, height}

        commit('update', {drag: null})
        await dispatch('updateMetadata', {entry, metadata})
        await dispatch('restack', {entry})
      } else {
        commit('update', {drag: null})
      }

      setTimeout(function() {
        commit('update', {interacting: false})
      }, 1)
    },
    async drop({state, getters, dispatch}, event) {
      const files = event.dataTransfer.files

      const {x, y} = getCoords({top: event.clientY, left: event.clientX})

      dispatch('uploadFiles', {files, x, y})
    },
    async uploadFiles({state, getters, dispatch}, {files, x, y}) {
      x = x || 0
      y = y || 0

      let filesArr = Array.from(files)
      let z = state.entries.length

      for(const file of filesArr) {
        z++
        const pevent = await readFile(file, 'buffer')
        const buffer = pevent.target.result
        const metadata = {type: file.type, x, y, z}
        const path = Path.join(getters.baseEntry.path, file.name)
        await drive.writeFile(path, buffer, {metadata})
      }

      dispatch('fetchEntries')
    },
    async restack({state, dispatch}, {entry}) {
      const entries = state.entries.map(e => {
        let {z} = getPosition(e, state.drag)
        if(e.name === entry.name) z = MAX_Z_INDEX
        return {entry: e,  z}
      })
      const stacked = _sortBy(entries, 'z').map(({entry}, i) => {
        return {entry, z: i+1}
      })

      for(const {entry, z} of stacked) {
        await dispatch('updateMetadata', {entry, metadata: {z}})
      }
    },
    async createDirectory({dispatch, state}, {base, name}) {
      const path = Path.join(base, name)
      await drive.mkdir(path)
      const z = state.entries.length
      await dispatch('updateMetadata', {entry: {path}, metadata: {z}})
      await dispatch('fetchEntries')
    },
    async createText({dispatch, state, getters}, {base}) {
      const ext = 'txt'
      let name = 'untitled'

      const nums = state.entries
        .map(e => e.name)
        .map(n => n.match(/untitled( \d+)?(\.txt)?$/i))
        .filter(m => m)
        .map(m => m[1] ? Number(m[1].trim()) : 0)

      const metadata = {z: state.entries.length, type: 'text/plain'}

      const maxNum = nums.length ? Math.max(...nums) : null

      const n = maxNum !== null ? maxNum+1 : null

      if(n) name = `${name} ${n}`

      const filename = [name, ext].join('.')
      const path = Path.join(base, filename)

      await drive.writeFile(path, '', {encoding: 'utf8', metadata})
      await dispatch('fetchEntries')

      const entry = getters.findEntry(path)

      return entry
    },
    async updateText({dispatch}, {entry, text}) {
      await drive.writeFile(entry.path, text, {encoding: 'utf8'})
      await dispatch('fetchEntries')
    },
    fork() {
      beaker.hyperdrive.forkDrive(drive.url, {detached: true})
    },
    select({commit, state}, {entry, add}) {
      if(entry) {
        if(add) {
          state.selection.add(entry.path)
          state.selection = new Set(state.selection)
        } else {
          state.selection = new Set([entry.path])
        }
      } else {
        state.selection = new Set()
      }
    },
    hover({commit, state}, entry) {
      if(state.drag) return

      if(entry) {
        commit('update', {hover: entry.path})
      } else {
        commit('update', {hover: null})
      }
    }
  },
  mutations: {
    update(state, obj) {
      for(let [key, value] of Object.entries(obj)) {
        state[key] = value
      }
    },
    updatePath(state, path) {
      state.path = decodeURIComponent(path)
    },
    updateLocalEntryMetadata(state, {entry, metadata}) {
      state.entries = state.entries.map(e => {
        if(e.path === entry.path) {
          let copy = _cloneDeep(e)
          _update(copy, 'stat.metadata', value => ({...value, ...metadata}))
          return {...copy}
        }
        return e
      })
    }
  }
}