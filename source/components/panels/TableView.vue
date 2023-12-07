<template>
  <div class="container">
    <div class="summary-bar-backer">
      <div class="summary-bar">
        <div class="table-name-container">
          <!-- <div class="row"> -->
            <h2 v-if="displayName">{{tableName}}</h2>
            <span v-if="editMode">
              <a :href="`/apps/${app_id}/builder2`">Edit in Builder</a>
              <!-- Manual Save button, works as expected -->
              <!-- <a :href="`#`" class="button-small" @click.prevent="tableSave">Save</a> -->
            </span>
              <div class="messages">
              <span class="error status-icon" v-if="errors">
                {{ errors }}
              </span>
              <span v-if="shouldSuggestCacheRefresh">
                <ActionButton class="button-small" :action="initialzeAndRefresh" value="Refresh Data" working-value="Refreshing..."/>
              </span>
              <span v-if="loading">
                Loading...
              </span>
              <span v-else>
                <div class="icon">
                  <a v-if="!shouldSuggestCacheRefresh && !isInPropDataMode" @click.prevent="initialzeAndRefresh">
                    <span class='refresh-icon'></span>
                  </a>
                </div>
              </span>
              </div>
            <!-- </div> --> <!-- End row-->
         </div>
        <span>Count <strong>{{selectedCnt}}</strong></span>
        <span>Avg <strong>{{formattedAvg}}</strong></span>
        <span class="sum">Sum <strong>{{formattedSum}}</strong></span>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <img />
    </div>

    <table v-else @mouseup="handleMouseup" :id="`tableView-${app_id}`">
      <thead class="sticky">
        <tr>
          <th></th> <!-- row number -->
          <th v-for="(name, col_index) of columnNames">
          <div class="header">
            <span class="title" :data-cell="`${col_index}`" @click="handleHeaderClick">{{name}}</span>
            <span v-if="editMode && autofillEnabled" class="action">
              <Popover value="⏣" class="column-options-icon" :open="col_index == openPopover" @toggleOpen="handlePopoverToggle(col_index)">
                <!-- Choose an option -->
                <div v-if="optionMode==null">
                  Choose an option to set:
                  <ul class="column-options-selector">
                    <li><a class='button-small' href="#" @click.prevent="optionMode='format'" >Format</a></li>
                    <li><a class='button-small' href="#" @click.prevent="optionMode='autofill'" >Autofill</a></li>
                  </ul>
                </div>
                <div v-else>
                  <p class="left">
                    <a href="#" @click.prevent="optionMode=null" >Back</a>
                  </p>
                </div>

                <!-- Autofill -->
                <div v-if="optionMode=='autofill'" >
                  <p class="instructions">
                    Autofill columns using plain-english instructions.<br />Try "Find the best category for Column 2"
                  </p>
                  <textarea :value="prompt(col_index)" :data-col_index="`${col_index}`" @input="handlePromptFieldInput" class="prompt" ></textarea>
                  <!-- Temp Reload buttong -->
                  <!-- <a :href="`#`" class="button-small" @click.prevent="() => {fetchDataLive(false)}">Refresh</a> -->
                  <ActionButton value="Refresh" class="button-small v-space left" :action="() => {fetchDataLive(false)}" />
                  <ActionButton value="Fill In" class="button-small v-space" :action="saveAutofillAndGetSuggestions" />
                </div>

                <!-- Format -->
                <div v-if="optionMode=='format'">
                  <p  class="instructions">
                    Formatters not yet available via UI.
                  </p>
                </div>
              </Popover>
            </span>
          </div>
        </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, row_index) of formattedRows">
          <td class="row-number" @click="handleRowNumberClick" :data-cell="`${row_index}`">{{row_index + 1}}</td>

          <td v-for="(column, col_index) of row"  
            @mousedown="handleMousedownOnCell"
            @mouseover="handleSelecting"
            :data-cell="`${row_index}-${col_index}`"
            :ref="`${row_index}-${col_index}`"
            :class="{
              selected: selected(`${row_index}-${col_index}`),
              invisible: loading,
              money: columnIsMoney(col_index),
              percent: columnIsPercent(col_index),
              }">
              <div v-if="autofillEnabled">
                <!-- TODO Support formatters before removing feature flag-->
                <!-- To support the formatters, we'll need to go into an active-field edit mode to edit the raw value rather than formatted -->
                <input type="text" :value="column" class="field" @input="handleFieldInput"/>
              </div>
              <div v-else>
                <div v-if="columnIsLink(col_index)" v-html="column"></div>
                <div v-else>{{column}}</div>
              </div>

           </td>
        </tr>
      </tbody>
    </table>
      <!-- Save status indicator -->
    <span v-if="onTableSaveAppId">
      <span v-if="saving">
        <span class="save-status orange">››</span>
      </span>
      <span v-else>
        <span v-if="saveFailed" class="save-status red">››</span>
        <span v-else class="save-status green">››</span>
      </span>
    </span>


    <!-- Hidden table for export -->
    <table :id="`raw-tableView-${app_id}`" class="hidden">
      <thead>
        <tr>
          <th v-for="name of columnNames">{{name}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row of rows">
          <td v-for="column of row">{{column}}</td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script>
  import App from '../../models/App'
  import FeatureManager from 'trivial-core/lib/FeatureManager'
  import PanelBase from './PanelBase.vue'
  import { fetchJSON } from 'trivial-core/lib/component-utils'
  import SelectionBounds from '../../lib/SelectionBounds'
  import Format from '../../lib/Format'
  import Popover from '../controls/Popover.vue'
  import * as XLSX from 'xlsx/xlsx.mjs';
  import { nextTick } from 'vue'

  export default {

    mixins: [PanelBase],

    components: {
      Popover
    },

    props: {
      displayName: {
        type: Boolean,
        required: false,
        default: true
      },
      previewColumnNames: {
        type: Array,
        required: false,
        default() {
          return []
        }
      },
     previewRows: {
        type: Array,
        required: false,
        default() {
          return []
        }
      },

      inheritedLoadingState: {
        type: Boolean,
        required: false,
        default: false
      },

      isActive: {
        type:  Boolean,
        required: false,
        default: false
      }

    },

    data() {
      return {
        columnNames: this.initialContent().columnNames,
        rows: this.initialContent().rows,
        selectedCells: [],
        loading: false,
        openPopover: null,
        optionMode: null,
        saving: false,
        saveFailed: false,
        saveTimer: null,
        refreshKey: 0
      }
    },

    mounted() {
      if (!this.isInPropDataMode()) {
        this.loading = true
      }
    },

    watch: {
      rows: function() {
        this.autoSave()
      },

      inheritedLoadingState(val) {
        this.loading = val
      },

      previewColumnNames(val) {
        this.columnNames = val
        this.refreshKey++
        this.loading = false
      },

      previewRows(val) {
        this.rows = val
        this.refreshKey++
        this.loading = false
      },

      valuesForCopy(val) {
        this.$emit('set-selected-panel-values', val)
      },

      isActive(val) {
        if (val) {
          this.$emit('set-selected-panel-values', this.valuesForCopy)
        }
      }

    },

    computed: {

      autofillEnabled: () => {
          return FeatureManager.isEnabled("autofill")
      },

      tableName() {
        try {
          return this.app.descriptive_name
        } catch(e) { return ''}
      },

      selectedValues() {
      this.refreshKey
        return this.selectedCells.map(c => {
          let [row, col] = c.split('-')
          return this.rows[row][Number(col)]
        })
      },

      valuesForCopy() {
        let out = []
        for (let row of this.selectedRows) {
          out.push(this.selectedColumns.map((c) => {
            return this.rows[row][Number(c)] || ''
          })
          )
        }
        // Join rows with a carriage return & cells with a tab to allow pasting into Excel and GoogleSheets
        return out.map(el => el.join('\t')).join('\r')
      },

      selectedSum() {
        this.refreshKey
        try {
          let sum = this.selectedValues.filter(v => v).reduce((a,b) => Number(a) + Number(b), 0)
          return isNaN(sum) ? '-' : sum
        } catch (e) {
          console.log(`selectedSum: ${e}`)
          return '-'
        }
      },

      formattedSum() {
        if (this.columnIsLink(this.selectedColumn)) { return '-' }
        try {
          let formatter = this.columnFormats[this.selectedColumn]
          return this.formatFromPanelArgs(this.selectedSum, formatter)
        } catch (e) {
          return this.selectedSum
        }
      },

      selectedAvg() {
        this.refreshKey
        try {
          return this.selectedSum / this.selectedValues.length
        } catch (e) {
          return '-'
        }
      },

      formattedAvg() {
        if (this.columnIsLink(this.selectedColumn)) { return '-' }
        if (isNaN(this.selectedAvg)) { return '-' }
        try {
          let formatter = this.columnFormats[this.selectedColumn]
          return this.formatFromPanelArgs(this.selectedAvg, formatter)
        } catch (e) {
          return isNaN(this.selectedAvg) ? '-' : this.selectedAvg.toFixed(2)
        }
      },

      selectedCnt() {
        this.refreshKey
        try {
          let cnt = this.selectedValues.length
          return isNaN(cnt) ? '-' : cnt.toFixed(0)
        } catch (e) {
          return '-'
        }
      },

      selectedColumn() {
        return this.selectedColumns.length > 1 ? null : this.selectedColumns[0]
      },

      selectedColumns() {
        let selectedColumns = this.selectedCells.map(c => {
          let [row, col] = c.split('-')
          return col
        })
        return new Array(... new Set(selectedColumns))
      },

      selectRow() {
        return this.selectedRows.length > 1 ? null : this.selectedRows[0]
      },

      selectedRows() {
        let selectedRow = this.selectedCells.map(c => {
          let [row, col] = c.split('-')
          return row
        })
        return new Array(... new Set(selectedRow))
      },

      columnFormats() {
        try {
          return this.app.panels.options.columnFormats || {}
        } catch(e) {
          return {}
        }
      },

      formattedRows() {
        if (Object.keys(this.columnFormats).length == 0) { return this.rows }
        let out = []
        for (let row of this.rows) {
        // columnFormats: {7:  {type: "money"}, 8: {type: "percent", args: {places: 1, multiplier: 1}}}
          out.push(row.map((val, i) => {
            let formatter = this.columnFormats[i]
            return this.formatFromPanelArgs(val, formatter)
            })
          )
        }
        return out
      },

      onTableSaveAppId() {
        if (!this.app) { return }
        let out
        try {
          out = this.app.panels.options.onTableSaveAppId
      } catch(e) {
          console.log(`error reading onTableSaveAppId: ${e}`)
       }
       return out
      },

      tableSaveAppUrl() {
        let path = 'webhooks/receive'
        return new URL(path, `https://${this.onTableSaveAppId}.${this.app.domain}`).href
      },

    },

    mounted() {

      if (!this.onTableSaveAppId) {
        console.log(`Set options.onTableSaveAppId to enable autosave`)
      }


    },

    methods: {

      debug(previewColumnNames) {
        debugger
      },

      isInPropDataMode() {
        return this.previewColumnNames.length > 0
      },

      autoSave() {
        if (!this.onTableSaveAppId) { return }

        // kill the existing timer to debounce
        window.clearTimeout(this.saveTimer)

        // create a new timer
        this.saveTimer = window.setTimeout(this.tableSave, 1000)
      },

      tableSave() {
        if (!this.onTableSaveAppId) {
          this.saveFailed = true
          return
        }
        this.saving = true
        let body = {columnNames: this.columnNames, rows: this.rows}
          fetchJSON(`/apps/call?url=${this.tableSaveAppUrl}`, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {'content-type': 'application/json'}
          })
          .then(response => this.handleTableSaveResponse(response))
          .catch(error => {
            this.saveFailed = true
            this.saving = false
            this.errors = error
            console.error('[tableSave] Error:', error)
          })

      },

      handleTableSaveResponse(response) {
        this.saveFailed = response.statusCode != 200
        this.saving = false
      },

      prompt(col_index) {
        let out
        try {
          let autofillOptions = this.app.panels.options.autofillColumns[col_index] || {}
          out = autofillOptions.prompt || ''
      } catch(e) {
          out = ''
          console.log(`error reading prompt method: ${e}`)
       }
       return out
      },


      handlePopoverToggle(id) {
        this.optionMode = null
        this.openPopover = this.openPopover == id ?  null :  id
      },

      handleFieldInput(val) {
        this.rows[this.selectedRow][this.selectedColumn] = val.currentTarget.value;
      },

      handlePromptFieldInput(event) {
        let col_index = event.currentTarget.dataset.col_index
        if (!this.app.panels.options.autofillColumns[col_index]) {
          this.app.panels.options.autofillColumns[col_index] = {}
        }
        this.app.panels.options.autofillColumns[col_index].prompt = event.target.value
      },

      interpretedColumnToken(str) {
        // Match on Column X and Col X variations
          return str.match(/((c|C)olumn|(c|C)ol)\s*\d*/)[0]
      },

      interpretedPrompt(row, column) {
        let ref = this.interpretedColumnToken(this.prompt(column))
        let sourceColumn = ref.match(/\d+/)
        let val = this.rows[row][sourceColumn - 1]
        // Drop the actual value of the source column into the prompt
        let out = this.prompt(column).replace(ref, `"${val}"`)
        out += `\n\nCategory:`
        return out
      },

      saveAutofillAndGetSuggestions() {
        this.saveAutofill()
        this.getSuggestions()
      },

      saveAutofill() {
        // Save the prompt to the column
        let option = this.app.panels.options.autofillColumns[this.openPopover]
        Object.assign(option, {
          "model": "text-davinci-003"
        })
        let app = new App(this.$store, this.app_id)
        app.setPanelOption({autofillColumns: this.app.panels.options.autofillColumns})
      },

      getSuggestions() {
        // Get a suggestion for every row
        for (let row = 0; row < this.rows.length; row++) {
          setTimeout( () => {
            this.getSuggestion(row, this.openPopover)
          }, 500 * row)
        }
      },

      async getSuggestion(row, column) {
        // console.log(`Interpreted: ${this.interpretedPrompt(row, column)}`)
        let response = await fetchJSON('/suggestion', {
          method: 'post',
          headers: {'content-type': 'application/json'},
          body: JSON.stringify({
            model: "text-davinci-003",
            prompt: this.interpretedPrompt(row, column),
          })
        })
        .catch(e => this.handleSuggestionResponse(row, column, e))
        this.handleSuggestionResponse(row, column, response)
      },

      handleSuggestionResponse(row, column, response) {
        let suggested = ''
        if (response && response.statusCode == 200) {
          try {
            suggested = response.body.choices[0].text
          } catch(e) {
            console.warn(response)
          }
        } else {
          // TODO write to Notification
          console.warn(response)
        }
        this.rows[row][column] = suggested

      },

      // TODO Shared Lib
      formatFromPanelArgs(val='', formatter={}) {
        let formatType = formatter.type || "none"
        let argKeys = Object.keys(formatter.args || [])
        let args = argKeys.map(k => formatter.args[k])
        args = [val, args].flat()
        return Format[formatType](...args)
      },

      columnFormat(col) {
        try {
          let formatter = this.columnFormats[col] || {}
          return formatter.type || "general"
        } catch(e) { return "general" }
      },

      columnIsLink(col) {
        return this.columnFormat(col) == "link"
      },

      columnIsMoney(col) {
        return this.columnFormat(col) == "money"
      },

      columnIsPercent(col) {
        return this.columnFormat(col) == "percent"
      },

      columnIsText(col) {
        return this.columnFormat(col) == "text"
      },

      initialzeAndRefresh() {
        this.shouldSuggestCacheRefresh = false
        this.errors = ''
        this.columnNames = this.initialContent().columnNames
        this.rows = this.initialContent().rows
        this.selectedCells = []
        this.fetchDataLive()
      },

      initialContent() {
        if (this.previewColumnNames.length > 0) {
          return {
            columnNames: this.previewColumnNames,
            rows: this.previewRows
          }
        }

        let out = {rows: [], columnNames: []}
        let rowCount = 50
        out.columnNames = ['A','B','C','D','E','F', 'G', 'H', 'I']
        for (let i of [...new Array(rowCount).keys()]) {
          out.rows.push(new Array(out.columnNames.length))
        }
        return out
      },

      removeNonTableSelection() {
        window.getSelection().removeAllRanges()
      },

      handleHeaderClick(event) {
        this.removeNonTableSelection()
        let cell = event.currentTarget.dataset.cell
        let selected = this.keptSelection(event)
        for ( let i of [...this.rows.keys()]) {
          selected.push(`${i}-${cell}`)
        }
        this.selectedCells = selected
      },

      handleRowNumberClick(event) {
        this.removeNonTableSelection()
        let cell = event.currentTarget.dataset.cell
        let selected = this.keptSelection(event)
        let row = this.rows[cell]
        for ( let i of [...row.keys()]) {
          selected.push(`${cell}-${i}`)
        }
        this.selectedCells = selected

      },

      keptSelection(event) {
        if (!event) { return [] }
        return event.shiftKey ? this.selectedCells : []
      },

      handleMousedownOnCell(event) {
        this.removeNonTableSelection()
        this.mousedown = true
        this.selectionBounds = new SelectionBounds()
        this.handleSelecting(event)
      },

      handleMouseup() {
        this.mousedown = false
      },

      handleSelecting(event) {
        if (!this.mousedown) { return false }
        let cell = event.currentTarget.dataset.cell
        this.selectionBounds.update(cell)
        let selected = this.keptSelection(event)
        selected.push(this.selectionBounds.members)
        this.selectedCells = new Array(...new Set(selected.flat()))
      },

      selected(field) {
        return this.selectedCells.includes(field)
      },

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

      async sparkle() {
        await nextTick()
        for (let row_i of [...this.rows.keys()]) {
          let row = this.rows[row_i]
          for (let col_i of [...row.keys()]) {
            try {
              let ref = this.$refs[`${row_i}-${col_i}`][0]
              setTimeout(() => {
                ref.classList.remove('invisible')
              }, Math.random() * 500)
            } catch(e) {} 
          }
        }
      },

      setData(r) {
        this.refreshKey++ // Helper to force computed properties to see changes to arrays
        this.rows = r.rows
        this.columnNames = r.columnNames
        // this.sparkle()
        setTimeout(() => {this.loading = false}, 1000)
      }
    }
  }
