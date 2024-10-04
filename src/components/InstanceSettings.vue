<template>
  <div class="settings2">
  <!--<nav-tree selected-title="settings"></nav-tree>-->
  <div class="InstanceSettings">
    <div id="messages">{{errorMessage}}</div>

    <p v-if="loading">Loading...</p>

    <div v-if="!loading" id="instance-setting-container">
      <h1><RouterLink :to="`/apps/${this.app.name}/builder2`">{{this.app.descriptive_name}}</RouterLink></h1>
      <div class="page-inset">
        <h2 class="section-title">App Name</h2>
        <em class="section-help-text">Update the name of your app as it appears in Trivial.</em>
        <br/>
        <div>
          <input class="descriptive-name" type="text" v-model="descriptive_name"/>
          <br/>
          <ActionButton id="rename_app" class="button-small" :action="updateDescriptiveName" value="Rename" working-value="Updating Name..."></ActionButton>
          <transition name="fade">
              <div v-if="message" class="message">{{message}}</div>
          </transition>
        </div>
      </div>

      <div class="page-inset">
        <h2 class="section-title">Copy</h2>
        <em class="section-help-text">Create a duplicate of this app with the same build steps, settings, and credentials.</em>
        <br/>
        <div>
          <input class="descriptive-name" type="text" v-model="suggested_copy_name"/>
          <ActionButton id="copy_app" class="button-small" :action="copyApp" value="Copy" working-value="Copying..."></ActionButton>
          <transition name="fade">
              <div v-if="copyMessage" class="message">
                <RouterLink  v-if = "copyAppUrl" :to = "copyAppUrl" >{{ copyMessage }}</RouterLink>
                <span v-else>{{ copyMessage }}</span>
              </div>
          </transition>
        </div>
      </div>

      
      <div class="page-inset">
        <h2 class="section-title">App Ownership</h2>
        <p class="section-help-text"><em>Transfer app ownership to organizations you are a member of.</em></p>
        <div class = "row">
          <span class = "pro-tip">Pro Tip</span>
          <p>
            Transferring a dashboard doesn't include its children apps. Before
            transferring the dashboard, <br />
            be sure to transfer each child app individually.
          </p>
        </div>
        <AppTransferManager/>
      </div>

      <div class="page-inset">
        <h2 class="section-title">Download Source</h2>
        <em class="section-help-text">Download the compiled source code for this app.</em>
        <br/>
        <div>
          <a class="button-small" href="#" @click.prevent="handleDownload">Download</a>
        </div>
      </div>
      
      <div class="page-inset">
        <h2 class="section-title">UI Panel Options</h2>
        <p class="section-help-text"><em>Danger zone! Editing the panel settings directly allows you to break how your app renders.</em></p>
        <p class="section-help-text"><em>This will change how your app is displayed to users.</em></p>
        <HideableSection :initially-hidden="false" display-name='Options' class="settings">
          <textarea id="manifest_content" class="code-entry" cols="60" rows="20" spellcheck="false" v-model="formattedPanels"></textarea>
          <br /><input type="button" class="button-small" :class="{working: updatingPanels}" @click.prevent="updatePanels" :value="updatingPanels ? 'Updating Panel Options...' : 'Update Panel Options' ">
          <transition name="fade">
            <div v-if="panelMessage" class="message">{{panelMessage}}</div>
          </transition>
        </HideableSection>
      </div>
      

      <div class="page-inset">
        <h2 class="section-title">Schedule</h2>
        <p class="section-help-text"><em>Settings here will automatically run your app with the payload provided.</em></p>
        <HideableSection :initially-hidden="false" display-name='Options' class="settings">
          <textarea id="manifest_content" class="code-entry" cols="60" rows="10" spellcheck="false" v-model="formattedSchedule"></textarea>
          <br /><input type="button" class="button-small" :class="{working: updatingSchedule}" @click.prevent="updateSchedule" :value="updatingSchedule ? 'Updating Schedule...' : 'Update Schedule' ">
          <transition name="fade">
            <div v-if="scheduleMessage" class="message">{{scheduleMessage}}</div>
          </transition>
        </HideableSection>
      </div>


      <div class="page-inset">
        <h2 class="section-title">Manifest.json</h2>
        <p class="section-help-text"><em>Danger zone! Editing the manifest directly will allow you to break the build.</em></p>
        <p class="section-help-text"><em>If there is a Lambda managed by this app, it will delete the lambda and recreate it.</em></p>
        <HideableSection :initially-hidden="true" display-name='Manifest' class="settings">
          <textarea id="manifest_content" class="code-entry" cols="60" rows="30" spellcheck="false" v-model="formattedManifest"></textarea>
          <br /><input type="button" id="manifest_content_save" class="button-small" :class="{working: rebuilding}" @click.prevent="save" :value="rebuilding ? 'Updating manifest...' : 'Update Manifest' ">
        </HideableSection>
      </div>
      
      <div class="page-inset">
        <h2 class="section-title">Delete</h2>
        <p class="section-help-text"><em>Danger zone! Deleting this app is permanent and cannot be undone.</em></p>
        <p><input type="button" class="button-small" :class="{working: deleting}" @click.prevent="deleteApp" :value="deleting ? 'Deleting App...' : 'Delete App'" ></p>
      </div>

    </div>

  </div>
  </div>
