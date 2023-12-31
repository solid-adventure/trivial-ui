<template>
  <super-bar></super-bar>
  <nav-tree selected-title="settings"></nav-tree>
  <div class="InstanceSettings">
    <div id="messages">{{errorMessage}}</div>

    <p v-if="loading">Loading...</p>

    <div v-if="!loading">
      <h2 class="headroom section-title">App Name</h2>
      <em class="section-help-text">Update the name of your app as it appears in Trivial.</em>
      <br/>
      <div>
        <input class="descriptive-name" type="text" v-model="descriptive_name"/>
        <br/><ActionButton id="rename_app" class="button-small" :action="updateDescriptiveName" value="Rename" working-value="Updating Name..."></ActionButton>
        <transition name="fade">
            <div v-if="message" class="message">{{message}}</div>
        </transition>
      </div>

      <hr class="headroom accent" />
      <h2 class="headroom section-title">Copy</h2>
      <em class="section-help-text">Create a duplicate of this app with the same build steps, settings, and credentials.</em>
      <br/>
      <div>
        <input class="descriptive-name" type="text" v-model="suggested_copy_name"/>

        <ActionButton id="copy_app" class="button-small" :action="copyApp" value="Copy" working-value="Copying..."></ActionButton>
        <transition name="fade">
            <div v-if="copyMessage" v-html="copyMessage" class="message"></div>
        </transition>
      </div>


      <hr class="headroom accent" />
      <h2 class="headroom section-title">Download Source</h2>
      <em class="section-help-text">Download the compiled source code for this app.</em>
      <br/>
      <div>
        <a class="button-small" :href="downloadLink" download>Download</a>
      </div>

      <hr class="headroom accent" />
      <h2 class="headroom section-title">UI Panel Options</h2>
      <p class="section-help-text"><em>Danger zone! Editing the panel settings directly allows you to break how your app renders.</em></p>
      <p class="section-help-text"><em>This will change how your app is displayed to users.</em></p>
      <HideableSection :initially-hidden="false" display-name='Options' class="settings">
      <textarea id="manifest_content" class="code-entry" cols="60" rows="20" spellcheck="false" v-model="formattedPanels"></textarea>
      <br /><input type="button" class="button-small" :class="{working: updatingPanels}" @click.prevent="updatePanels" :value="updatingPanels ? 'Updating Panel Options...' : 'Update Panel Options' ">
          <transition name="fade">
              <div v-if="panelMessage" class="message">{{panelMessage}}</div>
          </transition>
      </HideableSection>


      <hr class="headroom accent" />
      <h2 class="headroom section-title">Schedule</h2>
      <p class="section-help-text"><em>Settings here will automatically run your app with the payload provided.</em></p>
      <HideableSection :initially-hidden="false" display-name='Options' class="settings">
      <textarea id="manifest_content" class="code-entry" cols="60" rows="10" spellcheck="false" v-model="formattedSchedule"></textarea>
      <br /><input type="button" class="button-small" :class="{working: updatingSchedule}" @click.prevent="updateSchedule" :value="updatingSchedule ? 'Updating Schedule...' : 'Update Schedule' ">
          <transition name="fade">
              <div v-if="scheduleMessage" class="message">{{scheduleMessage}}</div>
          </transition>
      </HideableSection>


      <hr class="headroom accent" />
      <h2 class="headroom section-title">Manifest.json</h2>
      <p class="section-help-text"><em>Danger zone! Editing the manifest directly will allow you to break the build.</em></p>
      <p class="section-help-text"><em>This will delete the lambda and recreate it.</em></p>
      <HideableSection :initially-hidden="true" display-name='Manifest' class="settings">
      <textarea id="manifest_content" class="code-entry" cols="60" rows="30" spellcheck="false" v-model="formattedManifest"></textarea>
      <br /><input type="button" id="manifest_content_save" class="button-small" :class="{working: rebuilding}" @click.prevent="save" :value="rebuilding ? 'Rebuilding Lambda...' : 'Rebuild Lambda' ">
      </HideableSection>
      <hr class="headroom accent" />
      <h2 class="headroom section-title">Delete</h2>
      <p class="section-help-text"><em>Danger zone! Deleting this app is permanent and cannot be undone.</em></p>
      <p class="section-end"><input type="button" class="button-small" :class="{working: deleting}" @click.prevent="deleteApp" :value="deleting ? 'Deleting App...' : 'Delete App'" ></p>
    </div>

  </div>
</template>

