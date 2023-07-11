<template>
  <div class="panels">
    <component :is="panelComponent" :app_id="appId" />
  </div>
</template>

<style lang="scss" scoped>

  .panels {
    position: absolute;
    width: 100%;
    top: 80px; /* clear the SuperBar*/
    padding: 0;
    margin: 0;
    height: calc(100% - 80px);
    z-index: 10;
  }

</style>

<script>
  import { mapState } from 'vuex'
  import Dashboard from './panels/Dashboard.vue'
  import CSVUpload from './panels/CSVUpload.vue'
  import Headline from './panels/Headline.vue'
  import LineChart from './panels/LineChart.vue'
  import Spreadsheet from './panels/Spreadsheet.vue'
  import StackedBarChart from './panels/StackedBarChart.vue'
  import TableView from './panels/TableView.vue'
  import Unset from './panels/Unset.vue'
  import Workbook from './panels/Workbook.vue'

  export default {

    components: {
      Dashboard,
      CSVUpload,
      Headline,
      LineChart,
      Spreadsheet,
      StackedBarChart,
      TableView,
      Unset,
      Workbook
    },

    mounted() {
      document.title = this.pageTitle
    },

    computed: {

      pageTitle() {
        return this.app.descriptive_name
      },

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
