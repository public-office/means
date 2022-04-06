<template>
<div @wheel.prevent>
  <modal v-if="$store.state.showSettings" @close="closeSettings">
    <settings></settings>
  </modal>

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
    <a href="#" class="pill" @click.stop="openSettings" v-if="$store.getters.writable">
      <i class="material-icons">settings</i> project settings
    </a>
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
    background: var(--bg);
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
  }
  > * {
    margin-left: 1rem;
  }
}
</style>

<script>
import ListEntries from './ListEntries.vue'
import SpatialEntries from './SpatialEntries.vue'
import ViewEntry from './ViewEntry.vue'
import SingleEntry from './SingleEntry.vue'
import Spinner from './Spinner.vue'
import Modal from './Modal.vue'
import Settings from './Settings.vue'
import isDarkColor from 'is-dark-color'

export default {
  components: {
    ListEntries,
    SpatialEntries,
    ViewEntry,
    SingleEntry,
    Spinner,
    Settings,
    Modal
  },
  created() {
    this.$store.dispatch('init', this.$route.path)
  },
  watch: {
    $route() {
      this.$store.dispatch('navigate', this.$route.path)
    },
    dark() {
      document.body.classList[this.dark ? 'add' : 'remove']('invert')
    }
  },
  computed: {
    dark() {
      return this.bg && isDarkColor(this.bg)
    },
    bg() {
      return this.$store.getters.baseEntry?.settings.bg
    },
    fontFamily() {
      return this.$store.getters.baseEntry?.settings.fontFamily
    },
    peersText() {
      let peers = 0
      if(this.$store.state.info.peers !== undefined) peers = this.$store.state.info.peers
      return `${peers === 0 ? 'no' : peers} peer${peers != 1 ? 's' : ''} connected`
    },
    single() {
      return this.$store.getters.single
    }
  },
  methods: {
    forkDrive() {
      this.$store.dispatch('fork')
    },
    openSettings() {
      this.$store.commit('update', {showSettings: true})
    },
    closeSettings() {
      this.$store.commit('update', {showSettings: false})
    }
  }
}
</script>
