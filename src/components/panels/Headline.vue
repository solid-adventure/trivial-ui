<template>
  <div class="panel" :class="{standalone: standAlone}">
    <div class="panel-inner">
      <PanelPopover :app_id="app_id" :parent_app_id="parent_app_id" :can_update = "can_update" />
      <h2 v-if="cascadingTitle">{{cascadingTitle}}</h2>
      <p v-if="cascadingDescription">{{cascadingDescription}}</p>
      <h1>
        {{formattedCount}}
      </h1>
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
      formattedCount() {
        try {
          let options = this.app.panels.options.countFormat || {}
          // countFormat: {type: "money", args: {places: 0}}
          let args = [this.count, Object.values(options.args)].flat()
          return Format[options.type](...args)
        } catch(e) {
          return this.count
        }
      }
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