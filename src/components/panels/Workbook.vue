<template>
  <div class="workbook-container" :class="{standalone: standAlone}">
      <Notices :pinned="false"></Notices>

      <h1 v-if="standAlone">{{this.app.descriptive_name}}</h1>
      <a v-else :href="`/apps/${app_id}/`"><h2>{{this.app.descriptive_name}}</h2></a>
      <span v-if="editMode">
        <a :href="`/apps/${app_id}/settings2`">Edit</a>
        <span class='pipe'>|</span>
      </span>
      <a href="#" v-on:click.prevent="exportExcel">Download XLS</a>
      <div class="tabs-container">
        <div v-for="(sheetName, index) of sheets.name" class="tab" :class="{active: sheetIsActive(index)}">
          <a v-if="!sheetIsActive(index)" href="#" v-on:click.prevent="setActiveSheet(index)">{{sheetName}}</a>
          <span v-else>{{sheetName}}</span>
        </div>
        <div v-if="editMode" class="tab">
          <a href="#" v-on:click.prevent="createSheet()" >New</a>
        </div>
      </div>
      <div v-for="(appSheetId, index) in sheets.id">
        <div :class="{hidden: !sheetIsActive(index)}">
          <TableView :app_id="appSheetId" :displayName="false" :options="params" v-bind="$attrs" :isActive="sheetIsActive(index)"/>
          <a v-if="editMode" href='#' v-on:click.prevent="deleteSheet(appSheetId)" class="button-medium secondary-button headroom legroom">Delete Sheet</a>
        </div>
      </div>
 
      <table id="metaSheet" class="hidden">
        <tbody>
          <tr></tr>
          <tr><td></td><td>Hi there! 👋🏼 </td></tr>
          <tr></tr>
          <tr><td></td><td>This file was generated from a script with Trivial.</td></tr>
          <tr><td></td><td>Click here to create a new version.</td></tr>
          <tr></tr>
          <tr><td></td><td>Click here to make your own spreadsheet generator today!</td></tr>
        </tbody>
      </table>

  </div>
</template>

