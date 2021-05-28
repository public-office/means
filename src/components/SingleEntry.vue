<template>
<div class="single">
  <EntryHeader :entry="entry"></EntryHeader>
  <ViewEntry :entry="entry"></ViewEntry>
</div>
</template>

<style scoped lang="scss">
.single {
  position: absolute;
  top: 0; left: 0;
  background: rgba(255, 255, 255, 0.9);
  width: 100%; height: 100%;
  z-index: 3;
}
.view-entry {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  max-width: 100vw;
  max-height: 100vh;
}
figcaption {
  margin-top: 0.7rem;
}
</style>

<script>
import ViewEntry from './ViewEntry.vue'
import EntryHeader from './EntryHeader.vue'

export default {
  components: {
    ViewEntry,
    EntryHeader
  },
  props: {
    entry: Object
  },
    methods: {
    async deleteEntry() {
      if(confirm(`Delete ${this.entry.name}?`)) {
        this.$router.replace(this.entry.base)
        this.$store.dispatch('deleteEntry', this.entry)
      }
    }
  }
}
</script>
