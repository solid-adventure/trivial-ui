<template>
  <div class="viewer-container">
      <div class="heading-row">
        <h2>Errors</h2>
         <a v-if="displayResendButton" href="#" class="button-medium headroom-mini" @click.prevent="resendPayload">{{resendText}}</a>
      </div>
      <ul v-if="errors.length > 0" class="history">
        <li v-for="error in errors" class="error">{{error.message}}</li>
      </ul>
      <ul v-if="errors.length == 0" class="history">
        <li class="success">None</li>
      </ul>

      <div class="details-row">
        <div>
          <h2>Status</h2>
          <ul class="history">
            <li :class="successFromStatus(this.webhook.status)">Returned {{this.webhook.status}}</li>
          </ul>
        </div>
        <div>
          <h2>Duration</h2>
          <p class='status-value'>{{this.webhook.duration_ms}}ms</p>
        </div>
      </div>

      <h2>History</h2>
      <ul class="history">
        <li v-if="this.webhook.activity_type != 'build'" class="success">
          <span class="title">Initial Payload</span>
          <div class="history-item-detail">
            <pre>{{payloadDisplay}}</pre>
            <CopyButton class="copy" :value="payloadDisplay"></CopyButton>
          </div>
        </li>
        <li v-for="item in this.history"
          :class="historyItemClass(item)">
          <span class="title">{{item.event}}</span>
          <div v-if="item.detail" class="history-item-detail">
            <pre>{{historyDetail(item)}}</pre>
            <CopyButton class="copy" :value="historyDetail(item)"></CopyButton>
          </div>
        </li>
      </ul>
    </div>
</template>

<style lang="scss" scoped>

  div::-webkit-scrollbar { /* Safari, Chrome*/
    display: none;
  }

  div {
    scrollbar-width: none;  /* Firefox */
  }

  .viewer-container {
  	width: 100%;
  	display: block;

    h2 {
      margin-bottom: 0.2em;
    }

  }

  .details-row {
    display: flex;
    justify-content: space-between;

    p.status-value {
      margin: 0;
      padding: 0;
      line-height: 2em;
    }

  }

  .heading-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .history {
    padding-bottom: 2em;
  }

  .history-item-detail {
    background-color: var(--background-high-contrast);
    border-radius: 8px;
    color: var(--on-background);
    max-height: 200px;
    overflow: scroll;
    margin: 0 0 1em 0;
    position: relative;

    pre {
      margin: 1em;
      line-height: 1.3em;
      color: var(--webhook-pre-color);
    }

  }

  .column-left {
  	overflow: scroll;
  	width: 40%;
  	margin: 1em;
  }

  /* Chrome and safari */
  .column-left::-webkit-scrollbar {
    display: none;
  }

  .column-left,
  .column-center {
  	-ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }

  .column-left pre {
  	white-space: pre-wrap;
      word-break: break-all;
  }

  pre.webhook {
    color: var(--webhook-pre-color);
  }

  ul.history {
  	margin-top: 0;
  }

  .history .title {
    text-transform: uppercase;
  }

  .history li {
  	list-style-type: none;
  	margin: 0;
    background-size: 1.3em;
    padding-left: 2em;
    margin-left: -2em;
    line-height: 2em;
  }

  .history li.success {
  	color: var(--on-background);
  	background-image: var(--success-icon);
  	background-repeat: no-repeat;
  	background-position: left center;
  }

  .history li.error {
  	color: var(--error);
  	background-image: var(--error-icon);
  	background-repeat: no-repeat;
  	background-position: left center;
  	white-space: normal;
  	overflow: visible;
  	word-wrap: break-word;
  	// &:hover{
  	// 	white-space: normal;
  	// 	overflow: visible;
  	// }
  }

  .history li.null {
  	color: var(--secondary);
  	text-decoration: line-through;
  	background-image: url("/source/assets/images/check-exclamation-light.svg");
  	background-repeat: no-repeat;
  	background-position: left center;
  }

  .link-out .icon {
    height: 1em;
    width: auto;
  }

  .copy {
    position: absolute;
    top: 0.5em;
    right: 0.5em;
    font-size: 1.2em;

  }

</style>

<script>
  import { track } from '../../../lib/TrackingService'
  import { formatJSON, fetchJSON } from 'trivial-core/lib/component-utils'
  import CopyButton from '../../components/controls/CopyButton.vue'
  import notifications from '../../components/notifications'

  export default {
    props: {
      webhook: Object,
    },

    components: {
      CopyButton,
    },

    mounted() {
      this.fetchEntry()
    },

    data() {
      return {
        diagnostics: {},
        resendText: 'Re-Send'
      }
    },

    computed: {

      displayResendButton() {
        return this.webhook.activity_type == 'request' && this.$store.state.enableWebhookAppTrigger
      },

      payloadDisplay() {
        return formatJSON(this.webhook.payload) || 'Empty payload'
      },

      diagnosticsFilters() {
        return this.diagnostics.filters || {}
      },

      selectedFilters() {
        return this.diagnosticsFilters[this.webhook.topic] || []
      },

      diagnosticsEvents() {
        return this.diagnostics.events || []
      },

      diagnosticsErrors() {
        return this.diagnostics.errors || []
      },

      history() {
        return this.selectedFilters
          .map(filter => {return {event: filter, success: true}})
          .concat(this.diagnosticsEvents)
      },

      errors() {
        return this.diagnosticsErrors
          .filter(error => error) // filter out non-objects
          .map((error) => {
            return {
              message: error.message,
              type: error.type,
              errno: error.errno,
              code: error.code
            }
          })
      }
    },

    methods: {

      // We get the basics from the prop, but load the full object here
      async fetchEntry() {
        try {
          let entry = await this.$store.state.Session.apiCall(`/activity_entries/${this.webhook.id}`)
         this.diagnostics = entry.diagnostics
        } catch (e) {
          console.error('[WebhooksTable][fetchData] Error:', e)
          notifications.error(`Could not load webhook: ${e.message}`)
        }
      },

      historyItemClass(item) {
        switch (item.success) {
          case true:
            return 'success'
          case false:
            return 'error'
          default:
            return 'null'
        }
      },

      successFromStatus(status) {
        if (!status) { return 'error' }
        if (status >= 200 && status < 400) { return 'success' }
        if (status >= 400) { return 'error' }
      },

    	historyDetail(item) {
        if (!item.detail)
          return null

    		return Object.keys(item.detail).map(name => {
    		  return `${name}: ${JSON.stringify(item.detail[name], null, 2)}`
    		}).join("\n")
    	},

      async resendPayload() {
        try {
          await this.$store.state.Session.apiCall(`/webhooks/${this.webhook.id}/resend`, 'POST')
          this.resendStatus('Sent!')
        } catch (error) {
          this.resendFailed(error)
        }
      },

      resendFailed(error) {
        console.log(`[JsonViewer][resend] failed, webhook_id: ${this.webhook.id}, error: ${error}`)
        this.resendStatus('Failed')
      },

      resendStatus(message) {
        this.resendText = message
        setTimeout(() => this.resendText = 'Re-Send', 2000)
      }
    }
  }
</script>
