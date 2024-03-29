<template>
<div class="view-entry" :class="{[entry.kind]: true, single, loading, visual: entry.visual}" @click.stop="onClick" @dblclick="onDblclick">
  <div v-if="loading" class="loading-spinner">
    <Spinner></Spinner>
  </div>

  <a href="#" class="pill save" v-if="single && changed" @click.prevent="save">save changes</a>

  <img class="yield" :draggable="false" v-if="entry.kind === 'image'" :src="entry.path" @load="onLoad" />
  <video class="yield" preload="metadata" v-else-if="entry.kind === 'video'" :src="entry.path" @loadedmetadata="onLoad" :controls="entry.settings.controls" :muted="entry.settings.muted" :autoplay="entry.settings.autoplay" :loop="entry.settings.loop"></video>
  <audio class="yield" v-else-if="entry.kind === 'audio' && single" :src="entry.path" controls :autoplay="entry.settings.autoplay" :loop="entry.settings.loop"></audio>
  <textarea class="yield" v-else-if="entry.kind === 'text'" @input="changed = true" v-model="text" :placeholder="single ? 'Write here...' : undefined" @wheel.stop :autofocus="single && $store.getters.writable" :style="textStyle"></textarea>
  <iframe class="yield" v-else-if="single && entry.kind === 'pdf'" :src="src" />
  <div v-else>
    <i class="material-icons">{{entry.icon}}</i><br />
    <div class="name">{{entry.name}}</div>
  </div>
</div>
</template>

<style scoped lang="scss">
.view-entry {
  display: block;
  --top: 4.8rem;
  .save {
    position: absolute;
    top: 0; right: 0;
    margin: var(--pad);
  }
  .loading-spinner {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: var(--bg);
    z-index: 1;
    .spinner {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 2rem;
    }
  }
  &.loading {
    .yield {
      opacity: 0;
    }
  }
  &:not(.single):not(.visual) {
    text-align: center;
    padding: 0.2rem 0.5rem 0.5rem;
    max-width: 13em;
    word-break: break-word;
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
  &.loading.visual {
    box-shadow: 0 0.2rem 0.75rem rgba(0, 0, 0, 0.3);
  }
  &.loading {
    background: var(--bg);
  }
  &.text {
    &:not(.single) {
      height: 100%;
      background: var(--bg);
      color: var(--fg);
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
      background: var(--bg);
      box-shadow: 0 0 0.5rem var(--shadow);
    }
    textarea {
      display: block;
      height: 100%;
      width: 100%;
      resize: none;
      padding: var(--pad);
      font-family: 'TW', monospace;
      color: var(--fg);
    }
  }
  &.video {
    video {
      width: 100%;
      height: auto;
      display: block;
    }
    &.single video {
      max-width: calc(100vw - var(--pad) * 2);
      max-height: calc(100vh - 14rem);
      object-fit: contain;
      width: 100%;
      height: 100%;
    }
  }
  &.image {
    img {
      display: block;
    }
    &:not(.single) img {
      width: 100%;
      height: auto;
    }
    &.single img {
      max-width: calc(100vw - var(--pad) * 2);
      max-height: calc(100vh - 14rem);
      object-fit: contain;
      width: 100%;
      height: 100%;
    }
  }
}
</style>

<script>
import Spinner from './Spinner.vue'

export default {
  components: {
    Spinner
  },
  props: {
    entry: Object,
    single: Boolean
  },
  data: () => ({
    text: '',
    src: '',
    changed: false,
    loading: false
  }),
  created() {
    this.identify()
  },
  watch: {
    entry() {
      this.getContent()
    }
  },
  created() {
    if(this.entry.visual) this.loading = true
  },
  async mounted() {
    this.getContent()
  },
  computed: {
    settings()  {
      return this.entry.settings
    },
    textStyle() {
      return {
        fontFamily: this.settings.fontFamily,
        fontSize: this.settings.fontSize+'px'
      }
    }
  },
  methods: {
    async getContent() {
      if(this.entry.kind === 'text') {
        this.text = await this.$store.getters.getEntryText(this.entry)
        this.loading = false
      }
      if(this.single && this.entry.kind === 'pdf') {
        this.src = await this.$store.getters.getEntryContent(this.entry)
        this.loading = false
      }
    },
    onClick() {
      if(!this.$store.state.interacting) this.$emit('click')
    },
    onDblclick() {
      if(this.$route.path !== this.entry.link) this.$router.push(this.entry.link)
    },
    identify() {
      if(!this.entry.type) this.$store.dispatch('identifyEntry', this.entry)
    },
    onLoad(event) {
      this.loading = false
      
      const {entry} = this

      if(!['image', 'video'].includes(entry.kind)) return

      const {metadata} = entry.stat

      const [maxWidth, maxHeight] = [640, 640]

      if(!metadata.width || !metadata.height) {
        let [width, height] = [0, 0]

        if(entry.kind === 'image') {
          width = event.target.naturalWidth
          height = event.target.naturalHeight
        } else if(entry.kind === 'video') {
          width = event.target.videoWidth
          height = event.target.videoHeight
        }

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