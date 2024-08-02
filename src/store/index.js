import { createStore } from 'vuex'
import { fetchJSON } from 'trivial-core/lib/component-utils'
import KeyboardControl from '../lib/KeyboardControl'
import notifications from '../components/notifications'
import ManifestMigrator from 'trivial-core/lib/ManifestMigrator'
import FeatureManager from 'trivial-core/lib/FeatureManager'
import ActionPath from 'trivial-core/lib/actionsv2/ActionPath'
import router from '../router'
import Session from '../models/Session'
import Permissions from '../models/Permissions'
import { toRaw } from 'vue'
import { useStorage } from '@vueuse/core'

const store = createStore({

  state: {
    currentPath: '/',
    route: null,
    user: {},
    //theme: localStorage.getItem('vueuse-color-scheme') === 'light' ? 'light' : 'dark',
    isDarkTheme: false,
    themeLoaded: false,
    app: {},
    isAuthenticated: false,
    showSuperBar: false,
    apps: [],
    manifest: {
      id: null,
      content: {}
    },
    credentials: {},
    credentialSets: [],
    currentAction: null,
    currentDraft: null,
    currentCredentialSet: null,
    customPayload: '{}',
    keyboardControl: new KeyboardControl(document),
    dataSample: null,
    webhookSocket: null,
    listeners: {},
    playgroundMode: false,
    tourMode: false,
    tourStep: 0,
    tourSteps: ['action-info', 'credentials', 'transform-config'],
    enableSaveCredentials: import.meta.env.VITE_ENABLE_SAVE_CREDENTIALS,
    enableBuildApps: import.meta.env.VITE_ENABLE_BUILD_APPS,
    enableWebhookAppTrigger: import.meta.env.VITE_ENABLE_WEBHOOK_APP_TRIGGER,
    Session: Session,
    Permissions: null,
    orgId: null,
    registerColumns: null,
    registerId: null,
    staticRegisterCols: ["originated_at", "description", "amount", "units", "unique_key"]
  },

  getters: {

    manifestLoaded(state) {
      return Object.keys(state.manifest.content).length > 0
    },

    appLoaded(state) {
      return Object.keys(state.app).length > 1
    },

    appUrl(state) {
      const path = (state.manifest.content.listen_at || {}).path
      return new URL(path, `https://${state.app.hostname}.${state.app.domain}`).href
    },
    hiddenByTour: (state) => (section) => {
      if (!state.tourMode) { return false }
      if (!state.tourSteps.includes(section)) { return true }
      if (state.tourStep != state.tourSteps.indexOf(section)) { return true }
      return false
    },
    getOrgId(state) {
      return state.orgId
    },
    getRegisterId(state) {
      return state.registerId
    },
    getApps(state) {
      return state.apps;
    },
    getIsDarkTheme(state) {
      return state.isDarkTheme;
    },
    getRegisterColumns(state) {
      return state.registerColumns;
    },
    getStaticRegisterCols(state) {
      return state.staticRegisterCols
    }
  },

  mutations: {
    setCurrentPath(state, currentPath) {
      state.currentPath = currentPath
    },
    setRoute(state, route) {
      state.route = route
    },
    themeLoaded(state, loaded) {
      state.themeLoaded = loaded
    },
    incrementTour(state) {
      state.tourStep++
      if (state.tourStep >= state.tourSteps.length) {
        state.tourMode = false
      }
    },
    setIsAuthenticated(state,isAuthenticated) {
      state.isAuthenticated = isAuthenticated
    },

    setPlaygroundMode(state) {
      state.playgroundMode = true
      state.tourMode = true
    },

    setApps(state, apps) {
      state.apps = apps || []
      state.appsLoaded = true
    },

    setApp(state, app) {
      state.app = app || {}
    },

    setAppId(state, appId) {
      state.app.name = appId || null
    },

    addApp(state, newApp) {
      let beforePos = state.apps.findIndex(app => app.name >= newApp.name)
      state.apps.splice(-1 === beforePos ? state.apps.length : beforePos, 0, newApp)
    },

    removeApp(state, targetApp) {
      let beforePos = state.apps.findIndex(app => app.name == targetApp.name)
      if (beforePos > -1) { state.apps.splice(beforePos, 1)}
    },

    updateAppOwner(state, {owner_type, owner_id}){
      state.app.owner_type = owner_type
      state.app.owner_id = owner_id
    },
    
    setAppAttribute(state, args) {
      // {app_id: 1234, attr: 'descriptive_name', val: "Great New Name" }
      let app = state.app
      app[args.attr] = args.val
    },

    setAppPanelOption(state, args) {
      let app = args.app? args.app : state.app
      let option = args.panelOption
      for (let key of Object.keys(args.panelOption)) {
        app.panels.options[key] = args.panelOption[key]
      }
    },

    appendAppPanelOption(state, args) {
      let app = args.app? args.app : state.app
      let option = args.panelOption
      for (let key of Object.keys(args.panelOption)) {
        let existing = app.panels.options[key]
        let newVal = args.panelOption[key]
        if (existing) {
          app.panels.options[key].push(newVal)
        } else {
          app.panels.options[key] = [newVal]
        }
      }
    },

    deleteAppPanelOption(state, args) {
      let app = args.app? args.app : state.app
      let option = args.panelOption
      for (let key of Object.keys(args.panelOption)) {
        let existing = app.panels.options[key]
        if (existing) {
          app.panels.options[key] = existing.filter( e => e != args.panelOption[key])
        }
      }
    },

    setCredentials(state, credentials) {
      state.credentials = credentials
    },

    setManifest(state, manifest) {
      state.manifest = manifest
    },

    setManifestContent(state, content) {
      state.manifest.content = content
    },

    setManifestDefinitions(state, definitions) {
      state.manifest.content.definitions = definitions
    },

    setCurrentAction(state, action) {
      state.currentAction = action
    },

    setCurrentDraft(state, draft) {
      state.currentDraft = draft
    },

    setCurrentCredentialSet(state, setId) {
      state.currentCredentialSet = setId
    },

    setCustomPayload(state, payload) {
      state.customPayload = payload
      // patch the custom payload into the existing data sample
      state.dataSample.payload = JSON.parse(payload)
    },

    setUser(state, user) {
      state.user = user
    },

    /*setTheme(state, theme) {
      state.theme = theme
      localStorage.setItem('theme', theme)
    },*/

    setDataSample(state, dataSample) {
      state.dataSample = dataSample
    },

    initPermissions(state, user){
      state.Permissions = new Permissions(Session, user)
    },

    addListener(state, {event, listener}) {
      if (! (event in state.listeners)) {
        state.listeners[event] = []
      }
      state.listeners[event].push(listener)
    },

    removeListener(state, {event, listener}) {
      const idx = (state.listeners[event] || []).findIndex(l => l === listener)
      if (idx !== -1) {
        state.listeners[event].splice(idx, 1)
      }
    },

    setCredentialSets(state, credentialSets) {
      state.credentialSets = credentialSets
    },

    updateCredentialSet(state, credentialSet) {
      const index = state.credentialSets.findIndex(s => s.id === credentialSet.id)
      if (index !== -1) {
        state.credentialSets[index] = credentialSet
      } else {
        state.credentialSets.push(credentialSet)
      }
    },

    removeCredentialSet(state, credentialSet) {
      const index = state.credentialSets.findIndex(s => s.id === credentialSet.id)
      if (index !== -1) {
        state.credentialSets.splice(index, 1)
      }
    },
    setOrgId(state, id) {
      state.orgId = id
    },

    setIsDarkTheme(state, value) {
      state.isDarkTheme = value
    },
    setRegisterId(state, value) {
      state.registerId = value
    },
    setRegisterColumns(state, value) {
      state.registerColumns = value
    }
  },

  actions: {
    async init({ commit, dispatch, state }, { appId }) {
      if (!state.isAuthenticated) { return }
      try {
        await dispatch('loadProfile')
        await dispatch('initApp', { appId })
        await dispatch('loadResources', { dispatch, router })
        await dispatch('checkURLState')
        await dispatch('register')
        //await dispatch('registerColumns')
        useStorage('vueuse-color-scheme', 'light')
      } catch (error) {
        console.error('[store][init] Error: ', error)
        notifications.error(`Failed to load apps: ${error.message}`)
      }
    },

    async loadProfile({ commit, state }) {
      try {
        let data = await Session.apiCall('/profile')
        //commit('setTheme', data.user.color_theme)
        commit('setUser', data.user)
        commit('initPermissions', data.user)
      } catch (e) {
        console.error('Failed to load profile', e)
        commit('setUser', {name: 'guest'})
      }
    },

    async loadResources({ commit }, { dispatch, router }) {
      const routeName = router.currentRoute.value.name
      if ( ['PanelType', 'Show App'].includes(routeName) ) {
        await dispatch('loadApps', {dispatch})
      }

      if ( ['Activity', 'Show App', 'Builder', 'Panels', 'Settings'].includes(routeName) ) {
        await dispatch('loadApp', { dispatch, appId: router.currentRoute.value.params.id })
      }
    },

    async loadApps({ commit, state }, {dispatch}) {
      const apps = await Session.apiCall('/apps')
      await commit('setApps', apps)
      await dispatch('setAppPermits', state.apps)
    },

    async loadApp({ commit, state }, { dispatch, appId }) {
      const app = await Session.apiCall(`/apps/${appId}`)
      await commit('setApp', app)
      await dispatch('setAppPermits', [state.app])
    },

    async setAppPermits({state}, apps){
      apps.map(app => {
        return state.Permissions.can('update', 'App', { appName: app.name })
          .then(res => {
            app.canUpdate = res;
          });
      });
    },
    
    initApp({state, commit}, {appId}) {
      if(state.app !== {}){
        state.app = {}
      }
      commit('setAppId', appId)
    },

    async setCurrentPath({state, commit}, {currentPath, route}) {
      commit('setCurrentPath', currentPath)
      commit('setRoute', route)

    },

    checkURLState({ state, commit }) {
      const path = window.location.pathname
      const match = /^\/apps\/([^\/]+)\/(builder2\/)?(.+)/.exec(path)

      let p = new URLSearchParams(window.location.search)

      if (p.get('mode') == 'playground') { commit('setPlaygroundMode') }
      if (match && match[1] === state.app.name) {
        try {
          const appPath = new ActionPath(match[3])
          if (appPath.type === 'action') {
            commit('setCurrentAction', appPath.id)
            commit('setCurrentCredentialSet', appPath.innerId)
          } else {
            commit('setCurrentCredentialSet', appPath.id)
          }
          commit('setCurrentDraft', new URLSearchParams(window.location.search).get('draft'))
        } catch (err) {
          // not a deep link
        }
      }
    },

    async loadCredentials({ commit, state, dispatch }) {
      let appId = state?.app?.name ?? state?.route?.params?.id
      const creds = await Session.apiCall(`/apps/${appId}/credentials`)
      commit('setCredentials', creds.credentials)
      dispatch('notifyCredentialsLoaded')
      return creds.credentials
    },

    async loadCredentialsDraft({ commit, dispatch }, { token }) {
      const creds = await Session.apiCall(`/manifests/-/drafts/${token}/credentials`)
      commit('setCredentials', creds.credentials)
      return creds.credentials
    },

    async loadCredentialsOrDraft({ state, dispatch }) {
      if (state.currentDraft) {
        return await dispatch('loadCredentialsDraft', {token: state.currentDraft})
      } else {
        return await dispatch('loadCredentials')
      }
    },

    async loadManifest({ commit, state, dispatch }) {
      const appId = state?.app?.name ?? state?.route?.params?.id
      const all = await Session.apiCall(`/manifests?app_id=${appId}`)
      const manifest = all[0] || {content: '{}'}
      manifest.content = new ManifestMigrator(JSON.parse(manifest.content)).migrate()
      commit('setManifest', manifest)
      dispatch('notifyManifestLoaded')
      return manifest
    },

    async loadManifestDraft({ commit, dispatch }, { token }) {
      const manifest = await Session.apiCall(`/manifests/-/drafts/${token}`)
      manifest.content = new ManifestMigrator(manifest.content).migrate()
      commit('setManifest', {id: manifest.manifest_id, content: manifest.content, user_id: manifest.user_id})
      return manifest
    },

    async loadManifestOrDraft({ state, dispatch }) {
      if (state.currentDraft) {
        return await dispatch('loadManifestDraft', {token: state.currentDraft})
      } else {
        return await dispatch('loadManifest')
      }
    },

    async saveCredentials({ state, dispatch }) {
      await Session.apiCall(`/apps/${state.app.name}/credentials`, 'PUT', {credentials: state.credentials})
      dispatch('notifyCredentialsLoaded')
    },

    async saveManifest({ commit, state, dispatch }) {
      const manifest = await Session.apiCall(`/manifests/${state.manifest.id}`, 'PUT', {content: JSON.stringify(state.manifest.content)})
      manifest.content = new ManifestMigrator(JSON.parse(manifest.content)).migrate()
      commit('setManifest', manifest)
      dispatch('notifyManifestLoaded')
      return manifest
    },

    async save({ dispatch }) {
      await dispatch('saveManifest')
      if(this.state.enableSaveCredentials){
        await dispatch('saveCredentials')
      }
    },

    async build({ state }) {
      if (!state.enableBuildApps) { return }
      const params = FeatureManager.featureParams()
      await fetchJSON(`/build?${params}`, {
        method: 'post',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(state.manifest.content)
      })
    },

    async saveAndBuild({ dispatch }) {
      await dispatch('save')
      await dispatch('build')
    },

    async requireDataSample({ state, commit }) {
      if (!state.dataSample) {
        try {
          const data = await Session.apiCall(`/webhooks?app_id=${state.app.name}&limit=1`)
          if (Array.isArray(data) && data.length > 0) {
            commit('setDataSample', data[0])
          } else {
            commit('setDataSample', {payload: {}})
          }
        } catch (err) {
          commit('setDataSample', {payload: {}})
          console.error({err}, 'Error loading data sample')
        }
      }
    },

    emitEvent({ state }, {event, payload}) {
      (state.listeners[event] || []).slice().forEach(l => {
        try {
          l(payload)
        } catch (err) {
          console.error({err, event, payload}, 'Error in event listener')
        }
      })
    },

    notifyManifestLoaded({ dispatch }) {
      dispatch('emitEvent', {event: 'manifestLoaded'})
    },

    onManifestLoaded({ commit }, listener) {
      commit('addListener', {event: 'manifestLoaded', listener})
    },

    notifyCredentialsLoaded({ dispatch }) {
      dispatch('emitEvent', {event: 'credentialsLoaded'})
    },

    onCredentialsLoaded({ commit }, listener) {
      commit('addListener', {event: 'credentialsLoaded', listener})
    },

    async loadCredentialSets({ commit }) {
      const creds = await Session.apiCall(`/credential_sets`)
      commit('setCredentialSets', creds.credential_sets)
      return creds.credential_sets
    },

    async loadCredentialSetAndSecret({ commit }, { id }) {
      const data = await Session.apiCall(`/credential_sets/${id}`)
      commit('updateCredentialSet', data.credential_set)
      return data
    },

    async saveCredentialSet({ commit }, { credential_set, credentials }) {
      let newCreds = null
      if (credential_set.id) {
        newCreds = await Session.apiCall(`/credential_sets/${credential_set.id}`, 'PUT', {credential_set, credentials})
      } else {
        newCreds = await Session.apiCall(`/credential_sets`, 'POST', {credential_set, credentials})
      }
      commit('updateCredentialSet', newCreds.credential_set)
      return newCreds.credential_set
    },

    async destroyCredentialSet({ commit }, { id }) {
      await Session.apiCall(`/credential_sets/${id}`, 'DELETE')
      commit('removeCredentialSet', { id })
    },
    async selectOrgId({ commit, state }, id) {
      await commit('setOrgId', id)
    },
    async getDarkTheme({ commit, state }, value) {
      await commit('setIsDarkTheme', value)
    },
    async register({ commit, state }) {
      let registersNames = ['Sales', 'Income Account'],
          allRegisters = await Session.apiCall('/registers'),
          register = allRegisters.find(r => r.owner_type === 'Organization' && r.owner_id === state.orgId && registersNames.includes(r.name))
      commit('setRegisterId', register.id)
    },
    async registerCols({ commit, state }) {
      let regCols = await Session.apiCall(`/register_items/columns?register_id=${state.registerId}`)
      commit('setRegisterColumns', regCols)
    }
  }

})

export default store
