<template>
  <div class="panel" :class="{standalone: standAlone}">
    <div class="panel-inner">
      <PanelPopover :app_id="app_id" :parent_app_id="parent_app_id" />
      <h2 v-if="cascadingTitle">{{cascadingTitle}}</h2>
      <p v-if="cascadingDescription">{{cascadingDescription}}</p>

      <table v-if="hasResults" class="headroom">

        <thead>
          <tr>
            <th></th> <!-- group -->
            <th v-for="period of group_by_period_keys"><span class="total">{{ period }}</span></th>
            <th><span class="total">Total</span></th>
          </tr>
        </thead>

        <tr v-for="group of group_keys">
          <td>{{ group }}</td>
          <td v-for="period of group_by_period_keys" class="value">{{ formattedValue(valueForCell(period, group)) }}</td>
          <td class="value">{{ formattedValue(totalForGroup(group)) }}</td>
        </tr>
        <tr v-if="displayTotal">
          <td class="total total_label">Total</td>
          <td v-for="period of group_by_period_keys" class="total value"> {{ formattedValue(totalForPeriod(period)) }}</td>
          <td class="total value">{{ formattedValue(totalForAll()) }}</td>
        </tr>


      </table>
      <table v-else>
        <tr>
          <td>No results</td>
        </tr>
      </table>
      <p>{{errors}}</p>
    </div>
  </div>
</template>

<script>
  import PanelBase from './PanelBase.vue'
  import Format from '../../lib/Format'

  export default {

    mixins: [PanelBase],

    computed: {

      group_by_period_keys() {
        const uniq = new Set(this.count.filter((row) => row.period !== "All").map((row) => row.period));
        return [...uniq];
      },

      group_keys() {
        const uniq = new Set(this.count.map((row) => row.group));
        return [...uniq];
      },

      displayTotal() {
        try {
          return this.app.panels.options.display_total || false
        } catch (error) {
          return false
        }
      },

      hasResults() {
        if (typeof(this.count) !== 'object') { return }
        return this.count && this.count.length > 0
      },

    },

    methods: {

      handleResponse(response) {
        if (response.statusCode >= 400) {
          this.errors = response.body
        } else {
          try {
            let r = response.body
            this.count = r.count
            this.title = r.title
          } catch (error) {
            this.errors = error
          }
        }
      },

      rowByPeriodAndGroup(period, group) {
        return this.count.find( row => row.group === group && row.period === period )
      },

      totalForPeriod(period) {
        return this.count.filter( row => row.period === period ).reduce((acc, row) => acc + Number(row.value), 0)
      },

      totalForGroup(group) {
        return this.count.filter( row => row.group === group ).reduce((acc, row) => acc + Number(row.value), 0)
      },

      totalForAll() {
        return this.count.reduce((acc, row) => acc + Number(row.value), 0)
      },

      valueForCell(period, group) {
        let row = this.rowByPeriodAndGroup(period, group)
        return row ? row.value : '-'
      },

      formattedValue(value) {
        let options = this.app.panels.options.countFormat || {}
        let args = [value, Object.values(options.args)].flat()
        return `${Format[options.type](...args)}`
      }

    }
  }
</script>

<style lang="scss" scoped>

  h1 {
    margin-top: 0;
  }

  .panel-inner {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: unset;
    overflow-x: auto;
  }

  th {
    text-align: right;
    white-space: nowrap;
    padding-left: 0.5em;
    padding-right: 0.5em;
  }

  td {
    white-space: nowrap;
    padding-left: 0.5em;
    padding-right: 0.5em;
  }

  td.value {
    text-align: right;
  }

  td.total {
    border-top: 1px solid var(--input-border-color);
  }

  td.total_label {
    font-weight: bold;
  }


</style>