import Path from 'path-browserify'
import mime from 'mime'
import _update from 'lodash-es/update'
import _cloneDeep from 'lodash-es/cloneDeep'
import _sortBy from 'lodash-es/sortBy'

const CONTENT_BASE = '/content'
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

function getPosition(entry, drag) {
  let {x, y, z, width, height} = entry.stat.metadata

  x = x ? Number(x) : 0
  y = y ? Number(y) : 0
  z = z ? Number(z) : 1
  width = width ? Number(width) : undefined
  height = height ? Number(height) : undefined

  if(drag && drag.entry === entry.name) {
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
    stat: {},
    entries: [],
    drag: null
  },
  getters: {
    drivePath(state) {
      return Path.join(CONTENT_BASE, state.path)
    },
    name(state) {
      return Path.basename(state.path)
    },
    base(state, getters) {
      return getters.isFile ? Path.dirname(state.path) : state.path
    },
    driveBase(state, getters) {
      return Path.join(CONTENT_BASE, getters.base)
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
      return getters.createEntry(getters.name, getters.stat)
    },
    findEntry(state, getters) {
      return name => {
        return state.entries.find(entry => entry.name === name)
      }
    },
    createEntry(state, getters) {
      return (name, stat) => {
        return {
          path: Path.join(getters.base, name),
          drivePath: Path.join(getters.driveBase, name),
          name,
          stat
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

        const kind = getters.entryKind(entry)

        const resizable = kind !== 'directory'
        const draggable = true

        return {entry, style, resizable, draggable, dragging}
      })
    },
    entryType(state, getters) {
      return entry => entry.stat.metadata.type
    },
    entryKind(state, getters) {
      return entry => {
        const type = getters.entryType(entry)
        if(!type) return
        if(type === 'directory') return 'directory'
        if(type.startsWith('image/')) return 'image'
        if(type.startsWith('video/')) return 'video'
        if(type.startsWith('text/')) return 'text'
        return 'file'
      }
    },
    getEntryText(state, getters) {
      return async entry => {
        const kind = getters.entryKind(entry)
        if(kind === 'text') return await drive.readFile(entry.drivePath, {encoding: 'utf8'})
      }
    },
    single(state, getters) {
      return path => getters.findEntry(path)
    }
  },
  actions: {
    async init({commit, dispatch}, path) {
      const results = await drive.query({path: CONTENT_BASE})
      if(!results.length) await drive.mkdir(CONTENT_BASE)

      commit('update', {path})
      dispatch('fetchEntries')
    },
    async fetchEntries({commit, getters}) {
      const info = await drive.getInfo()
      commit('update', {info})

      const stat = await drive.stat(getters.drivePath)
      commit('update', {stat})

      let entries = await drive.readdir(getters.driveBase)

      const stats = await Promise.all(entries.map(async entry => {
        const drivePath = Path.join(getters.driveBase, entry)
        return await drive.stat(drivePath)
      }))

      entries = entries.map((name, i) => {
        const stat = stats[i]
        return getters.createEntry(name, stat)
      })

      commit('update', {entries})
    },
    async updateMetadata({commit}, {entry, metadata}) {
      commit('updateLocalEntryMetadata', {entry, metadata})
      await drive.updateMetadata(entry.drivePath, metadata)
    },
    async identifyEntry({dispatch}, entry) {
      let type

      if(entry.stat.isDirectory()) type = 'directory'

      const ext = Path.extname(entry.name)

      if(ext) type = mime.getType(ext)

      // Detect content type from data
      // if(!type) {
      //   const buf = await drive.readFile(this.entry.drivePath, 'binary')
      //   const found = await FileType.fromBuffer(buf)
      //   type = found && found.mime
      // }

      if(type) {
        const metadata = {type}
        dispatch('updateMetadata', {entry, metadata})
      }
    },
    dragStart({commit}, entry) {
      const drag = {entry, dx: 0, dy: 0}
      commit('update', {drag})
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
    },
    async drop({state, getters, dispatch}, event) {
      const files = Array.from(event.dataTransfer.files)

      const {x, y} = getCoords({top: event.clientY, left: event.clientX})

      let z = state.entries.length

      for(const file of files) {
        z++
        const pevent = await readFile(file, 'buffer')
        const buffer = pevent.target.result
        const metadata = {type: file.type, x, y, z}
        const path = Path.join(getters.driveBase, file.name)
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
        await dispatch('updateMetadata', {entry, metadata: {z}, fetch: false})
      }
    }
  },
  mutations: {
    update(state, obj) {
      for(let [key, value] of Object.entries(obj)) {
        state[key] = value
      }
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