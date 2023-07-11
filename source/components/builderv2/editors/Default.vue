<script>
  import EditorOverview from '../EditorOverview.vue'
  import EditorConfig from '../EditorConfig.vue'
  import EditorDefinition from '../EditorDefinition.vue'
  import EditorAdvanced from '../EditorAdvanced.vue'
  import HideableSection from '../../controls/HideableSection.vue'

  export default {
    components: {
      EditorOverview,
      EditorConfig,
      EditorDefinition,
      HideableSection,
      EditorAdvanced
    },

    props: {
      value: {
        type: Object,
        required: true
      },
      credentials: {
        type: Object,
        required: true
      },
      nextIdentifier: {
        type: Number,
        required: true
      }
    },

    computed: {
      action() {
        return this.value
      }
    },

    methods: {
      edit(action) {
        this.$emit('edit', action)
      }
    }

  }
</script>

<template>
  <div>
    <EditorOverview :value="action"></EditorOverview>
    <EditorConfig :value="action" :credentials="credentials"></EditorConfig>
    <HideableSection :initially-hidden="false" display-name="Settings">
      <EditorDefinition
        :value="action"
        :credentials="credentials"
        :nextIdentifier="nextIdentifier"
        @edit="edit"></EditorDefinition>
    </HideableSection>
    <EditorAdvanced :value="action"></EditorAdvanced>
  </div>
</template>

<style lang="scss" scoped>
</style>