</script>

<style lang="scss" scoped>

  .container {
    width: 100%;
    height: auto;
    margin: 0;

  .hidden {
    display: none;
  }

  .loading {
    min-height: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .icon {
    width: 1em;
    height: 1em;
  }

  .refresh-icon {
    height: 1em;
    width: 1em;
    background-image: url("/assets/images/sync-solid.svg");
    background-color: transparent;
    display: block;
    cursor: hand;
  }

  .save-status {
    font-size: 1em;
  }

  .orange {
    color: orange;
  }

  .red {
    color: red;
  }

  .green {
        color: green;
  }

  a.column-options-icon {
    color: var(--accent);
    font-size: 0.5em;
  }

  ul.column-options-selector {
    list-style-type: none;
    padding: 0;
    li {
      margin-top: 0.5em;
      margin-bottom: 0.5em;
    }
  }

  p.left {
    text-align: left;
  }

  .loading img {
      height: 12em;
      width: auto;
      content: var(--loading);
  }

    thead.sticky {
      position: sticky;
      top: 119;
    }

    .invisible, {
      background-color: var(--background);
      color: var(--background);

      th {
         background-color: var(--background);
         border-left-color: var(--background);
         border-right-color: var(--background);
         border-top-color: var(--background);
       }

    }

    .summary-bar-backer {
      position: sticky;
      top: 80;
      background-color: var(--background);
    }

    .summary-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: var(--accent-20);
      height: 40px;

      .table-name-container {
        margin-left: 1em;
        display: flex;
        align-items: baseline;

        h2 {
          padding-right: 1em;
          margin-bottom: 0.83em;
        }

      }

      .sum {
        padding-right: 1em;
      }

    }

    .messages {
      min-width: 18em;
      margin-left: 1em;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: auto;
      border: none;
      font-size: small;

      -webkit-user-select: none;
              user-select: none;

      thead {
        font-weight: 400;
        // text-transform: uppercase;
        border-bottom: 1px solid var(--table-head-border);

        th.invisible {
          background-color: var(--background);
        }

        th {
          background-color: var(--surface);
          border: 1px solid var(--background-80);
          cursor: pointer;
          padding: 0.2em 0.5em;
          font-size: 1.2em;
          font-weight: 400;

          span {
            font-weight: 100;
          }

          div.header {

            display: flex;
            justify-content: space-between;
            align-items: center;

            .title {
              text-align: left;
            }

            .action {
              text-align: right;
              font-size: 1.4em;
            }

          }

        }
      }

      tbody {

        tr {
          cursor: crosshair;

          td.row-number {
            background: var(--surface);
            font-weight: 400;
            cursor: pointer;
          }

          td {
            padding: 0.2em 0.5em;
            font-weight: 100;
            border: 1px solid var(--background-80);
            color: var(--on-background);

            a {
              color: inherit;
            }

            input.field {
              background-color: transparent !important;
              border: 0;
              padding: 0;
              font-size: 1em;
              caret-color: var(--series-1);
              width: 100%;
              font-weight: 100;
              color: var(--on-background);
              outline: 0;
            }

            &:focus {
              outline: 0;
            }

          }

          td.selected {
            background-color: var(--accent-20);

            input {
              background-color: var(--accent-20);
            }

          }

          td.money, td.percent {
            text-align: right;
          }

          // td.highlight {
          //   animation-name: fade;
          //   animation-duration: 2s;
          // }

          // @keyframes fade {

          //   from {
          //     color: var(--background);
          //     background-color: var(--accent);
          //   }

          //   to {
          //     color: var(--on-background);
          //     background-color: var(--background);
          //   }
          // }

        }
      }
  
    }

  }

</style>