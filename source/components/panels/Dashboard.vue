<template>
  <div class="dashboard-container">
    <Notices :pinned="false"></Notices>
    <DashboardSettings v-if="this.settingsPanelOpen" @close="toggleSettings" :dateRangeNames="dateRangeNames" :appId="this.app_id"></DashboardSettings>
    <h1>{{this.app.descriptive_name}}</h1>
    <span v-if="editMode">
      <a href="#" v-on:click.prevent="createPanelOpen=true">Add Chart</a>
      <CreatePanel v-if="createPanelOpen"
        :newPanelDefaultName="newPanelName"
        :dashboardAppName="this.app.name"
        @close="createPanelOpen=false"/>
      | <a @click.prevent="toggleSettings">Settings</a>
    </span>
    <div class="date-picker-container">
      <select v-model="dateRangeName" class="date-range-name">
        <option v-for="rangeName of dateRangeNames">{{rangeName}}</option>
        <option name="Custom">Custom</option>
      </select>
      <date-picker prefix-class="xmx" v-model="namedDateRange" :range="true"></date-picker>
     </div>
      <div class="panels-container">
        <div class="row" v-for="childApp in partialWidthPanels">
          <component v-if="start_at && end_at" :is="childApp.component" :key="childApp.id" :app_id="childApp.id" :parent_app_id="app.name" :options="{start_at: start_at, end_at: end_at}" @set-selected-panel-values="setSelectedPanelValues"/>
        </div>
      </div>

      <div class="full-width-panels-container">
        <div v-for="childApp in fullWidthPanels" class="full-width-panel-container">
          <component v-if="start_at && end_at" :is="childApp.component" :key="childApp.id" :app_id="childApp.id" :parent_app_id="app.name" :options="{start_at: start_at, end_at: end_at}" @set-selected-panel-values="setSelectedPanelValues"/>
        </div>
      </div>
 
  </div>
</template>

