<template>
  <div class="actions-container">
    <Notices />
    <h1>Action Creator</h1>
    <p>Create a new action from a template.</p>
    <div v-if="displayNewActionForm">
      <p>
        <label>Name</label><br />
        <input type="text" placeholder="Service Name" ref="service" v-model="service" /> / <input type="text" placeholder="Action Name" v-model="action"/><br />
        <em>If service already exists, select an Auth Template that matches to avoid unpredictable results.</em><br />
        <em>Existing files will not be overwritten.</em>
      </p>

      <p>
        <label>Auth Template</label><br />
        <select v-model="template">
          <option v-for="option in templates" v-bind:value="option.value">{{option.text}}</option>
        </select>
      </p>
      <p>
        <ActionButton value="Cancel" class="button-medium secondary-button" :action="toggleNewActionFormDisplay" />
        <ActionButton value="Create Action" class="button-medium" :action="createAction" />
      </p>
    </div>
  </div>
</template>

<script>
  import ActionButton from './controls/ActionButton.vue'
  import { fetchJSON } from 'trivial-core/lib/component-utils'
  import notifications from '../components/notifications'
  import Notices from '../components/Notices.vue'

  export default {
    data(){
      return {
        service: "MirrorTech",
        action: "GetOrders",
        template: "token_api_action",
        templates: [
          {text: "Token API", value: "token_api_action"},
          {text: "Oauth2 API", value: "oauth2_api_action"}
          ],
        displayNewActionForm: true
      }
    },

    computed: {

    },
    components: {
      ActionButton,
      notifications,
      Notices
    },

    methods: {

      toggleNewActionFormDisplay() {
        this.displayNewActionForm = !this.displayNewActionForm
        if (!this.displayNewActionForm) { return false }
        this.$nextTick(() => {
          this.$refs.service.focus()
        })
      },

      async createAction() {
        console.log(`[createAction] firing `)
        let response = await fetchJSON('/actions', {
          method: 'post',
          headers: {'content-type': 'application/json'},
          body: JSON.stringify({
            service: this.service,
            action: this.action,
            template: this.template,
            // force_failure: true
          })
        })
        .catch(e => this.handleResponse(e))
        this.handleResponse(response)
      },

      handleResponse(response) {
        if (response && response.status == 200 && response.body) {
          notifications.info(response.body)
        } else if (response && response.body) {
          notifications.error(response.body)
        } else {
          notifications.error('Unable to complete request.')
        }
      }
    }
  }
</script>

<style scoped>
  .actions-container {
    padding: calc(80px + 3.625em + 1px + 1em) 4em 4em 4em;
  }

  h1 {
    font-size: 5em;
    font-weight: 100;
    margin: 1em 0 .5em 0;
  }

  input[type=text] {
    font-size: inherit;
    font-family: var(--code-font);
    border: 1px solid var(--accent);
  }

</style>