<style lang="scss">
  .InstanceSettings {
  	height: 100%;
  	margin: 2em;
    left: 23em;
    top: 80px;
    position: relative;
    width: calc(100% - 27em);
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

  .section-end {
    padding-bottom: 4em;
  }
</style>

<script>
  import { memoize, fetchJSON } from 'trivial-core/lib/component-utils'
  import ActionButton from './controls/ActionButton.vue'
  import HideableSection from './controls/HideableSection.vue'
  import ManifestMigrator from 'trivial-core/lib/ManifestMigrator'
  import { track } from '../../lib/TrackingService'
  import FeatureManager from 'trivial-core/lib/FeatureManager'

  export default {
    inject: ['appId'],

    components: {
        ActionButton,
        HideableSection
    },

    provide: {
      loadDataSamples: memoize(async function () {
        try {
          let response = await fetch(`/proxy/trivial?path=/webhooks&app_id=${this.appId}`)
          let data = await response.json()
          data = Array.isArray(data) ? data : [] // empty result looks like {webhooks: []}
          return data.map(item => {
            return {topic: item.topic, payload: item.payload}
          })
        } catch (error) {
          console.log('[InstanceSettings][loadDataSamples] Error:', error)
        }
      })
    },

    data() {

      return {
        loading: true,
        deleting: false,
        rebuilding: false,
        updatingPanels: false,
        updatingSchedule: false,
        message: null,
        errorMessage: null,
        manifestContent: {},
        descriptive_name: null,
        new_app_descriptive_name: null,
        panels: {},
        schedule:{},
        copyMessage: null,
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

      pageTitle() {
        return `Settings: ${this.descriptive_name}`
      },

      downloadLink() {
        const base = `/download/${this.appId}`
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

    },

    created() {
      this.loadManifest()
      this.loadApp()
    },

    methods: {

      async loadManifest() {
        try {
          let response = await fetch(`/proxy/trivial?path=/manifests&app_id=${this.appId}`)
          let manifests = await response.json()
          this.manifest = manifests[0]
          this.manifestContent =
            new ManifestMigrator(JSON.parse(this.manifest.content)).migrate()
          this.loading = false
        } catch (error) {
          this.loading = false
          console.log('[InstanceSetings][loadManifest] Error:', error)
          this.errorMessage = error.message
        }
      },

      async loadApp(){
        try{
          let app = await fetchJSON(`/proxy/trivial?path=/apps/${this.appId}`)
          this.descriptive_name = app.descriptive_name
          this.panels = app.panels
          this.schedule = app.schedule
          document.title = this.pageTitle
        }
        catch(error){
          console.log('[InstanceSetings][loadApp] Error:', error)
          this.errorMessage = error.message
        }
      },

      updated() {
        this.save()
      },

      async save() {
        this.rebuilding = true
        try {
          this.errorMessage = null
    		  let response = await fetch(`/proxy/trivial`, {
    			  method: 'put',
    			  headers: {'content-type': 'application/json'},
      			body: JSON.stringify({
      				path: `/manifests/${this.manifest.id}`,
      				content: JSON.stringify(this.manifestContent)
      			})
    		  })
          let data = await response.json()
          if (!response.ok)
            throw new Error(data.errors.join('\n'))

          this.manifest = data
          this.manifestContent = JSON.parse(this.manifest.content)
          await this.teardown(false)
          await this.build()
          this.rebuilding = false
          track('Saved Manifest Manually',{
              'ManifestId': this.manifest.id,
            })
        } catch (error) {
          this.rebuilding = false
          console.log('[InstanceSetings][save] Error:', error)
          this.errorMessage = error
        }
      },

      async build() {
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
            track('Deleted App', {
              'App ID': this.appId
            })
            window.location = '/'
        }
      },

      // These methods are now part of models/App and should ultimately be replaced with those
      async teardown(deleteFromBackend=true) {
        try {
          this.errorMessage = null
          await fetchJSON(`/build/${this.appId}`, {
            method: 'delete'
          })
          await this.removeCredentials()
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
        await fetchJSON('/proxy/trivial', {
          method: 'put',
          headers: {'content-type': 'application/json'},
          body: JSON.stringify({
            path: `/apps/${this.appId}/credentials`,
            credentials: {}
          })
        })
      },

      async destroy() {
        let response = await fetchJSON(`/proxy/trivial?path=/apps/${this.appId}`, {
          method: 'delete'
        })
      },

      async copyApp(){
        try{
          this.errorMessage = null
          let response = await fetchJSON('/proxy/trivial', {
            method: 'post',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({
              path: `/apps/${this.appId}/copy`,
              new_app_descriptive_name: this.new_app_descriptive_name
            })
          })
  
          let new_app = await response
          this.copyMessage = `<a href="/apps/${new_app.name}/builder2">${new_app.descriptive_name} Created!</a>`
        }
        catch(error){
          this.copyMessage = error.message
        }
      },

      async updateDescriptiveName(){
        try{
          this.errorMessage = null
          let response = await fetchJSON('/proxy/trivial', {
            method: 'put',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({
              path: `/apps/${this.appId}`,
              descriptive_name: this.descriptive_name
            })
          })
          this.message = 'App name successfully updated!'
          setTimeout(() => {
            this.message = null
            track('Renamed App',{
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
          let response = await fetchJSON('/proxy/trivial', {
            method: 'put',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({
              path: `/apps/${this.appId}`,
              panels: this.panels
            })
          })
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
          let response = await fetchJSON('/proxy/trivial', {
            method: 'put',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({
              path: `/apps/${this.appId}`,
              schedule: this.schedule
            })
          })
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
