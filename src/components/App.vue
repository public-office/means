<template>
<div>
  <SingleEntry
    v-if="single && single.isFile"
    :entry="single"></SingleEntry>

  <SpatialEntries
    :single="single"></SpatialEntries>

  <footer>
    <a class="pill" href="#" @click.prevent="forkDrive"><i class="material-icons">content_copy</i> fork</a>
  </footer>
</div>
</template>

<style scoped>
footer {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 2;
  margin: var(--pad);
}
</style>

<script>
import ListEntries from './ListEntries.vue'
import SpatialEntries from './SpatialEntries.vue'
import ViewEntry from './ViewEntry.vue'
import SingleEntry from './SingleEntry.vue'

export default {
  components: {
    ListEntries,
    SpatialEntries,
    ViewEntry,
    SingleEntry
  },
  created() {
    this.$store.dispatch('init', this.$route.path)
  },
  watch: {
    $route() {
      this.$store.dispatch('navigate', this.$route.path)
    }
  },
  computed: {
    single() {
      return this.$store.getters.single(this.$route.path)
    }
  },
  methods: {
    forkDrive() {
      this.$store.dispatch('fork')
    }
  }
}
</script>
