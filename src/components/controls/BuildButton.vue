<template>
  <ActionButton
    ref="saveBtn"
    class="button-medium rebuild-button"
    :class="{dimmed: !dirty}"
    :value="label"
    working-value="Saving..."
    :action="save"></ActionButton>
</template>

<style lang="scss" scoped>
  .rebuild-button {
    margin: 0.5em 2em 0.5em;
  }

</style>

<script>
  import ActionButton from './ActionButton.vue'
  import notifications from '../notifications'
  import TrackingService from '../../../lib/TrackingService'
  import { mapActions } from 'vuex'

  export default {
    components: {
      ActionButton
    },

    data() {
      return {
        manifestDirty: true,
        unwatchManifest: null,
        credentialsDirty: true,
        unwatchCredentials: null
      }
    },

    mounted() {
      this.$store.state.keyboardControl.register('command-s', "Save & Build", this.syntheticSaveClick.bind(this))
    },

    created() {
      this.onManifestLoaded(() => this.manifestLoaded())
      this.onCredentialsLoaded(() => this.credentialsLoaded())
    },

    computed: {
      dirty() {
        return this.manifestDirty || this.credentialsDirty
      },

      label() {
        return this.dirty ? 'Save <span class="shortcut">⌘ + S</span>' : 'Saved'
      },

    },

    methods: {

      // Action button listens for a click event to update it's working status, so we simulate a click
      syntheticSaveClick() {
        this.$refs.saveBtn.click()
      },

      async save() {
        try {
          this.$emit('update:buildInProgress', true)
          await this.saveAndBuild()
          notifications.success('Application built!')
          this.$emit('update:dirty', false)
          this.$emit('update:buildInProgress', false)
          TrackingService.track('Saved App', {
            'ManifestId': this.$store.state.manifest.id
          })
        } catch (error) {
          console.error('[BuildButton][save] Error:', error)
          notifications.error(`Failed to build application: ${error.message}`)
          this.$emit('update:buildInProgress', false)
        }
      },

      manifestLoaded() {
        if (this.unwatchManifest) {
          this.unwatchManifest()
        }
        this.manifestDirty = false
        this.unwatchManifest = this.$store.watch(
          state => state.manifest.content,
          () => this.manifestChanged(),
          {deep: true}
        )
      },

      manifestChanged() {
        this.manifestDirty = true
        this.$emit('update:dirty', true)
      },

      credentialsLoaded() {
        if (this.unwatchCredentials) {
          this.unwatchCredentials()
        }
        this.credentialsDirty = false
        this.unwatchCredentials = this.$store.watch(
          state => state.credentials,
          () => this.credentialsChanged(),
          {deep: true}
        )
      },

      credentialsChanged() {
        this.credentialsDirty = true
        this.$emit('update:dirty', true)
      },

      ...mapActions([
        'saveAndBuild',
        'onManifestLoaded',
        'onCredentialsLoaded'
      ])
    }
  }
</script>
