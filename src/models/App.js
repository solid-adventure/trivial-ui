import { fetchJSON } from 'trivial-core/lib/component-utils'
import manifestDefault from 'trivial-core/templates/webhook_relay_0.1/initial-manifest.json'

export default class App {

  // Creating an app:
  // Create an App instance, passing in the Vuex store object
  // const app = new App(this.$store)

  // Call the create method, which will write to the server & attach the default manifest
  // app.create('My New App', { options: {}, component: 'TableView'} )

  // For panel options that are arrays, you can append an item. This will save to the server and update the global state
  // app.appendPanelOption({'app_sheets': newSheetAppId})

  // Working with existing apps:
  // Create an App Instance, but include the appId
  // const existingApp = new App(this.$store, '12345')


  constructor(store, name, app) {
    this.$store = store
    this.name = name
    this.app = app
  }

  async create({ name, panelOptions }) {
    const appInstance = await this.$store.state.Session.apiCall('/apps', 'POST', {
      descriptive_name: name,
      panels: panelOptions
    })
    this.app = appInstance
    this.name = appInstance.name
    this.panelOptions = panelOptions
    this.$store.commit('addApp', appInstance)
    await this.instantiateManifest(appInstance)
    Object.assign(this, appInstance)
    await this.$store.state.Permissions.reload()
    return appInstance
  }

  async save() {
    let app = this.app? this.app: this.$store.state.app
    const appInstance = await this.$store.state.Session.apiCall(`/apps/${this.name}`, 'PUT', {
      descriptive_name: app.descriptive_name,
      panels: {
        options: app.panels.options,
        component: app.panels.component
      }
    })
    return appInstance
  }


  async destroy() {
    if (this.$store.state.enableBuildApps) {
      await fetchJSON(`/build/${this.name}`, {
        method: 'delete'
      })
      await this.removeCredentials()
    }
    this.$store.state.Session.apiCall(`/apps/${this.name}`, 'DELETE')
    this.$store.commit('removeApp', {name: this.name})
    await this.$store.state.Permissions.reload()
  }

  async removeCredentials() {
    await this.$store.state.Session.apiCall(`/apps/${this.name}/credentials`, 'PUT', {credentials: {}})
  }

  async instantiateManifest(appInstance) {
    const manifestContent = this.initialManifest(appInstance.name, appInstance.port)
    const manifest = await this.createManifest(manifestContent)
    return manifest
  }

  initialManifest(appName, port) {
    let out = manifestDefault
    out.app_id = appName
    out.listen_at.port = port
    return out
  }

  async createManifest(manifest) {
    const response = await this.$store.state.Session.apiCall('/manifests', 'POST', {
      app_id: manifest.app_id,
      content: JSON.stringify(manifest)
    })
    this.$store.commit('setManifest', manifest)
    return response
  }

  get initialManifestFilename() {
    let manifestForComponent = this.panelOptions.component
    if (typeof this[`${manifestForComponent}InitialManifest`] == "undefined") {
      return 'initial-manifest.json'
    } else {
      return this[`${manifestForComponent}InitialManifest`]
    }
  }

  get PostgresPlaygroundInitialManifest() {
    return 'PostgresPlayground.json'
  }

  async setPanelOption(option) {
    this.$store.commit('setAppPanelOption', {app_id: this.name, panelOption: option, app: this.app})
    return this.save()
  }

  async appendPanelOption(option) {
    this.$store.commit('appendAppPanelOption', {app_id: this.name, panelOption: option, app: this.app})
    return this.save()
  }

  async deletePanelOption(option) {
    this.$store.commit('deleteAppPanelOption', {app_id: this.name, panelOption: option, app: this.app})
    return this.save()
  }

}