<template>
<form @submit.prevent>
  <fieldset>
    <label>Background colour</label>
    <input type="color" v-model="bg" class="color" />
    <button class="pill small" @click="bg = '#ffffff'">reset</button>
  </fieldset>
  <fieldset>
    <label>Font</label>
    <select-font v-model="fontFamily" />
  </fieldset>
  <fieldset>
    <label>Dragging</label>
    <label class="check"><input type="checkbox" name="dragX" :checked="settings.dragX" @change="handleSetting" /> Horizontal</label>
    <label class="check"><input type="checkbox" name="dragY" :checked="settings.dragY" @change="handleSetting" /> Vertical</label>
  </fieldset>
  <fieldset>
    <label>Scrolling</label>
    <label class="check"><input type="checkbox" name="scrollX" :checked="settings.scrollX" @change="handleSetting" /> Horizontal</label>
    <label class="check"><input type="checkbox" name="scrollY" :checked="settings.scrollY" @change="handleSetting" /> Vertical</label>
  </fieldset>
</form>
</template>

<style scoped lang="scss">
.color {
  position: relative;
  top: 0.4rem;
  margin-right: 0.4rem;
}
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
    baseEntry() {
      return this.$store.getters.baseEntry
    },
    bg: {
      get() {
        return this.settings.bg
      },
      set(bg) {
        this.updateMetadata({bg})
      }
    },
    fontFamily: {
      get() {
        return this.settings.fontFamily
      },
      set(fontFamily) {
        this.updateMetadata({fontFamily})
      }
    },
    settings() {
      return this.baseEntry.settings
    }
  },
  methods: {
    updateMetadata(metadata) {
      this.$store.dispatch('updateMetadata', {entry: {path: this.baseEntry.path}, metadata, base: true})
    },
    handleSetting(event) {
      if(event.target.type === 'checkbox') {
        this.updateMetadata({ [event.target.name]: event.target.checked })
      }
    }
  }
}
</script>