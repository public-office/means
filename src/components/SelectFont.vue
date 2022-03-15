<template>
  <select @change="onChange" :value="value" :name="name">
    <option disabled>Sans serif</option>
    <option :value="`system-ui, -apple-system, BlinkMacSystemFont, sans-serif`">system-ui</option>
    <option :value="`Arial, sans-serif`">Arial</option>
    <option :value="`Helvetica, sans-serif`">Helvetica</option>
    <option disabled>Serif</option>
    <option :value="`'Times New Roman', serif`">Times New Roman</option>
    <option :value="`'Georgia', serif`">Georgia</option>
    <option disabled>Monospace</option>
    <option :value="`TW, monospace`">TW</option>
    <option :value="`Courier, monospace`">Courier</option>
    <option :value="`'Courier New', monospace`">Courier New</option>
      system-ui
    </option>
  </select>
</template>

<script>
export default {
  props: {
    value: String,
    name: String
  },
  methods: {
    onChange(event) {
      this.$emit('change', event)
      this.$emit('input', event.target.value);
    },
  },
};
</script>