<script>
  import Clipboard from '../../lib/Clipboard'
  import CreatePanel from './CreatePanel.vue'
  import DashboardSettings from './DashboardSettings.vue'
  import DatePicker from 'vue2-datepicker';
  import Notices from '../Notices.vue'
  import PanelBase from './PanelBase.vue'
  import { mapState } from 'vuex'


  // Panels
  import Headline from './Headline.vue'
  import LineChart from './LineChart.vue'
  import notifications from '../notifications'
  import Section from './Section.vue'
  import Spreadsheet from './Spreadsheet.vue'
  import StackedBarChart from './StackedBarChart.vue'
  import TableView from './TableView.vue'
  import Workbook from './Workbook.vue'

  export default {

    components: {
      CreatePanel,
      Notices,

      // Panels
      DatePicker,
      Headline,
      LineChart,
      Section,
      Spreadsheet,
      StackedBarChart,
      TableView,
      Workbook,

      // PanelSettings
      DashboardSettings,

    },

    mixins: [PanelBase],

    data() {
      return {
        createPanelOpen: false,
        dateRangeName: '',
        customDateRange: [],
        settingsPanelOpen: false,
        selectedPanelValues: null
      }
    },

    mounted() {
      this.setCustomDateRange()
      this.setDefaultDateRangeName()
      this.$store.state.keyboardControl.register('command-c', "Copy", this.handleCopy.bind(this))
    },

    computed: {


      appPanels() {
        try {
          return this.apps.filter(app => app.panels)
          .map(app => {return {
            id: app.name,
            component: app.panels.component,
            options: app.panels.options
            }
          })
          .filter(panel => this.panelIds.includes(panel.id))
        } catch(e) {
          return []
        }
      },

      panelIds() {
        try { 
          return this.app.panels.options.apps || []
        } catch (e) {
          return []
        }
      },

      defaultTimezone() {
        try {
          return this.app.panels.options.timezone
        } catch(e) {
          return
        }
      },

      dateRangeNames() {
        return [
          'Today',
          'Yesterday',
          'Last Week',
          'Last Month',
          'Last Year',
          'YTD',
          'Last 365 Days',
        ]
      },

      namedDateRange: {
        get: function() {
          let s = null
          let e = null
          switch (this.dateRangeName) {
          case 'Today':
            return [new Date(), new Date()]
          case 'Yesterday':
            s = new Date()
            s.setDate(s.getDate() - 1)
            return [s, s]
          case 'Last Week':
            s = new Date()
            s.setDate(s.getDate() - (s.getDay() + 6) % 7)  // Monday of this week
            s.setDate(s.getDate() - 8) // previous Sunday
            e = new Date(s)
            e.setDate(s.getDate() + 6)
            return [s, e]
          case 'Last Month':
            s = new Date()
            s = new Date(s.getFullYear(), s.getMonth() - 1, 1)
            e = new Date()
            e = new Date(e.getFullYear(), e.getMonth(), 0)
            return [s,e]
          case 'Last Year':
            s = new Date()
            s = new Date(s.getFullYear() - 1, 0, 1)
            e = new Date(new Date().getFullYear() - 1, 11, 31)
            return [s,e]
          case 'YTD':
            s = new Date()
            s = new Date(s.getFullYear(), 0)
            e = new Date()
            return [s,e]
          case 'Last 365 Days':
            s = new Date()
            s.setDate(s.getDate() - 364)
            e = new Date()
            return [s,e]
          case 'Custom':
            return this.customDateRange
          default:
            return [this.start_at_default, this.end_at_default]
          }
        },

        set: function(newVal) {
          this.dateRangeName = 'Custom'
          this.customDateRange = newVal
        }
      },

      namedRangeMode() {
        return this.dateRangeNames.includes(this.dateRangeName)
      },

      start_at() {
        let d = this.dateFromRangeTypeAndPosition(0)
        if (!d) { return }
        // drop time to get midnight in TZ
        d = new Date(d.toLocaleDateString('en-US', { timeZone: this.defaultTimezone, timeZoneName: 'short' }))
        return d
      },

      end_at() {
        let d = this.dateFromRangeTypeAndPosition(1)
        if (!d) { return }
        // drop time to get midnight in TZ, go forward 1 whole day, then back 1 millisecond to get the end of the day
        d = new Date(d.toLocaleDateString('en-US', { timeZone: this.defaultTimezone, timeZoneName: 'short' }))
        d.setDate(d.getDate() + 1)
        d.setTime(d.getTime() -1)
        return d
      },

      partialWidthPanels() {
        return this.appPanels.filter(panel => !panel.options.full_width)
      },

      fullWidthPanels() {
        return this.appPanels.filter(panel => panel.options.full_width)
      },

      newPanelName() {
        let count = this.appPanels.length + 1
        return `${this.app.descriptive_name} ${count}`
      },

      start_at_default() {
        let d = new Date()
        d.setDate(d.getDate() - (d.getDay() + 6) % 7)  // Monday of this week
        d.setDate(d.getDate() - 8) // previous Sunday
        return d
      },

      end_at_default() {
        let d = new Date(this.start_at_default)
        return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 6) // One week ahead of start date.
      },

      ...mapState([
        'apps',
        'app'
      ])

    },

    methods: {
       // Dashboard renders against the apps set in its options, and skips the network call.
      fetchData() {
        return false
      },

      toggleSettings() {
        this.settingsPanelOpen = !this.settingsPanelOpen
      },

      setCustomDateRange() {
        this.customDateRange = [this.start_at_default, this.end_at_default]
      },

      setDefaultDateRangeName() {
        try {
          this.dateRangeName = this.app.panels.options.date_range
        } catch(e) {
          this.dateRangeName = 'Last Week'
        }
      },

      dateFromRangeTypeAndPosition(i) {
        if (this.namedRangeMode) {
          return this.namedDateRange[i]
        } else {
          if (this.customDateRange.filter(a => a).length != 2) { return null }
          return this.customDateRange[i]
        }
      },

      setSelectedPanelValues(vals) {
        this.selectedPanelValues = vals
      },

      handleCopy(event) {
        // If normal text is selected, prefer that
        let content = window.getSelection().toString()
        if (content.length != 0) {
          Clipboard.copy(content)
          return
        }
        // Fallback to selected values from panels
        Clipboard.copy(this.selectedPanelValues)
        }

    }
  }
