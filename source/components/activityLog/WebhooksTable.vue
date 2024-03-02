<template>
  <div>
<!--     <Notices></Notices>
    <h1 class='headroom title'>Activity Log</h1>
    <p>Review the data passed into your app and how it was processed.</p>
    <div class="chart-area">
      <WebhooksChart></WebhooksChart>
    </div>
 -->
    <p v-if="loading">Loading...</p>
    <div v-if="!loading">
      <p v-if="!webhooks.length"><em>No events to display, run your app to create a history</em></p>
      <div v-if="webhooks.length > 0" class="headroom-mini header">
        <div class="table-row table-head" >
          <div class="table-column table-column-head"><h2>Log Entry</h2></div>
          <div class="table-column table-column-head entry-column-head">
            <h2>Log Data</h2>
            <!-- TODO, we need to query the the server, not just filter the results -->
            <!-- <SearchField :searchTerm="searchTerm" v-on:update="searchTerm=$event"></SearchField> -->
          </div>
        </div>
        <div class="table-body">
          <div class="table-column date-column">
            <div class="date-column-inner">
              <div v-for="(webhook) in filteredWebhooks"
                :key="webhook.id"
                class="date-selector"
                :class="{'selected': expanded[webhook.id], 'build': isBuild(webhook.id)}"
                @click.prevent="toggleExpanded(webhook.id)">

                <!-- Request event -->
                 <div v-if="!isBuild(webhook.id)" class="request-event-date">
                  <span
                    class="status-icon"
                    :class="successClassFromStatus(webhook.status)">                  
                  </span>
                  {{ webhook.created_at }}
                  <span>{{webhook.status || '---'}}</span>
                </div>
                <BuildEventMarker v-if="isBuild(webhook.id)" :event="webhook"/>
              </div>
            </div>
          </div>
          <div class="table-column entry-column">
            <div v-for="webhook in filteredWebhooks" :key="webhook.id">
                <JsonViewer v-if="expanded[webhook.id]" :webhook="webhook"></JsonViewer>
            </div>        
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

 .chart-area {
  margin: 4em 0;
 }

  h1.title {
    font-size: 3em;
  }

  .table_loading_container {
  	text-align: center;
  }

  div.entry-column-head {
    flex-grow: 3;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
  }

  div::-webkit-scrollbar { /* Safari, Chrome*/
    display: none;
  }

  div {
    scrollbar-width: none;  /* Firefox */
  }

  div.table-body {
    display: flex;
    flex-direction: row;
    height: calc(100%); // TODO height of sticky column headers

    div.date-column {
      margin: 0;
      border-right: 1px solid var(--on-background-40);
      display: flex;
      flex-direction: column;
      max-height: 100%;

      div.date-column-inner {
        height: 100%;
        overflow-y: scroll;
      }

      div.date-selector {
        width: 100%;
        padding: 0.5em 0;
        text-align: right;
        font-family: monospace;
        line-height: 1.3em;

        .request-event-date {
          display: flex;
          justify-content: space-evenly;
        }

        .status-icon {
          margin: 0;
          background-size: 1.3em;
          padding-left: 2em;
          background-repeat: no-repeat;
          background-position: left center;        }

        .error {
          color: var(--error);
          background-image: var(--error-icon);
        }

        &:hover {
          background-color: var(--on-background-20); 
          cursor: pointer;
        }


        &.selected {
          background-color: var(--accent);
          color: var(--on-accent);
        }

      }
    }

    div.entry-column {
      max-height: 100%;
      overflow: scroll;
      flex-grow: 3;
      margin: 1em;
    }

  }

  div.date-column > div:first-child {
    padding-top: 3em;
  }

  div.date-column > div:last-child {
    padding-bottom: 3em;
  }


  div.table-row {
  	display: flex;
  	width: 100%;
    padding: 0.5em;

  }

  div.table-head {
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid var(--on-background-40);
    top: 120px;
    position: sticky;
    background-color: var(--background);
    z-index: 2;
  }

  div.table-column {
  	width: calc(100% / 3);
  }

  div.table-column-head {
    margin-left: 1em;
  }

  div.reloader {
    background-color: var(--surface);
    padding: 1em;
    border: 1px dotted var(--accent);
  }
</style>

<script>
import { track } from '../../../lib/TrackingService'
import { formatJSON, fetchJSON } from 'trivial-core/lib/component-utils'
import BuildEventMarker from './BuildEventMarker.vue'
import notifications from '../../components/notifications'
import SearchField from '../../components/controls/SearchField.vue'
import JsonViewer from './JsonViewer.vue'
import WebhooksChart from './WebhooksChart.vue'
import Notices from '../Notices.vue'
import { mapState } from 'vuex'

  export default {

  components: {
    BuildEventMarker,
    JsonViewer,
    Notices,
    SearchField,
    WebhooksChart
  },

  data() {
    return {
      loading: true,
      webhooks: [],
      expanded: {},
      webhookListener: (event) => this.receivedWebhook(event),
      searchTerm: ''
    }
  },

  mounted() {
    // delay gives a minimum display time to loading state
    setTimeout(this.fetchData, 500)

  },
  watch: {
    async app(newApp) {
      window.document.title = `Activity: ${newApp.descriptive_name}`
    }
  },
  computed: {
    appId() {
      return this.$route.params.id;
    },
    filteredWebhooks() {
      if (this.searchTerm == '') { return this.webhooks }
      let term = this.searchTerm.toLowerCase()
      return this.webhooks.filter(w => {
        return (
          JSON.stringify(w.diagnostics).toLowerCase().includes(term) ||
          JSON.stringify(w.payload).toLowerCase().includes(term) ||
          w.status == term
        )
      })
    },

    ...mapState([
      'app'
    ])
  },

  methods: {

    isBuild(id) {
      try {
        return this.webhooks.find(w => w.id == id).activity_type == 'build'
      } catch(e) {
        console.log(`WebhooksTable could not determine activity_type: ${e}`)
        return false
      }
    },

    async fetchData() {
      try {
        await this.$store.state.Session.apiCall(`/activity_entries?app_id=${this.appId}`)
        .then(webhooks => this.webhooks = webhooks)
        .then(webhooks => this.selectFirst(webhooks))
      } catch (error) {
        console.error('[WebhooksTable][fetchData] Error:', error)
        notifications.error(`Could not load webhooks: ${error.message}`)
      }
      this.loading = false
    },

    selectFirst(webhooks) {
      if (webhooks && webhooks.length > 0) {
        this.toggleExpanded(webhooks[0].id)
      }
    },

    receivedWebhook(event) {
      notifications.info('New data available', {actions: {Reload: () => this.reload()}})
      track('Received New App Data', {
        'App ID': this.appId
      })
    },

    async reload() {
      // uncomment the following to show the loading state while new data is fetched
      // this.loading = true
      await this.fetchData()
    },

    isoStringToLocal(s) {
      let b = s.split(/\D+/)
      let utc = Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6])
      utc = new Date(utc)
      let options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      return utc.toLocaleTimeString('en-us', options);
    },

    payloadPreview(payload) {
      let out = formatJSON(payload).replace(/\s+/g, ' ').trim()
      out = (out == '') ? 'None' : out
      return (out.length > 25) ? `${out.substring(0,25)}...` : out
    },

    toggleExpanded(id) {
      this.expanded = {}
      this.expanded[id] = true;
    },

    successClassFromStatus(status) {
      if (!status) { return 'error' }
      if (status >= 200 && status < 400) { return 'success' }
      if (status >= 400) { return 'error' }
    },
  }
}
</script>