<script>
  import App from '../../models/App'
  import PanelBase from './PanelBase.vue'
  import { mapState } from 'vuex'
  import notifications from '../notifications'

  import * as XLSX from 'xlsx/xlsx.mjs';

  import Notices from '../Notices.vue'
  import TableView from './TableView.vue'


  export default {

    components: {
      Notices,
      TableView
    },

    mixins: [PanelBase],

    data() {
      return {
        activeSheet: 0
      }
    },

    computed: {

      params() {
        try {
          let options = this.app.panels.options.params || {} // saved
          return Object.assign(options, this.options) // inherited from parent
        } catch(e) {
          return {}
        }
      },

      appSheetIds() {
        try {
          return this.app.panels.options.app_sheets || []
        } catch(e) {
          return []
        }
      },

      newSheetName() {
        let count = this.appSheetIds.length + 1
        return `${this.app.descriptive_name} ${count}`
      },

      newSheetOptions() {
        return {
          "options": {},
          "component": "TableView"
        }
      },

      sheets() {
        let sheetNames = []
        let sheetIds = []
        for (let appId of this.appSheetIds) {

          try {
            let sheetName = this.sheetName(appId)
            sheetIds.push(appId)
            sheetNames.push(sheetName)
          }
          catch(err) {
            console.error('Sheet Name Error: ', err)
          }
        }
        return {
            name: sheetNames,
            id: sheetIds 
        }
      },

      ...mapState([
        'apps'
      ])

    },

    methods: {
      // Workbook renders against the apps set in its options, and skips the network call.
      fetchData() {
        return false
      },

      sheetIsActive(index) {
        return index == this.activeSheet
      },

      sheetApp(appId) {
        return this.$store.state.apps.find(app => app.name == appId)

      },

      columnFormats(appId) {
        return this.sheetApp(appId).panels.options.columnFormats || {}
      },

      sheetName(appId) {
        // Sheet name cannot contain : \ / ? * [ ]
        // Sheet name has a max length of 31 characters
        let name = this.sheetApp(appId).descriptive_name
        return name.replace(/[/[\]\?\*]/g, ' ')
        .trim()
        .slice(0,31)
      },

      setActiveSheet(sheetIndex) {
        this.activeSheet = sheetIndex
      },

      indexForSheet(appId) {
        return this.appSheetIds.findIndex(id => id == appId)
      },

      async createSheet() {
        let newSheetApp = new App(this.$store)
        newSheetApp.create({name: this.newSheetName, panelOptions: this.newSheetOptions})
        .then(newSheetAppInstance => {
          let workbookApp = new App(this.$store, this.app.name, this.app)
          workbookApp.appendPanelOption({'app_sheets': newSheetAppInstance.name})
        })
        .then(x => this.setActiveSheet(this.indexForSheet(newSheetApp.name)))
        .catch(error => notifications.error(`Failed to create sheet: ${error.message}`))
      },

      async deleteSheet(app_id) {
        if (!confirm("Permanently delete this sheet? This cannot be undone.")) { return false }
        let sheetApp = new App(this.$store, app_id)
        sheetApp.destroy()
        let workbookApp = new App(this.$store, this.app.name)
        await workbookApp.deletePanelOption({'app_sheets': app_id})
        this.setActiveSheet(this.activeSheet - 1)
      },

      exportExcel() {
        let wb = XLSX.utils.book_new()
        for (let appSheetId of this.appSheetIds) {
          let ws = XLSX.utils.table_to_sheet(document.getElementById(`raw-tableView-${appSheetId}`), {raw: true});
          ws = this.formatSheet(ws, appSheetId)
          XLSX.utils.book_append_sheet(wb, ws, this.sheetName(appSheetId))
        }
        XLSX.utils.book_append_sheet(wb, this.metaSheet(), '>> Read Before Editing')
        XLSX.writeFile(wb, `${this.app.descriptive_name}.xlsx`); // TODO Santize filename
      },

      metaSheet() {
        let ws = XLSX.utils.table_to_sheet(document.getElementById(`metaSheet`));
        ws["B5"].l = { Target: this.editUrl, Tooltip: "Edit in Trivial" };
        ws["B7"].l = { Target: 'https://www.withTrivial.com?ref=excelSheet', Tooltip: "Learn more about Trivial spreadsheet generators" };
        return ws
      },

      formatSheet(ws, appSheetId) {
        let columnFormats = this.columnFormats(appSheetId)
        for (let col of Object.keys(columnFormats)) {
          let range = XLSX.utils.decode_range(ws['!ref'])
          for (let row = range.s.r + 1; row <= range.e.r; ++row) {
            const ref = XLSX.utils.encode_cell({ r: row, c: Number(col) })
            if (ws[ref] && this.columnIsMoney(appSheetId, col)){
              ws[ref].t = 'n'
              ws[ref].z = '$0.00'
            }
            if (ws[ref] && this.columnIsPercent(appSheetId, col)){
              ws[ref].t = 'n'
              ws[ref].z = '0.0%'
            }
            if (ws[ref] && this.columnIsText(appSheetId, col)){
              ws[ref].t = 's'
            }
          }
        }
        return ws
      },

      // TODO Shared Lib Start
      columnFormat(appId, col) {
        try {
          let formatter = this.columnFormats(appId)[col] || {}
          return formatter.type || "general"
        } catch(e) { return "general" }
      },

      columnIsMoney(appId, col) {
        return this.columnFormat(appId, col) == "money"
      },

      columnIsPercent(appId, col) {
        return this.columnFormat(appId, col) == "percent"
      },

      columnIsText(appId, col) {
        return this.columnFormat(appId, col) == "text"
      },
      // TODO Shared Lib End

    }
  }
</script>

<style lang="scss" scoped>

  .workbook-container {

    .pipe {
      margin-left: 0.2em;
      margin-right: 0.2em;
    }

    .tabs-container {
      display: flex;
      margin-top: 1em;
      margin-left: 2em;

      .tab {
        padding: 0.6em 1em;
        margin-left: 0.2em;
        margin-right: 0.2em;
        border-top: 1px solid;
        border-left: 1px solid;
        border-right: 1px solid;
        border-color: var(--background-80);
        background-color: var(--surface);
        color: var(--on-surface);
      }

      .active {
        background-color: var(--accent-20);
        color: var(--on-background);
        border-bottom: 0;
        border-color: var(--accent);
      }

    }

    .hidden {
      display: none;
    }

    .panels-container {
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
    padding: 2em;

    h1 {
      color: var(--series-1);
      font-size: 5em;
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
</style>