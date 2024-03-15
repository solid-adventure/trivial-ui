<template>
  <div class="modal-overlay visible">
    <div class="modal modal-medium-large padding">
      <h1 class="modal-title">Add Chart</h1>
      <span @click="close" class="close-icon"></span>
    
      <div class="FormWrapper">
        <select v-model="existing">
          <option :value="false">Create New</option>
          <option :value="true">Choose Existing</option>
        </select>

        <div v-if="existing">

          <div class="row">
            <div class="column">
              <label for="app_name" class="FormLabel">Name</label>
              <select v-model="existingAppName">
                <option v-for="app of appList" :value="app.name">{{app.descriptive_name}}</option>
              </select>
            </div>
            <div class="column">
              <label for="panels" class="FormLabel">Display</label>
              <input type="text" name="panels" class='text-field disabled' :value="existingAppType" readonly />
            </div>
          </div>


        </div>
        <div v-else>
          <div class="row">
            <div class="column">
              <label for="app_name" class="FormLabel">Name</label>
              <input type="text" name="app_name" class='text-field' ref='app_name' v-model='appName' placeholder='App Name' @keydown.prevent.enter="createPanel"/>
            </div>
            <div class="column">
              <label for="panels" class="FormLabel">Display</label>
              <select v-model="appPanelComponent">
                <option v-for="appPanel of appPanelNames" :value="appPanel.name">{{appPanel.display_name}}</option>
              </select>
            </div>
          </div> <!-- /row -->
          <div class="row">
            <div class="column">
              <label for="full_width" class="FormLabel">Full Width</label>
              <toggleButton v-model="full_width" />
            </div>
          </div>
        </div> <!-- v-else -->
      </div> <!-- FormWrapper -->

      <div class="button-row headroom">
        <input type="button" class="button-small " @click="close" value="Cancel">
        <input type="button" class="button-medium save" @click="addPanel" value="Add Chart">
      </div>
    </div>
  </div>
</template>

<script>

  import App from '../../models/App'
  import AppPanel from './AppPanel'
  import Modal from '../../components/Modal.vue'
  import ToggleButton from '../controls/ToggleButton.vue'
  import { mapState } from 'vuex'

  export default {

    mixins: [
      Modal
    ],

    components: {
      ToggleButton
    },

    props: {

      dashboardAppName: {
        type: String,
        required: true
      },

      newPanelDefaultName: {
        type: String,
        required: true
      }
    },

    data() {
      return {
        appName: '',
        appPanelComponent: "Headline",
        appPanelNames: AppPanel.names.filter(ap => !['Dashboard', 'Unset'].includes(ap.name)),
        existing: false,
        existingAppName: null,
        full_width: false
      }
    },

    mounted() {
      this.appName = this.newPanelDefaultName
    },

    computed: {

      appList() {
        let self = this.$store.state.apps.filter(a => a.name == this.dashboardAppName)[0]
        let alreadyAdded = self.panels.options.apps
        let excluded = [...alreadyAdded, ...this.dashboards]
        let apps = this.$store.state.apps.filter(a => !excluded.includes(a.name))
        return apps
      },

      dashboards() {
        return this.$store.state.apps.filter(a => this.isDashboard(a)).map(a => a.name)
      },

      existingAppType() {
        try {
          let app = this.$store.state.apps.filter(a => a.name == this.existingAppName)[0]
          return app.panels.component
        } catch(e) {
          return ''
        }
      },

      newPanelOptions() {
        return {
          "options": {
            full_width: this.full_width
          },
          "component": this.appPanelComponent
        }
      }
    },

    methods: {

      isDashboard(app) {
        try {
          return app.panels.component == 'Dashboard'
        } catch(e) {
          return false
        }
      },

      async addPanel() {
        if (this.existing) {
          await this.addExisting()
        } else {
          await this.createPanel()
        }
      },

      async addExisting() {
        let dashboardApp = new App(this.$store, this.dashboardAppName)
        dashboardApp.appendPanelOption({'apps': this.existingAppName})
        .then(n => this.$emit('close'))
        .catch(error => notifications.error(`Failed to add panel: ${error.message}`))
      },

      async createPanel() {
        let newPanelApp = new App(this.$store)
        newPanelApp.create({name: this.appName, panelOptions: this.newPanelOptions})
        .then(newPanelAppInstance => {
          let dashboardApp = new App(this.$store, this.dashboardAppName)
          dashboardApp.appendPanelOption({'apps': newPanelAppInstance.name})
          this.$emit('close')
        })
        .catch(error => notifications.error(`Failed to create panel: ${error.message}`))
      },

      ...mapState([
        'apps'
      ])

    }
  }
</script>

<style lang="scss" scoped>

  h1.modal-title {
    display: block;
  }

  .padding {
    padding: 2em;
  }

  .button-row {
    flex-direction: row;
  }

  .disabled {
    opacity: 0.5;
  }

  .FormWrapper {

      .row {
          display: flex;
          flex-direction: row;
          align-items: flex-start;

          .column {
              margin-right: 1em;
          }

      }

      li {
          list-style-type: none;
          line-height: 2em;
      }


      input, select {
          box-sizing: border-box;
          padding: 0.5em;
          width: 12em;
          color: var(--on-background);
          font-size: 1em;
          height: 3em;
      }

      input {
          width: 18em;
      }

      select {
          vertical-align:top;
      }

      li {
          font-size: 16px;
      }
  }

  .FormLabel, .label{
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      display: block;
  }
    
</style>
