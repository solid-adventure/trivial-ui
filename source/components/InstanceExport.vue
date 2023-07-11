<template>
  <div class="InstanceExport">
    <Notices></Notices>
    <h2 class="headroom section-title">Source Code Download</h2>
    <p class="section-help-text"><em>Download the latest build of your application.</em></p>
    <a class="button-small" :href="downloadLink" download @click="downloaded">Download</a>

    <h2 class="headroom section-title">Environment Variables</h2>
    <p class="section-help-text"><em>The following are the environment variables currently set for the application.</em></p>
    <div class="environment well">
      <CopyButton class="copy" :value="envVarsText"></CopyButton>
      <div v-for="v in envVars" :key="v.name"><strong>{{v.name}}</strong> = {{v.show}}</div>
    </div>
    <ActionButton
      v-if="hasCredentialReferences && !credentials"
      class="button-small"
      value="Reveal Credentials"
      workingValue="Loading Credentials"
      :action="showCredentials"></ActionButton>
    <button
      v-if="credentials"
      class="button-small"
      @click="credentials = null">Hide Credentials</button>
  </div>
</template>

<style lang="scss" scoped>
  .InstanceExport {
    height: 100%;
    margin: 2em;
  }

  .section-title {
    margin-bottom: 0;
  }

  p.section-help-text {
    margin-top: 0;
  }

  .section-end {
    padding-bottom: 4em;
  }

  .environment {
    position: relative;

    .copy {
      position: absolute;
      top: 1em;
      right: 1em;
      background-color: transparent;
    }
  }
</style>

<script>
  import ActionButton from './controls/ActionButton.vue'
  import CopyButton from './controls/CopyButton.vue'
  import Notices from './Notices.vue'
  import { fetchJSON, debounce } from 'trivial-core/lib/component-utils'
  import notifications from './notifications'
  import ManifestMigrator from 'trivial-core/lib/ManifestMigrator'
  import { track } from '../../lib/TrackingService'
  import FeatureManager from 'trivial-core/lib/FeatureManager'

  export default {
    inject: ['appId'],

    props: {
      revealDuration: {
        type: Number,
        default: 30000
      }
    },

    components: {
      ActionButton,
      CopyButton,
      Notices
    },

    data() {
      return {
        manifest: {},
        manifestContent: {},
        credentials: null
      }
    },

    async created() {
      await this.loadManifest()
    },

    computed: {
      logToUrl() {
        if (this.manifestContent.log_to) {
          const log_to = this.manifestContent.log_to
          return `${log_to.host}:${log_to.port}${log_to.path}`
        } else {
          return ''
        }
      },

      logToVerb() {
        return (this.manifestContent.log_to || {}).verb || ''
      },

      envVars() {
        const processors = this.manifestContent.processors || []
        const output = [
          {name: 'APP_ID', value: this.appId, show: this.appId},
          {name: 'LOG_TO_URL', value: this.logToUrl, show: this.logToUrl},
          {name: 'LOG_TO_VERB', value: this.logToVerb, show: this.logToVerb}
        ]

        processors.forEach(proc => {
          proc.actions.forEach(action => {
            for (let [key, value] of Object.entries(action.config)) {
              if ('object' === typeof value && value.hasOwnProperty('$ref')) {
                const base = `${action.perform}_${key}`.toUpperCase()
                let name = base
                let idx = 0
                while (output.find(o => o.name === name) !== undefined) {
                  name = `${base}_${++idx}`
                }
                if (this.credentials) {
                  const realValue = this.credentials[value.$ref[0]][value.$ref[1]]
                  output.push({name: name, show: realValue, value: realValue})
                } else {
                  output.push({name: name, show: '**********'})
                }
              }
            }
          })
        })

        return output
      },

      envVarsText() {
        return this.envVars.map(v => {
          if (v.value) {
            return `${v.name}=${JSON.stringify(v.value)}`
          } else {
            return `${v.name}=`
          }
        }).join("\n")
      },

      hasCredentialReferences() {
        const proc = (this.manifestContent.processors || []).find(proc => {
          return proc.actions.find(action => {
            return [...Object.entries(action.config)].find(entry => {
              const value = entry[1]
              return 'object' === typeof value && value.hasOwnProperty('$ref')
            }) !== undefined
          }) !== undefined
        })

        return proc !== undefined
      },

      downloadLink() {
        const base = `/download/${this.appId}`
        const params = FeatureManager.featureParams()
        return params ? `${base}?${params}` : base
      }
    },

    methods: {
      async loadCredentials() {
        try {
          const result = await fetchJSON(`/proxy/trivial?path=/apps/${this.appId}/credentials`)
          this.credentials = result.credentials
          return true
        } catch (error) {
          console.error('[InstanceSource][loadCredentials] Error:', error)
          notifications.error(`Failed to load credentials. Please try again later: ${error.message}`)
          return false
        }
      },

      async loadManifest() {
        try {
          const manifests = await fetchJSON(`/proxy/trivial?path=/manifests&app_id=${this.appId}`)
          this.manifest = manifests[0] || {}
          this.parseManifest()
        } catch (error) {
          console.error('[InstanceSource][loadManifest] Error:', error)
          notifications.error(`Failed to load application manifest: ${error.message}`)
        }
      },

      parseManifest() {
        this.manifestContent =
          new ManifestMigrator(JSON.parse(this.manifest.content)).migrate()
      },

      async showCredentials() {
        await this.loadCredentials()
        track('Revealed Credentials', {})
        this.hideCredentialsWithDelay()
      },

      downloaded() {
        track('Downloaded Source Code', { 'App ID': this.appId })
      },

      hideCredentialsWithDelay: debounce(
        function() { this.credentials = null },
        function() { return this.revealDuration }
      )
    }
  }
</script>
