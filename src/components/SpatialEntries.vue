<template>
<div class="spatial-entries" @dragover.prevent @drop.prevent="onDrop" @click="onClickBg">
  <EntryHeader
    v-if="!single && $store.getters.baseEntry"
    :entry="$store.getters.baseEntry"></EntryHeader>
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
.spatial-entry {
  cursor: grab;
  &.selected {
    outline: 1px solid blue!important;
    .handle {
      border-color: blue;
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
    background: white;
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
    }
  },
  mounted() {
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
      .draggable({
        listeners: {
          start: event => {
            const entry = event.target.getAttribute('data-entry')
            this.$store.dispatch('dragStart', entry)
          },
          move: event => {
            const {dx, dy} = event 
            this.$store.dispatch('dragMove', {dx, dy})
          },
          end: event => {
            this.$store.dispatch('dragEnd')
          }
        }
      })
  },
  methods: {
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