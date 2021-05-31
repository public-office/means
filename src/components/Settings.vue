<template>
<div>
  <div class="settings">
    <a class="close" href="#" @click.prevent="close">&times;</a>
    <div>
      <form @submit.prevent>
        <fieldset>
          <label>Title</label>
          <input type="text" v-model="title" placeholder="Untitled" />
        </fieldset>

        <button class="pill" @click="save">Save</button>
      </form>
    </div>
  </div>
  <div class="bg" @click="close"></div>
</div>
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
    },
    close() {
      this.$store.commit('update', {showSettings: false})
    }
  }
}
</script>

<style scoped lang="scss">
.settings {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  box-shadow: 0 0.2rem 0.75rem rgba(0, 0, 0, 0.3);
  padding: var(--pad);
  border-radius: 0.5rem;
  z-index: 11;
  width: 100%;
  max-width: 30rem;
}
.close {
  position: absolute;
  top: 0; right: 0;
  margin: var(--pad);
}
.bg {
  position: fixed;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}
</style>