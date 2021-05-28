<template>
<div class="single">
  <header>
    <div>
      <h1><i class="material-icons">{{entry.icon}}</i> {{entry.name}}</h1>
      <nav>
        <a href="#">Delete</a>
      </nav>
    </div>
    <pre>{{entry}}</pre>
    <router-link class="close" to="/">Close</router-link>
  </header>
  <ViewEntry :entry="entry"></ViewEntry>
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

export default {
  components: {
    ViewEntry
  },
  props: {
    entry: Object
  }
}
</script>
