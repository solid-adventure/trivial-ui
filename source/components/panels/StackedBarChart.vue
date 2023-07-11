<template>
  <div class="panel" >
    <div :class="size">
      <PanelPopover :app_id="app_id" :parent_app_id="parent_app_id" />
      <h2 v-if="cascadingTitle">{{cascadingTitle}}</h2>
      <p v-if="cascadingDescription">{{cascadingDescription}}</p>
      <div ref="series-1" class="pallet series-1"></div>
      <div ref="series-2" class="pallet series-2"></div>
      <div ref="series-3" class="pallet series-3"></div>
      <div ref="series-4" class="pallet series-4"></div>
      <div ref="series-5" class="pallet series-5"></div>
      <canvas :ref="app_id" width="320" height="200"></canvas>
      <div v-if="errors.length > 0">
        <p>{{errors}}</p>
      </div>
    </div>
  </div>
</template>

<script>
  import PanelBase from './PanelBase.vue'
  import Chart from 'chart.js/auto'

  export default {

    mixins: [PanelBase],
    data() {
      return {
        charts: []
      }
    },

    methods: {

      handleResponse(response) {
        if (response.statusCode >= 400) {
          this.errors = response.body
        } else {
          try {
            let r = response.body
            this.datasets = r.datasets
            this.labels = r.labels
            this.title = r.title
            this.chartConfig()
          } catch (error) {
            this.errors = error
          }          
        }
      },

      chartConfig(){
        console.log(`chartConfig firing`)
        this.setColors()
        for (let chart of this.charts) { chart.destroy() }
        let chart = new Chart(this.$refs[this.app_id], {
          type: 'bar',
          data: {labels: this.labels, datasets: this.datasets},
          options: {
            responsive: true,
            scales: {
              xAxes: [{
                stacked: true
              }],
              yAxes: [{
                stacked: true
              }]
            }
          }
        })
        this.charts.push(chart)
      },
    }
  }
</script>

<style lang="scss" scoped>

</style>