</script>

<style lang="scss">

  .standAlone {
    padding: 1em 3em;
  }

  .dashboard-container {

    position: relative;
    padding: 1em 3em;
    overflow: auto;

    h1 {
      display: inline;
    }

    h2 {
      margin-bottom: 0;
    }

    p {
      color: var(--on-background-40);
    }

    .row {
      display: flex;
      align-items: stretch;
    }

    .date-picker-container {
      position: absolute;
      top: 1em;
      right: 3em;

    }

    // https://stackoverflow.com/a/38764639/834094
    select.date-range-name {
      background: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0Ljk1IDEwIj48ZGVmcz48c3R5bGU+LmNscy0ye2ZpbGw6IzQ0NDt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPmFycm93czwvdGl0bGU+PHBvbHlnb24gY2xhc3M9ImNscy0yIiBwb2ludHM9IjEuNDEgNC42NyAyLjQ4IDMuMTggMy41NCA0LjY3IDEuNDEgNC42NyIvPjxwb2x5Z29uIGNsYXNzPSJjbHMtMiIgcG9pbnRzPSIzLjU0IDUuMzMgMi40OCA2LjgyIDEuNDEgNS4zMyAzLjU0IDUuMzMiLz48L3N2Zz4=) no-repeat 95% 50%;
      -moz-appearance: none;
      -webkit-appearance: none;
      appearance: none;
      height: 34px;
      padding: 0 2em;
      background-color: var(--surface);
      font: 14px/1.5 "Helvetica Neue",Helvetica,Arial,"Microsoft Yahei",sans-serif;
    }

    .full-width-panels-container {
      margin-top: 3em;

      .full-width-panel-container {
        margin-top: 3em;
      }

    }

    .panels-container {
      margin-top: 3em;
      display: flex;
      flex-direction: column;

      @media only screen and (min-width: 600px) {
        flex-direction: row;
        justify-content: space-between;
      } 
    }
  }

  .panel {
    border: 1px solid var(--on-background-20);
    border-radius: 12px;
    background: var(--surface);

    h1 {
      font-size: 3em;
      margin-bottom: 0;
    }

  @media only screen and (min-width: 768px) {
    /* For mobile phones: */

    .panels-container {
      display: flex;
      flex-direction: row;
    }

    .panel {
      width: 320px;
      height: 200px;
    }
  }
}

.panel-inner {
    width: 320px;
    min-height: 200px;
    padding: 2em;
    position: relative;

  p {
    margin-top: 0;
  }
}

.panel-inner-full-width {
  padding: 2em;
  position: relative;

  p {
    margin-top: 0;
  }
}

.pallet {
  display: none;
}
.series-1 {
  color: var(--series-1);
}
.series-2 {
  color: var(--series-2);
}
.series-3 {
  color: var(--series-3);
}
.series-4 {
  color: var(--series-4);
}
.series-5 {
  color: var(--series-5);
}
.series-6 {
  color: var(--series-6);
}

.panel .edit-link, .panel .trash-link {
  display: none;
  position: absolute;
  top: 0;
  margin: 0;
  padding: 0.5em;
  min-width: 2em;
  background: var(--surface);
}

.panel .edit-link {
  left: 0;
  border-radius: 8px 0;
}

.panel .trash-link {
  right: 0;
  border-radius: 0 8px;
  text-align: right;
}


.panel:hover .edit-link, .panel:hover .trash-link {
  display: unset;
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



</style>