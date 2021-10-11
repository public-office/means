<template>
<span @click.stop>
  <header @click.stop>
    <div class="main">
      <router-link v-if="$route.path !== '/'" class="pointer back pill" :to="entry.parentLink">
        <i class="material-icons">arrow_back</i>
      </router-link>
      <h1 class="pointer"><i class="material-icons">{{entry.icon}}</i> {{entry.displayPath}}</h1>
    </div>
    <nav class="pointer right" v-if="$store.getters.writable">
      <a class="pill" v-if="entry.isDirectory" @click.prevent.stop="showFolderSettings = true" href="#"><i class="material-icons">settings</i> folder settings</a>
      <a class="pill" v-if="entry.isFile" @click.prevent.stop="showFileSettings = true" href="#"><i class="material-icons">settings</i> file settings</a>
      <a class="pill" v-if="entry.isDirectory" @click.prevent.stop="uploadFile" href="#"><i class="material-icons">insert_drive_file</i> upload file</a>
      <a class="pill" v-if="entry.isDirectory" @click.prevent.stop="createFolder" href="#"><i class="material-icons">folder</i> new folder</a>
      <a class="pill" v-if="entry.isDirectory" @click.prevent.stop="createText" href="#"><i class="material-icons">description</i> add text</a>
      <a class="pill" v-if="entry.path !== '/'" @click.prevent.stop="renameEntry" href="#"><i class="material-icons">edit</i> rename</a>
      <a class="pill" v-if="entry.path !== '/'" @click.prevent.stop="deleteEntry" href="#"><i class="material-icons">delete</i> delete {{entry.form}}</a>
      <a class="pill" v-if="$store.state.selection.size" href="#" @click.prevent.stop="deleteSelected"><i class="material-icons">delete</i> delete selected</a>
    </nav>
  </header>
  <modal v-if="showFolderSettings" @close="showFolderSettings = false">
    <folder-settings></folder-settings>
  </modal>
  <modal v-if="showFileSettings" @close="showFileSettings = false">
    <file-settings></file-settings>
  </modal>
</span>
</template>

<style scoped lang="scss">
header {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  padding: var(--pad);
  display: flex;
  justify-content: space-between;
  z-index: 2;
  pointer-events: none;
  cursor: default;
  .pointer {
    pointer-events: initial;
  }
  .main {
    display: flex;
    align-items: flex-start;
    .back {
      margin-right: 1em;
    }
  }
  h1 {
    font-size: 2rem;
    margin-top: 0.4rem;
    i {
      vertical-align: middle;
      position: relative;
      top: -0.07em;
      margin-right: 0.3rem;
    }
  }
  .close {
    margin-left: 2em;
    svg {
      width: auto;
      height: 0.9em;
      position: relative;
      top: 0.1rem;
      line {
        stroke: currentColor;
        vector-effect: non-scaling-stroke;
      }
    }
  }
}
</style>

<script>
import Modal from './Modal.vue'
import FolderSettings from './FolderSettings.vue'
import FileSettings from './FileSettings.vue'

export default {
  components: {
    Modal,
    FolderSettings,
    FileSettings
  },
  props: {
    entry: Object
  },
  data: () => ({
    showFolderSettings: false,
    showFileSettings: false
  }),
  methods: {
    async deleteEntry() {
      if(confirm(`Delete ${this.entry.name}?`)) {
        this.$router.replace(this.entry.parent)
        this.$store.dispatch('deleteEntry', this.entry)
      }
    },
    async deleteSelected() {
      const num = this.$store.state.selection.size
      if(confirm(`Delete ${num} item${num === 1 ? '' : 's'}?`)) {
        this.$store.dispatch('deleteSelected')
      }
    },
    async renameEntry() {
      const name = prompt(`Rename ${this.entry.name} to`)
      if(name) {
        const dest = await this.$store.dispatch('renameEntry', {entry: this.entry, name})
        this.$router.replace(dest)
      }
    },
    async createFolder() {
      const name = prompt('Enter folder name')
      if(name) {
        this.$store.dispatch('createDirectory', {base: this.entry.base, name})
      }
    },
    async createText() {
      const entry = await this.$store.dispatch('createText', {base: this.entry.base})
      this.$router.push(entry.link)
    },
    async uploadFile() {
      const $input = document.createElement('input')
      $input.type = 'file'
      $input.multiple = true

      $input.onchange = () => {
        this.$store.dispatch('uploadFiles', {files: $input.files})
      }

      $input.click()
    }
  }
}
</script>