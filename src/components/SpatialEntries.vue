<template>
<div class="spatial-entries" @dragover.prevent @drop.prevent="onDrop">
  <EntryHeader v-if="$store.getters.baseEntry" :entry="$store.getters.baseEntry"></EntryHeader>
  <div class="container">
    <div
      class="spatial-entry"
      v-for="({entry, style, resizable, draggable, dragging}) in $store.getters.spatialEntries"
      :data-entry="entry.path"
      :key="entry.path"
      :style="style"
      :class="{resizable, draggable, dragging}">
      <ViewEntry :entry="entry"></ViewEntry>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">
header {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  padding: 1rem;
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
  &.dragging {
    cursor: grabbing;
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
  computed: {
    base() {
      return this.$store.getters.base
    }
  },
  mounted() {
    interact('.spatial-entry.resizable')
      .resizable({
        edges: {top: true, bottom: true, left: true, right: true},
        modifiers: [
          interact.modifiers.aspectRatio({
            ratio: 'preserve'
          })
        ],
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
      })

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
    }
  }
}
</script>