</template>

<style lang="scss" scoped>
  .settings2 {
    display: flex;
    gap: 1rem;
  }

  .InstanceSettings {
  	/*height: 100%;
  	margin: 2em;
    left: 23em;
    top: 120px;
    position: relative;
    width: calc(100% - 27em);*/

    width: 100%;
    
    & #instance-setting-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      & a {
        color: var(--on-background);
      }
    }
  }

  h2.section-title, h3.section-title, h4.section-title {
  	margin-bottom: 0;
  }

  p.section-help-text {
  	margin-top: 0;
  }

  em.section-help-text {
    margin-bottom: 0em;
    display: block;
  }

  textarea#manifest_content {
  	width: 60%;
  }

  input#manifest_content_save,
  #rename_app {
  	margin-top: 0.5em;
  	display: inline-block;
  	margin-bottom: 0.5em;
    margin-left: 0;
  }

  input.descriptive-name{
    width: 30%;
  }

  .topic-header {
    margin-top: 2.5em;
    margin-bottom: 0.8em;
  }

  .topic-selection {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;

    > li {
      margin-right: 1em;
    }
  }


  .error {
    color: var(--error);
  }

  .row {
    display: flex;
    align-content: flex-start;
    padding-top: 1em;

    .pro-tip {
      background-color: var(--background);
      color: var(--success-highlight);
      padding: 10px 8px;
      margin-right: 8px;
      border-radius: 6px;
      border: 1px solid var(--success-highlight);
      flex-shrink: 0;
      height: fit-content;
    }

    p {
      margin: 0;
    }

  }
  
  #instance-setting-container {
    padding-bottom: 5em;
    div {
      margin-bottom: 0 !important;
    }
  }

</style>

