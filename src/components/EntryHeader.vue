<template>
<header>
  <div class="main">
    <router-link v-if="$route.path !== '/'" class="back pill" :to="entry.parent">
      <i class="material-icons">arrow_back</i>
    </router-link>
    <h1><i class="material-icons">{{entry.icon}}</i> {{entry.displayPath}}</h1>
  </div>
  <nav class="right">
    <a class="pill" v-if="entry.isDirectory" @click.stop="createFolder" href="#"><i class="material-icons">folder</i> add folder</a>
    <a class="pill" v-if="entry.isDirectory" @click.stop="createText" href="#"><i class="material-icons">description</i> add text</a>
    <a class="pill" v-if="entry.path !== '/'" @click.stop="deleteEntry" href="#"><i class="material-icons">delete</i> delete {{entry.form}}</a>
  </nav>
</header>
</template>

<style scoped lang="scss">
header {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  padding: var(--pad);
  display: flex;
  justify-content: space-between;
  z-index: 2;
  .main {
    display: flex;
    align-items: flex-start;
    .back {
      margin-right: 1em;
    }
  }
  h1 {
    font-size: 2rem;
    margin-top: 0.4rem;
    i {
      vertical-align: middle;
      position: relative;
      top: -0.07em;
      margin-right: 0.3rem;
    }
  }
  .close {
    margin-left: 2em;
    svg {
      width: auto;
      height: 0.9em;
      position: relative;
      top: 0.1rem;
      line {
        stroke: currentColor;
        vector-effect: non-scaling-stroke;
      }
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
    },
    async createText() {
      const entry = await this.$store.dispatch('createText', {base: this.entry.base, driveBase: this.entry.driveBase})
      this.$router.push(entry.path)
    }
  }
}
</script>