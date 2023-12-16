<template>
  <div class="chart-well well">
    <div class="chart">
      <p class="title">Activity Summary, previous 7 days</p>
      <div ref="series-1" class="pallet series-1"></div>
      <div ref="series-2" class="pallet series-2"></div>
      <p v-if="errorMessage">{{errorMessage}}</p>
      <canvas ref="stackedChart" width="320" height="200"></canvas>
    </div>
  </div>
</template>

<style lang="scss" scoped>

  .chart-well {
    width: 320px;
    box-sizing: content-box;
  }

  .chart {
  	display: block;
    margin: 0 0 1em 0;

    p.title {
      text-align: center;
    }

    canvas {
      width: 320px;
      height: 200px;
    }
  }

  .pallet {
    display: none;  
  }
  .series-1 {
    color: var(--series-1);
  }
  .series-2 {
    color: var(--series-2);
  }


</style>

<script>
import Chart from 'chart.js/auto'

export default {
  inject: ['appId'],
  data() {
    return {
      errorMessage: null,
      labels: [],
      datasets: [
      {
        label: "Success",
        data: [],
        backgroundColor: "#a3adfe"
      },
      {
        label: "Error",
        data: [],
        backgroundColor: "#ff7a7a"
      }
      ],
      chart: null
    }
  },

  mounted() {
    this.setColors()
    this.fetchData()
  },

  unmounted() {
    if (this.chart)
      this.chart.destroy()
  },

  methods: {
    async fetchData() {
      try {
        let response = await fetch(`/proxy/trivial?path=/activity_entries/stats&app_id=${this.appId}`)
        this.formatData((await response.json() || []).reverse())
        this.updateChart()
      } catch (error) {
        console.log('[WebhooksChart][fetchData] Error', error)
        this.errorMessage = 'No data'
        let days = 7
        this.chartFrame(days)
      }
    },

  /* Write CSS vars into the dom at load to make them accessible to chartJS here*/
    getColor(i) {
      let el = this.$refs[`series-${i}`]
      return el ? window.getComputedStyle(el).getPropertyValue("color") : "#333"
    },

    setColors() {
      let i = 1
      for (let dataset of this.datasets) {
        dataset.backgroundColor = this.getColor(i)
        i++
      }
    },

    formatData(stats) {
      for (let stat of stats){
        this.labels.push(stat.date.substring(0,5))
        if(Object.keys(stat.count).length == 0)
          this.chartNullValue()
        else
          this.pushFromRecords(stat.count)
      }
    },

    pushFromRecords(count) {
      let success = 0
      let error = 0
      for(let c in count){
        let status = parseInt(c)
        switch(true){
          // case status > 99 && status < 200:
          //   console.log('Informational Response')
          //   break
          case status > 199 && status < 300:
            success += count[c]
            console.log('Successful Response')
            break
          // case status > 299 && status < 400:
          //   console.log('Redirect Response')
          //   break
          case status > 399 && status < 500:
            error += count[c]
            console.log('Client Error Response')
            break
          case status > 499 && status < 600:
            error += count[c]
            console.log('Server Error Response')
            break
        }
      }
      this.datasets[0].data.push(success)
      this.datasets[1].data.push(error)
    },

    updateChart() {
      if (this.chart)
        this.chart.update()
       else
        this.chartConfig()
    },

    chartFrame(){
      let currentDate = new Date()
      for(let i =1; i < 8;i++){
        let d = new Date(currentDate)
        this.labels.push(d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }))
        let temp = new Date()
        currentDate = temp.setDate(temp.getDate() - i)
      }
      this.labels.reverse()
      for(let i =0; i < 7;i++){ this.chartNullValue() }
      this.chartConfig()
    },

    chartConfig(){
      this.chart = new Chart(this.$refs.stackedChart, {
        type: 'bar',
        data: {labels: this.labels, datasets: this.datasets},
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Chart.js Bar Chart - Stacked'
            },
          },
          responsive: false,
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
    },

    chartNullValue(){
      this.datasets[0].data.push(0)
      this.datasets[1].data.push(0)
    }
  }
}
</script>