<script>
  import { mapGetters, mapState } from 'vuex'
  import { fetchJSON } from 'trivial-core/lib/component-utils'
  import ActionButton from './controls/ActionButton.vue'
  import HideableSection from './controls/HideableSection.vue'
  import ManifestMigrator from 'trivial-core/lib/ManifestMigrator'
  import TrackingService from '../../lib/TrackingService'
  import FeatureManager from 'trivial-core/lib/FeatureManager'
  //import NavTree from './builderv2/NavTree.vue'
  import AppTransferManager from './builderv2/AppTransferManager.vue'

  export default {
    // inject: ['appId'],

    components: {
        ActionButton,
        HideableSection,
        AppTransferManager,
        //'nav-tree': NavTree
    },

    data() {

      return {
        loading: true,
        deleting: false,
        rebuilding: false,
        updatingPanels: false,
        updatingSchedule: false,
        downloadMessage: '',
        message: null,
        errorMessage: null,
        manifestContent: {},
        descriptive_name: null,
        new_app_descriptive_name: null,
        panels: {},
        schedule:{},
        copyMessage: null,
        copyAppUrl: null,
        panelMessage: null,
        scheduleMessage: null,
      }
    },

    computed: {

      suggested_copy_name: {

        get: function() {
          try {
            let suggested = `${this.descriptive_name} Copy`
            this.new_app_descriptive_name = suggested
            return suggested
          } catch (e) {
            return ''
          }
        },

        set: function(val) {
          this.new_app_descriptive_name = val
        }

      },
      downloadLink() {
        const base = `/download/${this.app.name}`
        const params = FeatureManager.featureParams()
        return params ? `${base}?${params}` : base
      },

      formattedManifest: {
        get: function() {
          try {
            return JSON.stringify(this.manifestContent, null, 2)
          } catch (error) {
            console.log('[InstanceSettings][get formattedManifest] Error: ', error)
            return '{}'
          }
        },

        set: function(value) {
          try {
            this.manifestContent = JSON.parse(value)
          } catch (error) {
            console.log('[InstanceSettings][set formattedManifest] Error: ', error)
          }
        }
      },

      formattedPanels: {
        get: function() {
          try {
            return JSON.stringify(this.panels, null, 2)
          } catch (error) {
            console.log('[InstanceSettings][get formattedPanels] Error: ', error)
            return '{}'
          }
        },

        set: function(value) {
          try {
            this.panels = JSON.parse(value)
          } catch (error) {
            console.log('[InstanceSettings][set formattedPanels] Error: ', error)
          }
        }
      },

      formattedSchedule: {
        get: function() {
          try {
            return JSON.stringify(this.schedule, null, 2)
          } catch (error) {
            console.log('[InstanceSettings][get formattedSchedule] Error: ', error)
            return '{}'
          }
        },

        set: function(value) {
          try {
            this.schedule = JSON.parse(value)
          } catch (error) {
            console.log('[InstanceSettings][set formattedSchedule] Error: ', error)
          }
        }
      },

      ...mapState([
        'app'
      ]),

      ...mapGetters([
        'appLoaded'
      ])

    },

    async mounted() {
      if(this.appLoaded){
        this.setAppDetails()
        await this.loadManifest()
      }
    },

    watch: {
        async app(newApp){
          if(newApp){
            this.setAppDetails()
            await this.loadManifest()
          }
        }
    },
    methods: {

      setAppDetails() {
        this.descriptive_name = this.app.descriptive_name
        this.panels = this.app.panels
        this.schedule = this.app.schedule
      },

      async loadManifest() {
        try {
          this.errorMessage = null
          let manifests = await this.$store.state.Session.apiCall(`/manifests?app_id=${this.app.name}`)
          this.manifest = manifests[0]
          const content = typeof this.manifest.content == 'object' ? this.manifest.content : JSON.parse(this.manifest.content)
          this.manifestContent = new ManifestMigrator(content).migrate()
          this.loading = false
        } catch (error) {
          this.loading = false
          console.log('[InstanceSetings][loadManifest] Error:', error)
          this.errorMessage = error.message
        }
      },

      handleDownload() {
        this.downloadMessage = ''
        fetch(this.downloadLink, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({manifest: this.manifest})
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to download')
          }
          return response
        })
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${this.appId}.zip`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
        })
        .catch(error => {
          console.log('[InstanceSetings][handleDownload] Error:', error)
          this.downloadMessage = error.message
        })

      },

      updated() {
        this.save()
      },

      async save() {
        this.rebuilding = true
        try {
          this.errorMessage = null
          this.manifest = await this.$store.state.Session.apiCall(`/manifests/${this.manifest.id}`,
             'PUT',
             {content: JSON.stringify(this.manifestContent)}
          )
          this.manifestContent = JSON.parse(this.manifest.content)
          await this.teardown(false)
          await this.build()
          this.rebuilding = false
          TrackingService.track('Saved Manifest Manually',{
              'ManifestId': this.manifest.id,
            })
        } catch (error) {
          this.rebuilding = false
          console.log('[InstanceSetings][save] Error:', error)
          this.errorMessage = error
        }
      },

      async build() {
        if (!this.$store.state.enableBuildApps)  { return }
        try {
          const params = FeatureManager.featureParams()
      		await fetch(`/build?${params}`, {
      			method: 'post',
      			headers: {'content-type': 'application/json'},
      			body: JSON.stringify(this.manifestContent)
      		})
        } catch (error) {
          console.log('[InstanceSetings][build] Error:', error)
          this.errorMessage = error
        }
      },

      async deleteApp() {
        if (! this.deleting &&
            confirm(`Are you sure you want to delete the app ${this.descriptive_name}?`)) {
          this.deleting = true
          await this.teardown()
          this.deleting = false
          if (null === this.errorMessage)
            TrackingService.track('Deleted App', {
              'App ID': this.app.name
            })
            this.$router.push({ path: '/' })
        }
      },

      // These methods are now part of models/App and should ultimately be replaced with those
      async teardown(deleteFromBackend=true) {
        try {
          this.errorMessage = null
          // Only teardown Lambda if build apps is enabled
          if (this.$store.state.enableBuildApps) {
            await fetchJSON(`/build/${this.app.name}`, {
              method: 'delete'
            })
            await this.removeCredentials()
          }
          // Always delete from the backend if the flag is set
          if (deleteFromBackend) {
            await this.destroy()
          }
        } catch (error) {
          console.log('[InstanceSetings][teardown] Error:', error)
          this.errorMessage = error.message
        }
      },

      // TODO: Deleting an app should remove its credentials automatically
      async removeCredentials() {
        await this.$store.state.Session.apiCall(`/apps/${this.app.name}/credentials`, 'PUT',
          {credentials: {}}
        )
      },

      async destroy() {
        await this.$store.state.Session.apiCall(`/apps/${this.app.name}`, 'DELETE')
      },

      async copyApp(){
        try{
          this.copyMessage = null
          this.copyAppUrl = null
          let new_app = await this.$store.state.Session.apiCall(`/apps/${this.app.name}/copy`, 'POST', {
            new_app_descriptive_name: this.new_app_descriptive_name
          })
          if (new_app.errors) {
            this.copyMessage = new_app.errors.join(',')
          } else {
            this.copyAppUrl = `/apps/${new_app.name}/builder2`
            this.copyMessage = new_app.descriptive_name

          }
        }
        catch(error){
          this.copyMessage = error.message
        }
      },

      async updateDescriptiveName(){
        try{
          this.errorMessage = null
          let response = await this.$store.state.Session.apiCall(`/apps/${this.app.name}`, 'PUT', {descriptive_name: this.descriptive_name})
          this.message = 'App name successfully updated!'
          setTimeout(() => {
            this.message = null
            TrackingService.track('Renamed App',{
              'New App Name': this.descriptive_name
            })
            window.location = window.location
            }, 1500)
        }
        catch(error){
          console.log('[InstanceSetings][updateDescriptiveName] Error:', error)
          this.errorMessage = error.message
        }
      },

      async updatePanels(){
        try{
          this.errorMessage = null
          this.updatingPanels = true
          await this.$store.state.Session.apiCall(`/apps/${this.app.name}`, 'PUT', {panels: this.panels})
          this.panelMessage = 'Panel options successfully updated!'
        } catch(error){
          console.log('[InstanceSetings][updatePanels] Error:', error)
          this.errorMessage = error.message
        }
        this.updatingPanels = false
      },

     async updateSchedule(){
        try{
          this.errorMessage = null
          this.updatingSchedule = true
          await this.$store.state.Session.apiCall(`/apps/${this.app.name}`, 'PUT', {schedule: this.schedule})
          this.scheduleMessage = 'Schedule successfully updated!'
        } catch(error){
          console.log('[InstanceSetings][updateSchedule] Error:', error)
          this.errorMessage = error.message
        }
        this.updatingSchedule = false
      }

    }
  }
</script>
