<template>
<header>
  <div>
    <h1><i class="material-icons">{{entry.icon}}</i> {{entry.path}}</h1>
    <nav>
      <a v-if="entry.isDirectory" @click.stop="createFolder" href="#">Create folder</a>
      <a v-if="entry.path !== '/'" @click.stop="deleteEntry" href="#">Delete</a>
    </nav>
  </div>
  <router-link v-if="$route.path !== '/'" class="close" :to="entry.parent">Close</router-link>
</header>
</template>

<style scoped lang="scss">
header {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  z-index: 2;
  h1 {
    i {
      font-size: 1em;
      vertical-align: middle;
      position: relative;
      top: -0.12em;
    }
  }
  nav {
    a {
      display: block;
    }
  }
}
</style>

<script>
export default {
  props: {
    entry: Object
  },
  methods: {
    createFolder() {
    },
    async deleteEntry() {
      if(confirm(`Delete ${this.entry.name}?`)) {
        this.$router.replace(this.entry.parent)
        this.$store.dispatch('deleteEntry', this.entry)
      }
    },
    async createFolder() {
      const name = prompt('Enter folder name')
      if(name) {
        this.$store.dispatch('createDirectory', {base: this.entry.driveBase, name})
      }
    }
  }
}
</script>