<template>
  <div class="dashboard-settings-container">
    <a @click.prevent="close" class="close">Close</a>
    <h1>Dashboard Settings</h1>
    <div class="saving-status">
      <span v-if="saving" class="success">
        Saving...
      </span>
      <span v-if="savingError" class="error">
        Save failed, please try again.
      </span>
    </div>

    <p><label for="name">Name</label></p>
    <em>The title of the dashboard.</em>
    <input id="name" type="text" v-model="name" />

    <p><label for="date_range">Date Range</label></p>
    <em>The default date range selected when the dashboard loads.</em>
    <select id="date_range" v-model="date_range">
      <option v-for="range of dateRangeNames">{{ range }}</option>
    </select>

    <p><label for="timezone">Time Zone</label></p>
    <em>The timezone reports will be generated in. If no option is selected, the user's timezone will be used.</em>
    <select id="timezone" v-model="timezone">
      <option v-for="timezone of timezones">{{ timezone }}</option>
    </select>

    <div class="advanced-settings">
      <RouterLink :to="`/apps/${appId}/settings2`">Advanced Settings</RouterLink>
    </div>

  </div>
</template>

<script>

  import App from '../../models/App'
  import AppPanel from './AppPanel'
  import ToggleButton from '../controls/ToggleButton.vue'
  import { mapMutations, mapState } from 'vuex'

  export default {

    components: {
      ToggleButton
    },

    props: {

      dateRangeNames: {
        type: Array,
        required: true
      },

      appId: {
        type: String,
        required: true
      }
    },

    data() {
      return {
        saving: false,
        savingError: false,
        name: '',
        date_range: '',
        timezone: '',
        saveTimer: null
      }
    },

    mounted() {
      this.setDataFromAppOptions()
    },

    watch: {

      name(newVal) {
        this.saveAppAttribute("descriptive_name", newVal)
      },

      date_range(newVal) {
        this.saveOptionAttribute("date_range", newVal)
      },

      timezone(newVal) {
        this.saveOptionAttribute("timezone", newVal)
      },

    },

    computed: {

      timezones() {
        // TODO highlight US options
        return Intl.supportedValuesOf('timeZone')
      },

      ...mapState([
        'app'
      ])

    },

    methods: {

      setDataFromAppOptions() {
        this.name = this.app.descriptive_name
        this.date_range = this.app.panels.options.date_range
        this.timezone = this.app.panels.options.timezone
      },

      close() {
        this.$emit('close')
      },

      saveAppAttribute(attr, newVal) {
        window.clearTimeout(this.saveTimer)
        this.saveTimer = window.setTimeout(() => {this.saveAppAttributeDebounced(attr, newVal)}, 1000)
      },

      saveOptionAttribute(attr, newVal) {
        window.clearTimeout(this.saveTimer)
        this.saveTimer = window.setTimeout(() => {this.saveOptionAttributeDebounced(attr, newVal)}, 1000)
      },

      saveAppAttributeDebounced(attr, newVal) {
        if (this.app[attr] == newVal) { return }
        this.saving = true
        this.savingError = false
        let app = new App(this.$store, this.appId)
        this.setAppAttribute({app_id: this.appId, attr: attr, val: newVal })
        app.save()
        .then( r => this.handleSaveSuccess(r) )
        .catch( e => this.handleSaveError(e))
      },

      saveOptionAttributeDebounced(attr, newVal) {
        if (this.app.panels.options[attr] == newVal) { return }
        this.saving = true
        this.savingError = false
        let app = new App(this.$store, this.appId)
        let option = {}
        option[attr] = newVal
        app.setPanelOption(option)
        .then( r => this.handleSaveSuccess(r) )
        .catch( e => this.handleSaveError(e))
      },

      handleSaveSuccess(r) {
        this.saving = false
      },

      handleSaveError(e) {
        console.error(e)
        this.saving = false
        this.savingError = true
      },

      ...mapMutations(['setAppAttribute'])

    }
  }
</script>

<style lang="scss" scoped>

h1 {
  display: block;
}

p {
  margin-bottom: 0;
}

label {
  color: var(--on-surface);
}

em {
  display: block;
  color: var(--on-surface);
}

input, select {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.dashboard-settings-container {
  position: fixed;
  top: 120px;
  left: 50%;
  background: var(--surface);
  color: var(--on-surface);
  padding: 2em;
  height: calc(100% - 80px - 4em);
  z-index: 10;
  max-width: 24em;
  box-shadow: 6px 0px 5px 0px var(--surface);
  -webkit-box-shadow: 6px 0px 5px 0px var(--surface);
  -moz-box-shadow: 6px 0px 5px 0px var(--surface);

  .close {
    position: absolute;
    top: 1em;
    right: 1em;
    color: var(--on-surface);
  }

  .saving-status {
    display: block;
    margin-top: 0;
    margin-bottom: 0;
    height: 1em;
  }

  .error {
    color: red;
  }

  .advanced-settings {
    position: absolute;
    bottom: 4em;

    & a {
      color: var(--on-surface);
    }
  }

}
    
</style>
