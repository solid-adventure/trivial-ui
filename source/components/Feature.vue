<template>
  <div v-if="enabled">
    <slot></slot>
  </div>
</template>

<script>
  import FeatureManager from 'trivial-core/lib/FeatureManager'

  export default {
    props: {
      name: {
        type: String,
        required: true
      }
    },

    computed: {
      enabled() {
        return FeatureManager.isEnabled(this.name)
      }
    }
  }
</script>
