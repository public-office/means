<template>
<header>
  <div>
    <h1><i class="material-icons">{{entry.icon}}</i> {{entry.path}}</h1>
    <nav v-if="entry.path !== '/'">
      <a @click.stop="deleteEntry" href="#">Delete</a>
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
  h1 {
    i {
      font-size: 1em;
      vertical-align: middle;
      position: relative;
      top: -0.12em;
    }
  }
}
</style>

<script>
export default {
  props: {
    entry: Object
  }
}
</script>