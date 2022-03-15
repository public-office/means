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
  <fieldset v-if="entry.kind === 'text'">
    <label>Text options</label>
  </fieldset>
  <fieldset v-if="entry.kind === 'text'">
    <label>Font family</label>
    <select-font @change="handleSetting" name="fontFamily" :value="settings.fontFamily" />
  </fieldset>
  <fieldset v-if="entry.kind === 'text'">
    <label>Font size</label>
    <input type="number" name="fontSize" :value="settings.fontSize" @change="handleSetting" />
  </fieldset>
</form>
</template>

<style scoped lang="scss">
fieldset:last-of-type {
  margin-bottom: 0;
}
</style>

<script>
import SelectFont from './SelectFont.vue'

export default {
  components: {
    SelectFont
  },
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
      console.log(event.target.name, event.target.value)

      if(event.target.type === 'checkbox') {
        return this.updateMetadata({ [event.target.name]: event.target.checked })
      }
      if(event.target.type === 'number') {
        return this.updateMetadata({ [event.target.name]: parseInt(event.target.value) })
      }

      return this.updateMetadata({ [event.target.name]: event.target.value })
    }
  }
}
</script>