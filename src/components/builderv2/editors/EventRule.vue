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
    <!-- <EditorOverview :value="action"></EditorOverview> -->

    <div class="field">
      <label :for="`action_${action.identifier}_name`">Rule Name</label>
      <input type="text" :id="`action_${action.identifier}_name`" v-model="action.name" placeholder="My Rule Name">
    </div>

    <EditorConfig :value="action" :credentials="credentials"></EditorConfig>
    <EditorDefinition
      :value="action"
      :credentials="credentials"
      :nextIdentifier="nextIdentifier"
      @edit="edit"></EditorDefinition>
    <EditorAdvanced :value="action"></EditorAdvanced>
  </div>
</template>

<style lang="scss" scoped>
</style>
