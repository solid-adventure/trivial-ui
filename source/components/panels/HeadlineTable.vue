<template>
  <div class="panel" :class="{standalone: standAlone}">
    <div class="panel-inner">
      <PanelPopover :app_id="app_id" :parent_app_id="parent_app_id" />
      <h2 v-if="cascadingTitle">{{cascadingTitle}}</h2>
      <p v-if="cascadingDescription">{{cascadingDescription}}</p>

      <table v-if="Object.entries(formattedCounts).length > 0">
        <tr v-for="(value, key) in formattedCounts">
          <td>{{ key }}</td>
          <td>{{ value }}</td>
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

</style>