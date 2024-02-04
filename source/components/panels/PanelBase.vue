<script>
  import ActionButton from '../controls/ActionButton.vue'
  import { fetchJSON } from 'trivial-core/lib/component-utils'
  import { mapState } from 'vuex'
  import PanelPopover from './PanelPopover.vue'


  export default {
    props: {

      parent_app_id: {
        type: String,
        required: false
      },

      app_id: {
        type: String,
        required: false
      },
      options: {
        type: Object,
        required: false
      }
    },

    components: {
      ActionButton,
      PanelPopover
    },

    mounted() {
      this.fetchData()
    },

    data() {
      return this.intialData()
    },

    watch: {
      options: {
        handler(newVal, oldVal) {
        this.resetState()
        this.fetchData()
      },
      deep: true
      }
    },

    computed: {

      app() {
        return this.$store.state.apps.find(app => app.name == this.app_id)
      },

      cascadingTitle() {
        return this.cascadingPropery('title')
      },

      cascadingDescription() {
        return this.cascadingPropery('description')
      },

      standAlone() {
        // Returns true if the panel is loaded at it's own URL
        let url_app_id = location.pathname.replace(/apps|\//g, '')
        return this.app_id == url_app_id
      },

      editMode() {
        let p = new URLSearchParams(window.location.search)
        return p.get('mode') == 'edit' 
      },

      editUrl() {
        let path = `apps/${this.app_id}`
        return new URL(path, `https://www.${this.app.domain}`).href
      },


      appUrl() {
        if (!this.app) { return }
        let path = 'webhooks/receive'
        return new URL(path, `https://${this.app.hostname}.${this.app.domain}`).href
      },

      data_source() {
        if (!this.app) { return }
        try {
          if (this.app.panels.options.data_source.type === 'trivial-api')  {
            return 'trivial-api'
          } else {
            return 'trivial-app'
          }
        } catch (e) {
          return 'trivial-app'
        }
      },

      reportPath() {
        if (!this.app) { return }
        return this.app.panels.options.data_source.args.path
      },

      data_sourceArgs() {
        if (!this.app) { return }
        try {
          return this.app.panels.options.data_source.args
        } catch (e) {
          return {}
        }
      },

      customerToken() {
        return this.$store.state.user.current_customer_token
      },

      // Implement ratingInWords in the subclass to return a result
      ratingImage() {
        let green = '/assets/images/check-circle-light.svg'
        let gray = '/assets/images/check-exclamation-light.svg'
        let red = '/assets/images/check-exclamation.svg'
        if (['Ok', 'Perfect'].includes(this.ratingInWords)) { return green }
        if (['Very High', 'Very Low'].includes(this.ratingInWords)) { return red }
        if (['Low', 'High', 'out of range'].includes(this.ratingInWords)) { return gray }
      },

      shouldFetchCached() {
        let cache_expiration
        try {
          cache_expiration = this.app.panels.options.cache_expiration || 'live'
        } catch (e) {
          cache_expiration = 'live'
        }
        // TODO Support datetime expirations
        // TODO Support 'always'
        return cache_expiration == 'never'
      },

      size() {
        if (this.app.panels.options.full_width == true) {
          return 'panel-inner-full-width'
        } else {
          return 'panel-inner'
        }
      },

      ...mapState([
        'apps', 'user'])

    },

    methods: {

      cascadingPropery(val) {
        let panelOptions = {}
        try {
          panelOptions = this.app.panels.options || {}
        } catch (e) {}

        return panelOptions[val] || this[val]

      },

      // This is a method because, as a computed property, it misses changes to the Mixin children
      mergedOptions() {
        let out = Object.assign({customer_token: this.customerToken}, this.options)
        out = Object.assign(out, this.data_sourceArgs)
        return out
      },

      intialData() {
        return {
          chartOptions: {},
          errors: '',
          datasets: [],
          description: '',
          labels: [],
          title: '',
          chart: null,
          count: '-',
          loading: true,
          shouldSuggestCacheRefresh: false,
          rows: [],
          columnNames: [],
          headlines: [{count: '-', title: 'Loading...'}],
        }
      },

      resetState() {
        Object.assign(this.$data, this.intialData())
      },

      async fetchData() {
        if (!this.app) { return }
        if (this.data_source === 'trivial-api') {
          this.fetchDataTrivialApi()
        } else {
          this.fetchDataTrivialApp()
        }
      },

      // Expected format:
      // {
      //   "options": {
      //     "full_width": false,
      //     "data_source": {
      //       "type": "trivial-api",
      //       "args": {
      //         "path": "reports/item_count",
      //         "register_ids": 1
      //       }
      //     }
      //   },
      //   "component": "Headline"
      // }
      async fetchDataTrivialApi(displayLoading=true) {
        if (displayLoading) { this.loading = true }
        try {
          await fetchJSON(`/proxy/trivial`, {
            method: 'post',
            body: JSON.stringify(
              Object.assign(
                this.mergedOptions(),
                {path: this.reportPath}
                )
              ),
            headers: {'content-type': 'application/json'}
          })
          .then(response => this.preProcessResponse(response, 200))
          .then(response => this.handleResponse(response))
        } catch (error) {
          this.errors = error
          this.preProcessResponse(error, 500)
          console.error('[fetchDataTrivialApi] Error:', error)
        }
        this.loading = false
      },

      preProcessResponse(response, status) {
        return {statusCode: status, body: response}
      },

      fetchDataTrivialApp() {
        if (this.shouldFetchCached) {
          this.fetchDataCached()
        } else {
          this.fetchDataLive()
        }
      },

      async fetchDataLive(displayLoading=true) {
        if (displayLoading) { this.loading = true }
        try {
          await fetchJSON(`/apps/call?url=${this.appUrl}`, {
            method: 'post',
            body: JSON.stringify(this.mergedOptions()),
            headers: {'content-type': 'application/json'}
          })
          .then(response => this.handleResponse(response))
        } catch (error) {
          this.errors = error
          console.error('[fetchDataLive] Error:', error)
        }
        this.loading = false
      },

      async fetchDataCached() {
        this.loading = true
        try {
          await fetchJSON(`/proxy/trivial`, {
            method: 'POST',
            body: JSON.stringify({
              path: `/apps/${this.app_id}/last_request`,
              payload: this.mergedOptions()
            }),
            headers: {'content-type': 'application/json'}
          })
          .then(response => this.digContentFromDiagnostics(response))
          .then(response => this.handleResponse(response))
        } catch (error) {
          this.errors = error
          console.error('[fetchDataCached] Error:', error)
        }
        this.loading = false
      },

      digContentFromDiagnostics(response) {
        if (response.status >= 400) {
          this.shouldSuggestCacheRefresh = true
          return {statusCode: response.status, body: response.error}
        }
        try {
          // Dig the previous response out of the diagnostics
          let content = response.diagnostics.events[response.diagnostics.events.length - 2].detail.content
          let statusCode = response.status
          return {statusCode: statusCode, body: content}
        } catch(e) {
          console.log(`Could not digContentFromDiagnostics: ${e}`)
          this.shouldSuggestCacheRefresh = true
          return {statusCode: 500, body: `Could not read cached results`}
        }
      },

      /* Write CSS vars into the dom at load to make them accessible to chartJS here*/
      getColor(i) {
        let el = this.$refs[`series-${i}`]
        return el ? window.getComputedStyle(el).getPropertyValue("color") : "#333"
      },

      setColors() {
        let i = 1
        for (let dataset of this.datasets) {
          dataset.backgroundColor = this.getColor(i)
          dataset.borderColor = this.getColor(i)
          i++
        }
      },

    }
  }
</script>