<script>
  import CredentialSelection from './CredentialSelection.vue'

  export default {
    components: {
      CredentialSelection
    },

    props: {
      fields: {
        type: Object,
        required: true
      },
      data: {
        type: Object,
        required: true
      },
      forAction: {
        type: Object,
        required: false
      },
      editable: {
        type: Boolean,
        required: true,
      }
    },

    computed: {
      visibleFields() {
        return this.fields
      }
    },

    methods: {
    }
  }
</script>

<template>
  <div class="selections">
    <div v-for="(field, name) in visibleFields" :key="name">
      <CredentialSelection
        :name="name"
        :field="field"
        :config="data"
        :editable="editable"
        :for-action="forAction"></CredentialSelection>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .selections {
    margin-bottom: 1em;
  }
</style>
