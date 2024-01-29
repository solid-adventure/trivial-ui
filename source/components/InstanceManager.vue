<BaseLayout>
  <div class="InstanceManager">
    <div class="button-row">
      <Notices :pinned="false"></Notices>
      <div class="button-row-actions">
        <template v-slot:buttons></template>
      </div>
    </div>

    <div class="instance_details">
      <h2 class="instance_name">{{descriptive_name}}</h2>
      <span class="instance_details">{{humanized_template}} {{manifest.version}}</span>
    </div>
    <div class="tab-bar">
      <a :href="`/apps/${appId}`" class="tab" :class="{selected: isDashboardSelected}">Builder</a>
      <a :href="`/apps/${appId}/settings`" class="tab" :class="{selected: isSettingsSelected}">Settings</a>
      <a :href="`/apps/${appId}/export`" class="tab" :class="{selected: isExportSelected}">Export</a>
    </div>
    <slot></slot>
  </div>
</BaseLayout>

<style lang="scss" scoped>
  .InstanceManager {
  	position: absolute;
  	left: 20%; /* clear the AppManager */
  	width: 80%; /* what's left after AppManager */
  	// top: 80px; /* clear the SuperBar*/
  	padding: 0;
  	margin: 0;
  	height: 100%;
  	z-index: 10;
  }

  .button-row {
    position: fixed;
    left: 20%;
    top: 40px;
    width: 80%;
    display: block;
    z-index: 11;

    .button-row-actions {
      text-align: right;
      background-color: var(--surface);
      color: var(--on-surface);
      min-height: calc(3.4em + 4px);
    }
  }

  .instance_details {
  margin: 4em 2em 2em 2em;
  }

  .instance_details h2 {
    margin-top: 0;
    margin-bottom: 0;
  }

  .instance_details span {
    font-size: 0.8em;
    opacity: 0.4;
    margin-left: 0;
   }

</style>

<script>
  import { fetchJSON } from 'trivial-core/lib/component-utils'
  import Notices from './Notices.vue'

  export default {
    inject: ['appId'],
    components: {
      Notices
    },
    data() {
      return {
        raw_manifest: '{}',
        descriptive_name: null
      }
    },

    computed: {
      manifest() {
        try {
          return JSON.parse(this.raw_manifest)
        } catch (error) {
          console.log('[InsanceManager][manifest] Error: ', error)
          return {}
        }
      },

      humanized_template() {
        return (this.manifest.template || '')
          .split('_')
          .map(part => (part[0] || '').toUpperCase() + part.substr(1))
          .join('')
      },

      isDashboardSelected() {
        return `/apps/${this.appId}` === window.location.pathname;
      },

      isSettingsSelected() {
        return `/apps/${this.appId}/settings` === window.location.pathname;
      },

      isExportSelected() {
        return `/apps/${this.appId}/export` === window.location.pathname;
      }
    },

    created() {
      this.loadManifest()
      this.loadDescriptiveName()
    },

    methods: {
      async loadManifest() {
        try {
          let manifests = await fetchJSON(`/proxy/trivial?path=/manifests&app_id=${this.appId}`)
          manifests[0] ? this.raw_manifest = manifests[0].content : this.raw_manifest = await this.defaultManifest()

        } catch (error) {
          console.log('[InstanceManager][loadManifest] Error: ', error)
          this.errorMessage = error.message
        }
      },

      async loadDescriptiveName(){
        try{
          let app = await fetchJSON(`/proxy/trivial?path=/apps/${this.appId}`)
          this.descriptive_name = app.descriptive_name
        }
        catch(error){
          console.log('[InstanceManager][loadDescriptiveName] Error:', error)
          this.errorMessage = error.message
        }
      },

    async defaultManifest() {
       let temp_manifest = await fetch('/manifest?template=webhook_relay&version=0.1')
            if (!temp_manifest.ok)
              throw new Error(temp_manifest.statusText)
            let m = await temp_manifest.json()
            m.app_id = this.appId

            let temp_manifest_save = await fetch('/proxy/trivial', {
              method: 'POST',
              headers: {'content-type': 'application/json'},
              body: JSON.stringify({
                path: '/manifests',
                app_id: m.app_id,
                content: JSON.stringify(m)
              })
            })
            let persisted = await temp_manifest_save.json()
            if (!temp_manifest_save.ok)
              throw new Error(persisted.errors.join("\n"))

            return persisted.content
      }
    }
  }
</script>
