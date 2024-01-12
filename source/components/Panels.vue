<template>
  <div class="panels">
    <component :is="panelComponent" :app_id="appId" />
  </div>
</template>

<style lang="scss" scoped>

  .panels {
    position: absolute;
    width: 100%;
    top: 120px; /* clear the SuperBar*/
    padding: 0;
    margin: 0;
    height: calc(100% - 80px);
    z-index: 10;
  }

</style>

<script>
  import { mapState } from 'vuex'
  import Contract from './panels/Contract.vue'
  import Dashboard from './panels/Dashboard.vue'
  import Headline from './panels/Headline.vue'
  import LineChart from './panels/LineChart.vue'
  import Spreadsheet from './panels/Spreadsheet.vue'
  import StackedBarChart from './panels/StackedBarChart.vue'
  import TableView from './panels/TableView.vue'
  import Unset from './panels/Unset.vue'
  import Workbook from './panels/Workbook.vue'

  export default {

    components: {
      Contract,
      Dashboard,
      Headline,
      LineChart,
      Spreadsheet,
      StackedBarChart,
      TableView,
      Unset,
      Workbook
    },

    watch: {
      async app(newApp) {
        if (newApp) {
          window.document.title = newApp.descriptive_name;
        }
      }
    },
    computed: {
      panelComponent() {
        try {
          return this.app.panels.component
        } catch (e) {
          return "Unset"
        }
      },

      appId() {
        return this.app.name
      },

      ...mapState([
        'app'
      ])
    }
  }
</script>
