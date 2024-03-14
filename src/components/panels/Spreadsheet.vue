<template>
  <div class="container">
    <div class="table-name-container">
      <h1>{{tableName}}</h1>
    </div>
    <hot-table :settings="settings" ref="hotTable"></hot-table>
  </div>
</template>

<script>
  import PanelBase from './PanelBase.vue'
  import { HotTable } from '@handsontable/vue3';
  import { registerAllModules } from 'handsontable/registry';

  // register Handsontable's modules
  registerAllModules();

  export default {

    mixins: [PanelBase],

    components: {
      HotTable
    },

    data() {
      return {
        tableName: '-',
        columnNames: ['','','','','',''],
        rows: [
          ['','','','','',''],
          ['','','','','',''],
          ['','','','','',''],
          ['','','','','',''],
          ['','','','','',''],
          ['','','','','','']
        ],
        settings: {
          data: this.rows,
          colHeaders: true,
          rowHeaders: true,
          width: "auto",
          height: "auto",
          manualColumnResize: true,
          stretchH: 'all',
          contextMenu: true,
          licenseKey:  'non-commercial-and-evaluation'
        }
      }
    },

    computed: {
      tableName() {
          return this.app.descriptive_name
        }
    },

    methods: {

      handleResponse(response) {
        if (response.statusCode >= 400) {
          this.errors = response.body
        } else {
          try {
            let r = response.body
            this.setData(r)
          } catch (error) {
            this.errors = error
          }          
        }
      },

      setData(r) {
        this.rows = r.rows
        this.columnNames = r.columnNames
        this.$refs.hotTable.hotInstance.updateSettings({
          data: this.rows,
          colHeaders: this.columnNames      
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

  // @import '~handsontable/dist/handsontable.full.css';

  .container {
    width: 100%;
    height: auto;
    margin: 0;
  }

</style>