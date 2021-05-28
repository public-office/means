<template>
<div class="view-entry" :class="entry.kind" @click="onClick" @dblclick="onDblclick">
  <img :draggable="false" v-if="entry.kind === 'image'" :src="entry.drivePath" @load="onLoad" />
  <video preload="metadata" v-else-if="entry.kind === 'video'" :src="entry.drivePath" controls></video>
  <!-- <textarea class="view-entry" v-else-if="kind === 'text'" v-model="text"></textarea> -->
  <div v-else-if="entry.kind === 'text'"><pre>{{text}}</pre></div>
  <div v-else-if="entry.kind === 'directory'">
    <i class="material-icons">folder</i><br />
    {{entry.name}}
  </div>
  <div v-else>
    <i class="material-icons">insert_drive_file</i><br />
    {{entry.name}}
  </div>
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
  },
  methods: {
    onClick() {},
    onDblclick() {
      if(this.$route.path !== this.entry.path) this.$router.push(this.entry.path)
    },
    identify() {
      if(!this.entry.type) this.$store.dispatch('identifyEntry', this.entry)
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