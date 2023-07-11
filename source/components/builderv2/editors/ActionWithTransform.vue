<script>
  import ActionDescriptors from 'trivial-core/lib/actionsv2/catalog/ActionDescriptors'
  import EditorOverview from '../EditorOverview.vue'
  import EditorConfig from '../EditorConfig.vue'
  import EditorDefinition from '../EditorDefinition.vue'
  import EditorAdvanced from '../EditorAdvanced.vue'
  import HideableSection from '../../controls/HideableSection.vue'
  import CustomFields from '../CustomFields.vue'
  import { mapGetters, mapMutations, mapState } from 'vuex'

  export default {
    components: {
      EditorOverview,
      EditorConfig,
      EditorDefinition,
      EditorAdvanced,
      HideableSection,
      CustomFields
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

    watch: {
      'value.definition.actions.1.name': function() {
        this.value.name = this.action.name || this.actionDescriptor.name
      },

      'value.definition.actions.1.enabled': function() {
        // We disable the action itself, but also need to disable the Transform and the ActionWithTransform
        this.transform.enabled = this.action.enabled
        this.value.enabled = this.action.enabled
      }

    },

    computed: {
      action() {
        return this.value.definition.actions[1]
      },

      transform() {
        return this.value.definition.actions[0]
      },

      allowFieldCreation() {
        return this.actionDescriptor.allowFieldCreation
      },

      actionDescriptor() {
        return ActionDescriptors.forType(this.action.type)
      },

      actionCredentialType() {
        return this.actionDescriptor.getCredentialTypes()
      },

      transformDescriptor() {
        return ActionDescriptors.forType(this.transform.type)
      },

      transformDefinitionFields() {
        return {
          transformations: this.transformDescriptor.definitionFields.transformations
        }
      },

      advancedSettings() {
        const action = this.action
        const transform = this.transform
        return {
          get identifier() { return action.identifier },

          get name() { return action.name },

          set name(value) { action.name = value },

          get inputName() { return transform.inputName },

          set inputName(value) { transform.inputName = value },

          get outputName() { return action.outputName },

          set outputName(value) { action.outputName = value }
        }
      },

      ...mapGetters([
        'hasCredentialSetForActionType',
        'hiddenByTour'
      ]),

      ...mapState([
        'tourMode',
        'tourStep'
      ])
    },

    methods: {

      edit(action) {
        this.$emit('edit', action)
      },

      ...mapMutations([
        'incrementTour',
      ])

    }

  }
</script>

<template>
  <div>
    <EditorOverview :value="action"></EditorOverview>
    <EditorDefinition
      :value="action"
      :credentials="credentials"
      :nextIdentifier="nextIdentifier"
      @edit="edit"></EditorDefinition>
    <HideableSection v-if="!hiddenByTour('credentials')" :initially-hidden="false" display-name="Credentials">
      <EditorConfig :value="action" :credentials="credentials"></EditorConfig>
    </HideableSection>
      <div class="transform-fields">
        <CustomFields
          :fields="transformDefinitionFields"
          :data="transform.definition"
          :credentials="credentials"
          :context="transform"
          :allowFieldCreation="allowFieldCreation"
          ></CustomFields>
        </div>
    <EditorAdvanced :value="advancedSettings"></EditorAdvanced>
  </div>
</template>

<style lang="scss" scoped>
  h3.transform {
    margin-bottom: 0;
  }

  .transform-fields {
    padding: 1px 0;
  }
</style>
