<template>
<div>
  <!-- <ViewEntry
    v-if="isFile"
    :entry="entry"
    :drive="drive"
    @identify="identifyEntry(entry)">
  </ViewEntry> -->

  <SingleEntry
    v-if="single && single.isFile"
    :entry="single"></SingleEntry>

  <SpatialEntries></SpatialEntries>

  <!-- <ListEntries
    :parent="parent"
    :base="base"
    :entries="entries">
  </ListEntries> -->

  <!-- <div class="menu">
    <button @click="createFolder">New folder</button>
    <button @click="$refs.upload.click()">Upload file(s)</button>
    <input type="file" multiple hidden ref="upload" @input="inputFiles" />
  </div> -->
</div>
</template>

<style scoped>
.menu {
  position:fixed;
  top: 0;
  left: 0;
  z-index: 2;
}
</style>

<script>
import ListEntries from './ListEntries.vue'
import SpatialEntries from './SpatialEntries.vue'
import ViewEntry from './ViewEntry.vue'
import SingleEntry from './SingleEntry.vue'

// import FileType from 'file-type'
// import mime from 'mime'

export default {
  components: {
    ListEntries,
    SpatialEntries,
    ViewEntry,
    SingleEntry
  },
  created() {
    this.$store.dispatch('init', this.$route.path)
  },
  watch: {
    $route() {
      this.$store.dispatch('navigate', this.$route.path)
    }
  },
  computed: {
    single() {
      return this.$store.getters.single(this.$route.path)
    }
  }
}

//   methods: {
//     async createFolder() {
//       const name = prompt('Folder name')
//       if(name) {
//         const path = Path.join(this.driveBase, name)
//         await this.drive.mkdir(path)
//         this.fetch()
//       }
//     },
//     async onDrop(event) {
//     },
//     async inputFiles(event) {
//       this.uploadFiles(Array.from(event.target.files))
//       event.target.value = ''
//     },
//     async uploadFiles(files) {
//     },
//     async identifyEntry(entry) {
//       let type

//       if(entry.stat.isDirectory()) type = 'directory'

//       const ext = Path.extname(this.entry.name)

//       if(ext) type = mime.getType(ext)

//       if(!type) {
//         const buf = await this.drive.readFile(this.entry.drivePath, 'binary')
//         const found = await FileType.fromBuffer(buf)
//         type = found && found.mime
//       }

//       if(type) {
//         this.updateMetadata(entry, {type})
//       }
//     },
//   }
</script>
