<template>
<div class="view-entry" :class="kind">
  <!-- <router-link :to="entry.path"> -->
    <img :draggable="false" v-if="kind === 'image'" :src="entry.drivePath" @load="onLoad" />
    <video preload="metadata" v-else-if="kind === 'video'" :src="entry.drivePath" controls></video>
    <!-- <textarea class="view-entry" v-else-if="kind === 'text'" v-model="text"></textarea> -->
    <div v-else-if="kind === 'text'"><pre>{{text}}</pre></div>
    <div v-else-if="kind === 'directory'">
      <i class="material-icons">folder</i><br />
      {{entry.name}}
    </div>
    <div v-else>
      <i class="material-icons">insert_drive_file</i><br />
      {{entry.name}}
    </div>
  <!-- </router-link> -->
</div>
</template>

<style scoped lang="scss">
.view-entry {
  display: block;
  &.directory, &.file {
    text-align: center;
    i {
      font-size: 4.8rem;
    }
  }
  &.text {
    background: white;
    textarea {
      width: 100%;
    }
  }
  &.image {
    img {
      width: 100%;
      height: auto;
      display: block;
    }
  }
}
</style>

<script>
export default {
  props: {
    entry: Object
  },
  state: () => ({
    text: ''
  }),
  created() {
    this.identify()
    console.warn('type', this.type)
  },
  computed: {
    type() {
      return this.$store.getters.entryType(this.entry)
    },
    kind() {
      return this.$store.getters.entryKind(this.entry)
    },
    // text() {
    //   return this.$store.getters.entryText(this.entry)
    // }
  },
  methods: {
    identify() {
      if(!this.type) this.$store.dispatch('identifyEntry', this.entry)
    },
    onLoad(event) {
      const {entry} = this
      const {metadata} = entry.stat
      if(!metadata.width || !metadata.height) {
        const [width, height] = [event.target.naturalWidth, event.target.naturalHeight]

        this.$store.dispatch('updateMetadata', {entry, metadata: {width, height}})
      }
    }
  }
}
</script>