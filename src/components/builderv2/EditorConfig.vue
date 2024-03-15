
<script>
  import ActionDescriptors from 'trivial-core/lib/actionsv2/catalog/ActionDescriptors'
  import ConfigResolver from 'trivial-core/lib/ConfigResolver'
  import ActionButton from '../controls/ActionButton.vue'
  import CredentialSelections from './CredentialSelections.vue'
  import CustomFields from './CustomFields.vue'
  import HideableSection from '../controls/HideableSection.vue'
  import { mapState } from 'vuex'

  export default {
    components: {
      ActionButton,
      CredentialSelections,
      CustomFields,
      HideableSection
    },

    props: {
      value: {
        type: Object,
        required: true
      },
      credentials: {
        type: Object,
        required: true
      }
    },

    computed: {
      action() {
        return this.value
      },

      descriptor() {
        return ActionDescriptors.forType(this.action.type)
      },

      hasConfig() {
        return Object.keys(this.descriptor.configFields || {})
          .filter(field => ! this.descriptor.configFields[field].hidden)
          .length > 0
      },

      configResolver() {
        return new ConfigResolver(this.credentials)
      },

      configForAction() {
        return this.configResolver.resolve(this.action.config)
      },

      configActions() {
        return this.descriptor.configActions(this.configForAction)
      },

      usesVault() {
        return Object.keys(this.descriptor.credentialTypes || {}).length > 0
      },

      ...mapState([
        'playgroundMode'
      ])

    },

    methods: {
      actionPerformer(action) {
        return () => action(this.configForAction, {
          action: `action/${this.action.type || 'Group'}/${this.action.identifier}`,
          manifest: this.$store.state.manifest,
          credentials: this.credentials
        })
      },

      credentialsEditable() {
        if (this.playgroundMode) { return true }
        return this.$store.state.manifest.owner_id == this.$store.state.user.id
      }

    }
  }
</script>

<template>
  <div class="credentials-container">
    <div v-if="usesVault">
      <CredentialSelections
        :editable="credentialsEditable()"
        :fields="descriptor.credentialTypes"
        :data="action.config"
        :for-action="action"></CredentialSelections>

    </div>
    <div v-if="hasConfig">
      <HideableSection display-name="Config" class="editor-config">
        <CustomFields
          :fields="descriptor.configFields"
          :data="action.config"
          :credentials="credentials"></CustomFields>
        <div v-for="(action, label) in configActions" class="config-action">
          <ActionButton
            class="button-small"
            :value="label"
            :action="actionPerformer(action)"></ActionButton>
        </div>
      </HideableSection>
    </div>
  </div>
</template>

<style lang="scss" scoped>

  .credentials-container {
    padding-right: 1.5em;
  }

</style>
