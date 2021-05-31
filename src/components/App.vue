<template>
<div @wheel.prevent>
  <div class="loading" v-if="$store.state.loading && $store.state.loadingTime > 0">
    <div class="message">
      <Spinner></Spinner>
      <div>Loading...</div>
    </div>
  </div>

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
.loading {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 5;
  background: rgba(255, 255, 255, 0.3);
  .message {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    box-shadow: 0 0.2rem 0.75rem rgba(0, 0, 0, 0.3);
    padding: var(--pad);
    border-radius: 0.5rem;
    text-align: center;
    width: 13rem;
    svg {
      width: 8rem;
    }
    div {
      width: 100%;
      margin-top: 2rem;
    }
  }
}
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
    margin-right: 1.5rem;
  }
}
</style>

<script>
import ListEntries from './ListEntries.vue'
import SpatialEntries from './SpatialEntries.vue'
import ViewEntry from './ViewEntry.vue'
import SingleEntry from './SingleEntry.vue'
import Spinner from './Spinner.vue'

export default {
  components: {
    ListEntries,
    SpatialEntries,
    ViewEntry,
    SingleEntry,
    Spinner
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
