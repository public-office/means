<template>
<div>
  <div class="modal">
    <a class="close" href="#" @click.stop.prevent="close">&times;</a>
    <div>
      <slot />
    </div>
  </div>
  <div class="bg" @click.stop="close"></div>
</div>
</template>

<script>
export default {
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss">
.modal {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg);
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
  font-size: 2rem;
  line-height: 0.6;
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