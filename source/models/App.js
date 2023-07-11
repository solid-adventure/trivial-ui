const { fetchJSON } = require('trivial-core/lib/component-utils')

class App {

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


  constructor(store, name) {
    this.$store = store
    this.name = name
  }

  async create({ name, panelOptions }) {
    const appInstance = await fetchJSON('/proxy/trivial', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
            path: '/apps',
            descriptive_name: name,
            panels: panelOptions})
    })
    this.name = appInstance.name
    this.panelOptions = panelOptions
    this.$store.commit('addApp', appInstance)
    await this.instantiateManifest(appInstance)
    Object.assign(this, appInstance)
    // this.instance = appInstance
    return appInstance
  }

  // There are few patterns in this file, but this is the best to follow.
  // We return a promise and deliberately do not catch here, so that errors can bubble to the caller.
  async save() {
    let app = this.$store.state.apps.find(app => app.name == this.name)
    const appInstance = fetch('/proxy/trivial', {
    method: 'PUT',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
        path: `/apps/${this.name}`,
        descriptive_name: app.descriptive_name,
        panels: {
            options: app.panels.options,
            component: app.panels.component
            }
        })
    })
    .then(response => response.json())
    return await appInstance
  }


  async destroy() {
    await fetchJSON(`/build/${this.name}`, {
      method: 'delete'
    })
    await this.removeCredentials()
    await fetchJSON(`/proxy/trivial?path=/apps/${this.name}`, {
      method: 'delete'
    })
    this.$store.commit('removeApp', {name: this.name})
  }

  async removeCredentials() {
    await fetchJSON('/proxy/trivial', {
      method: 'put',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        path: `/apps/${this.name}/credentials`,
        credentials: {}
      })
    })
  }

  async instantiateManifest(appInstance) {
    const manifestContent = await this.initialManifest(appInstance.name, appInstance.port)
    const manifest = await this.createManifest(manifestContent)
    return manifest
  }

  async initialManifest(appName, port) {
    const manifest = await fetchJSON(`/manifest?template=webhook_relay&version=0.1&initial_manifest=${this.initialManifestFilename}`)
    manifest.app_id = appName
    manifest.listen_at.port = port
    return manifest
  }

  async createManifest(manifest) {
    const response = await fetchJSON('/proxy/trivial', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        path: '/manifests',
        app_id: manifest.app_id,
        content: JSON.stringify(manifest)
      })
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
    this.$store.commit('setAppPanelOption', {app_id: this.name, panelOption: option})
    return this.save()
  }

  async appendPanelOption(option) {
    this.$store.commit('appendAppPanelOption', {app_id: this.name, panelOption: option})
    return this.save()
  }

  async deletePanelOption(option) {
    this.$store.commit('deleteAppPanelOption', {app_id: this.name, panelOption: option})
    return this.save()
  }

}

module.exports = App
