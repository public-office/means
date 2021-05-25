<template>
<div>
  <div v-if="parent !== base"><router-link :to="parent">..</router-link></div>
  <div v-for="entry in entries" :key="entry.name">
    <router-link :to="entry.path">
      {{entry.stat.isDirectory() ? '📁' : '📄'}} {{entry.name}}
    </router-link>
  </div>
</div>
</template>

<script>
export default {
  props: {
    entries: Array,
    base: String,
    parent: String
  }
}
</script>