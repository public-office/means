<template>
<form @submit.prevent>
  <fieldset v-if="entry.kind === 'video'">
    <label>Video options</label>
    <label class="check"><input type="checkbox" name="controls" :checked="settings.controls" @change="handleSetting" /> Show controls</label>
    <label class="check"><input type="checkbox" name="autoplay" :checked="settings.autoplay" @change="handleSetting" /> Autoplay</label>
    <label class="check"><input type="checkbox" name="muted" :checked="settings.muted" @change="handleSetting" /> Muted</label>
    <label class="check"><input type="checkbox" name="loop" :checked="settings.loop" @change="handleSetting" /> Loop</label>
  </fieldset>
  <fieldset v-if="entry.kind === 'audio'">
    <label>Audio options</label>
    <label class="check"><input type="checkbox" name="autoplay" :checked="settings.autoplay" @change="handleSetting" /> Autoplay</label>
    <label class="check"><input type="checkbox" name="loop" :checked="settings.loop" @change="handleSetting" /> Loop</label>
  </fieldset>
</form>
</template>

<style scoped lang="scss">
fieldset:last-of-type {
  margin-bottom: 0;
}
</style>

<script>
export default {
  computed: {
    entry() {
      return this.$store.getters.entry
    },
    settings() {
      return this.entry.settings
    }
  },
  methods: {
    updateMetadata(metadata) {
      this.$store.dispatch('updateMetadata', {entry: {path: this.entry.path}, metadata, base: true})
    },
    handleSetting(event) {
      if(event.target.type === 'checkbox') {
        this.updateMetadata({ [event.target.name]: event.target.checked })
      }
    }
  }
}
</script>