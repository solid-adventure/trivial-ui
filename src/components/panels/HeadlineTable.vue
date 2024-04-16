<template>
  <div class="panel" :class="{standalone: standAlone}">
    <div class="panel-inner">
      <PanelPopover :app_id="app_id" :parent_app_id="parent_app_id" :can_update = "can_update"/>
      <h2 v-if="cascadingTitle">{{cascadingTitle}}</h2>
      <p v-if="cascadingDescription">{{cascadingDescription}}</p>

      <table v-if="Object.entries(formattedCounts).length > 0">
        <tr v-for="(value, key) in formattedCounts">
          <td>{{ key }}</td>
          <td class="value">{{ value }}</td>
        </tr>
        <tr v-if="displayTotal">
          <td class="total total_label">Total</td>
          <td class="total value">{{ formattedTotal }}</td>
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

      displayTotal() {
        try {
          return this.app.panels.options.display_total || false
        } catch (error) {
          return false
        }
      },

      total() {
        if (!this.count) { return 0 }
        try {
          return Object.values(this.count).reduce((acc, curr) => acc + Number(curr), 0);
        } catch (error) {
          return 0
        }
      },

      formattedTotal() {
        if (typeof(this.count) !== 'object') { return {} }
        try {
          let options = this.app.panels.options.countFormat || {}
          let args = [this.total, Object.values(options.args)].flat()
          return `${Format[options.type](...args)}`
        }
        catch (e) {
          return this.total
        }
      },

      formattedCounts() {
        if (typeof(this.count) !== 'object') { return {} }
        let out = {}
        try {
          let options = this.app.panels.options.countFormat || {}
          for (const [k, v] of Object.entries(this.count)) {
            let args = [v, Object.values(options.args)].flat()
            out[k] = `${Format[options.type](...args)}`
          }
          return out
        }
        catch (e) {
          return this.count
        }
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
  }

  td.value {
    text-align: right;
    white-space: nowrap;
  }

  td.total {
    border-top: 1px solid var(--input-border-color);
  }

  td.total_label {
    padding-right: 1em;
    text-align: right;
  }


</style>