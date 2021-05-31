<template>
<div class="view-entry" :class="{[entry.kind]: true, single}" @click.stop="onClick" @dblclick="onDblclick">
  <a href="#" class="pill save" v-if="changed" @click.prevent="save">save changes</a>

  <img :draggable="false" v-if="entry.kind === 'image'" :src="entry.path" @load="onLoad" />
  <video preload="metadata" v-else-if="entry.kind === 'video'" :src="entry.path" controls></video>
  <textarea v-else-if="entry.kind === 'text'" @input="changed = true" v-model="text" :placeholder="single ? 'Write here...' : undefined"></textarea>
  <iframe v-else-if="single && entry.kind === 'pdf'" :src="src" />
  <div v-else>
    <i class="material-icons">{{entry.icon}}</i><br />
    {{entry.name}}
  </div>
</div>
</template>

<style scoped lang="scss">
.view-entry {
  display: block;
  --top: 5rem;
  .save {
    position: absolute;
    top: 0; right: 0;
    margin: var(--pad);
  }
  &.directory, &.file, &.pdf {
    text-align: center;
    i {
      font-size: 4.8rem;
    }
  }
  &.pdf.single {
    width: 100%;
    position: absolute;
    top: var(--top);
    left: 0;
    bottom: 0;
    transform: none!important;
    iframe {
      border: none;
      width: 100%;
      height: 100%;
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
      top: var(--top);
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
    &:not(.single) {
      img {
        width: 100%;
        height: auto;
        display: block;
      }
    }
    &.single {
      img {
        max-width: calc(100vw - var(--pad) * 2);
        max-height: calc(100vh - 14rem);
        object-fit: contain;
      }
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
    src: '',
    changed: false
  }),
  created() {
    this.identify()
  },
  watch: {
    entry() {
      this.getContent()
    }
  },
  async mounted() {
    this.getContent()
  },
  methods: {
    async getContent() {
      if(this.entry.kind === 'text') this.text = await this.$store.getters.getEntryText(this.entry)
      if(this.single && this.entry.kind === 'pdf') {
        this.src = await this.$store.getters.getEntryContent(this.entry)
      }
    },
    onClick() {},
    onDblclick() {
      if(this.$route.path !== this.entry.link) this.$router.push(this.entry.link)
    },
    identify() {
      if(!this.entry.type) this.$store.dispatch('identifyEntry', this.entry)
    },
    onLoad(event) {
      const {entry} = this
      const {metadata} = entry.stat

      if(!metadata.width || !metadata.height) {
        let [width, height] = [event.target.naturalWidth, event.target.naturalHeight]
        const [maxWidth, maxHeight] = [640, 640]

        if(width > maxWidth) {
          height *= maxWidth / width
          width = maxWidth
        }
        if(height > maxHeight) {
          width *= maxHeight / height
          height = maxHeight
        }

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