<template>
<div class="outer" @click.prevent="onClickBg">
  <div class="bg"></div>
  <EntryHeader :entry="entry"></EntryHeader>
  <ViewEntry :entry="entry" single></ViewEntry>
</div>
</template>

<style scoped lang="scss">
.outer {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 3;
  backdrop-filter: blur(2px);
}
.bg {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 0;
  background-color: var(--bg);
  opacity: 0.5;
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
    onClickBg() {
      if(this.$route.path !== '/') this.$router.push(this.entry.parent)
    }
  }
}
</script>
