<template>
<div class="view-entry" :class="{[entry.kind]: true, single}" @click="onClick" @dblclick="onDblclick">
  <a href="#" class="save" v-if="changed" @click.prevent="save">Save</a>

  <img :draggable="false" v-if="entry.kind === 'image'" :src="entry.drivePath" @load="onLoad" />
  <video preload="metadata" v-else-if="entry.kind === 'video'" :src="entry.drivePath" controls></video>
  <textarea v-else-if="entry.kind === 'text'" @input="changed = true" v-model="text" :placeholder="single ? 'Write here...' : undefined"></textarea>
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
  .save {
    position: absolute;
    top: 0; right: 0;
    margin: var(--pad);
  }
  &.directory, &.file {
    text-align: center;
    i {
      font-size: 4.8rem;
    }
  }
  &.text {
    box-shadow: 0 0.2rem 0.75rem rgba(0, 0, 0, 0.3);
    &:not(.single) {
      height: 100%;
      background: white;
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
    text: '',
    changed: false
  }),
  created() {
    this.identify()
  },
  watch: {
    entry() {
      this.getText()
    }
  },
  async mounted() {
    this.getText()
  },
  methods: {
    async getText() {
      if(this.entry.kind === 'text') {
        this.text = await this.$store.getters.getEntryText(this.entry)
      }
    },
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
    },
    async save() {
      const {entry, text} = this
      await this.$store.dispatch('updateText', {entry, text})
      this.changed = false
    }
  }
}
</script>