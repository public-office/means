<template>
<form @submit.prevent>
  <fieldset>
    <label>Title</label>
    <input type="text" v-model="title" placeholder="Untitled" />
  </fieldset>

  <button class="pill" @click="save">Save</button>
</form>
</template>

<script>
export default {
  data: () => ({
    title: ''
  }),
  mounted() {
    this.title = this.$store.getters.title
  },
  methods: {
    save() {
      this.$store.dispatch('updateTitle', this.title)
    }
  }
}
</script>

<style scoped lang="scss">
</style>