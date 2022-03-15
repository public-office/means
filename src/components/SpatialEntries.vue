<template>
<div class="spatial-entries" @dragover.prevent @drop.prevent="onDrop" @click="onClickBg" :style="style" @mousewheel="onWheel">
  <EntryHeader
    v-if="!single && baseEntry"
    :entry="baseEntry"></EntryHeader>
  <div class="container">
    <div
      class="spatial-entry"
      v-for="({entry, style, resizable, draggable, dragging, aspect, selected, hover}) in $store.getters.spatialEntries"
      :data-entry="entry.path"
      :key="entry.path"
      :style="style"
      :class="{resizable, draggable, dragging, aspect, selected, hover}"
      @mouseenter="onMouseEnter(entry)"
      @mouseleave="onMouseLeave(entry)">
      <div class="handles" v-if="resizable">
        <div class="handle top right"></div>
        <div class="handle bottom right"></div>
        <div class="handle bottom left"></div>
        <div class="handle top left"></div>
      </div>
      <ViewEntry :entry="entry" @click="onClick(entry)"></ViewEntry>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">
header {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  padding: var(--pad);
  display: flex;
  justify-content: space-between;
  h1 {
    i {
      font-size: 1em;
      vertical-align: middle;
      position: relative;
      top: -0.12em;
    }
  }
}
.container {
  z-index: 1;
}
.container, .spatial-entries {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.spatial-entries {
  z-index: 1;
}
.spatial-entry {
  cursor: grab;
  &.selected {
    color: var(--highlight);
    outline: 1px solid var(--highlight)!important;
    .handle {
      border-color: var(--highlight);
    }
  }
  &.hover {
    outline: 1px solid;
  }
  &:not(.hover):not(.selected) .handle {
    display: none;
  }
  &.dragging {
    cursor: grabbing;
  }
  .handle {
    position: absolute;
    width: 0.8rem;
    height: 0.8rem;
    border: 1px solid;
    background: var(--bg);
    z-index: 2;
    &.top.left {top: 0; left: 0; transform: translate(-50%, -50%)}
    &.top.right {top: 0; right: 0; transform: translate(50%, -50%)}
    &.bottom.right {bottom: 0; right: 0; transform: translate(50%, 50%)}
    &.bottom.left {bottom: 0; left: 0; transform: translate(-50%, 50%)}
  }
}
</style>

<script>
import interact from 'interactjs'
import ViewEntry from './ViewEntry.vue'
import EntryHeader from './EntryHeader.vue'

export default {
  components: {
    EntryHeader,
    ViewEntry
  },
  props: {
    single: Object
  },
  computed: {
    base() {
      return this.$store.getters.base
    },
    baseEntry() {
      return this.$store.getters.baseEntry
    },
    settings() {
      return this.baseEntry.settings
    },
    style() {
      if(this.$store.getters.baseEntry) return {
        backgroundColor: this.baseEntry.settings.bg
      }
    }
  },
  watch: {
    'baseEntry.settings.fontFamily': function() {
      this.updateFont()
    }
  },
  mounted() {
    this.updateFont()

    const resizable = {
      edges: {top: true, bottom: true, left: true, right: true},
      listeners: {
        start: event => {
          const entry = event.target.getAttribute('data-entry')
          this.$store.dispatch('dragStart', entry)
        },
        move: event => {
          const {left, top, width, height} = event.rect
          this.$store.dispatch('dragMove', {resize: {left, top, width, height}})
        },
        end: event => {
          this.$store.dispatch('dragEnd')
        }
      }
    }

    const draggable = {
      listeners: {
        start: event => {
          const entry = event.target.getAttribute('data-entry')
          this.$store.dispatch('dragStart', entry)
        },
        move: event => {
          const {dx, dy} = event 
          if(this.$store.state.drag.entry) {
            this.$store.dispatch('dragMove', {dx, dy})
          } else {
            this.$store.dispatch('dragMove', {dx: this.settings.dragX ? dx : 0, dy: this.settings.dragY ? dy : 0})
          }
        },
        end: event => {
          this.$store.dispatch('dragEnd')
        }
      }
    }

    interact('.spatial-entry.resizable.aspect')
      .resizable({
        ...resizable,
        modifiers: [
          interact.modifiers.aspectRatio({
            ratio: 'preserve'
          })
        ],
      })

    interact('.spatial-entry.resizable:not(.aspect)')
      .resizable(resizable)

    interact('.spatial-entry.draggable')
      .styleCursor(false)
      .draggable(draggable)

    interact('.spatial-entries')
      .draggable(draggable)
  },
  methods: {
    updateFont() {
      if(this.baseEntry?.settings) {
        const {fontFamily} = this.baseEntry.settings
        document.documentElement.style.setProperty('--font-family', fontFamily)
      }
    },
    onWheel(event) {
      event.preventDefault()
      this.$store.dispatch('dragStart', null)
      this.$store.dispatch('dragMove', {dx: this.settings.scrollX ? event.deltaX : 0, dy: this.settings.scrollY ? 0 - event.deltaY : 0})
      this.$store.dispatch('dragEnd')
    },
    onDrop(event) {
      this.$store.dispatch('drop', event)
    },
    onClick(entry) {
      this.$store.dispatch('select', {entry})
    },
    onClickBg() {
      this.$store.dispatch('select', {entry: null})
    },
    onMouseEnter(entry) {
      this.$store.dispatch('hover', entry)
    },
    onMouseLeave(entry) {
      this.$store.dispatch('hover', null)
    }
  }
}
</script>