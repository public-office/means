<template>
<div>
  <SingleEntry
    v-if="single && single.isFile"
    :entry="single"></SingleEntry>

  <SpatialEntries
    :single="single"></SpatialEntries>

  <footer>
    <span>{{peersText}}</span>
    <a class="pill" href="#" @click.prevent="forkDrive"><i class="material-icons">content_copy</i> fork</a>
  </footer>
</div>
</template>

<style scoped lang="scss">
footer {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 2;
  margin: var(--pad);
  display: flex;
  align-items: center;
  > span {
    display: inline-block;
    margin-right: 2rem;
  }
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
    peersText() {
      const {peers} = this.$store.state.info
      return `${peers} peer${peers != 1 ? 's' : ''}`
    },
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
