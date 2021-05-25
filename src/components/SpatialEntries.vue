<template>
<div class="spatial-entries" @dragover.prevent @drop.prevent="onDrop">
  <div
    class="spatial-entry"
    v-for="({entry, style, resizable, draggable, dragging}) in $store.getters.spatialEntries"
    :data-entry="entry.name"
    :key="entry.name"
    :style="style"
    :class="{resizable, draggable, dragging}">
    <ViewEntry :entry="entry"></ViewEntry>
  </div>
</div>
</template>

<style scoped lang="scss">
.spatial-entries {
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

export default {
  components: {
    ViewEntry
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