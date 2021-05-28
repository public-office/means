<template>
<div class="view-entry" :class="{[entry.kind]: true, single}" @click="onClick" @dblclick="onDblclick">
  <img :draggable="false" v-if="entry.kind === 'image'" :src="entry.drivePath" @load="onLoad" />
  <video preload="metadata" v-else-if="entry.kind === 'video'" :src="entry.drivePath" controls></video>
  <!-- <textarea class="view-entry" v-else-if="kind === 'text'" v-model="text"></textarea> -->
  <textarea v-else-if="entry.kind === 'text'" v-model="text"></textarea>
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
    &:not(.single) {
      border: 1px solid;
      height: 100%;
      textarea {
        pointer-events: none;
      }
    }
    &.single {
      width: 100%;
      position: absolute;
      top: 5rem;
      left: 0;
      bottom: 0;
      transform: none!important;
      border-top: 1px solid;
    }
    textarea {
      display: block;
      height: 100%;
      width: 100%;
      resize: none;
      padding: var(--pad);
      font-family: monospace;
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
    entry: Object,
    single: Boolean
  },
  data: () => ({
    text: ''
  }),
  created() {
    this.identify()
  },
  async mounted() {
    if(this.entry.kind) {
      this.text = await this.$store.getters.getEntryText(this.entry)
    }
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