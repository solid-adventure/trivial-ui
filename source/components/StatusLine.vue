<template>
  <div>
    <svg class="chart" viewBox="0 0 500 10">
      <path class="inactive" d="M 0,5 500,5" />
      <path class="success" :d="successPath" />
      <path class="error" :d="errorPath" />
    </svg>
  </div>
</template>

<style lang="scss" scoped>
  .chart {
    width: 100%;
    height: auto;

    .inactive {
      stroke: var(--chart-inactive);
      stroke-width: 2;
    }

    .success {
      stroke: var(--chart-success);
      stroke-width: 2;
    }

    .error {
      stroke: var(--chart-error);
      stroke-width: 2;
    }
  }
</style>

<script>
  import { scaleLinear } from 'd3'

  export default {
    props: {
      startRange: {
        type: String,
        required: true
      },
      endRange: {
        type: String,
        required: true
      },
      stats: {
        type: Array,
        required: true
      },
      interval: {
        validator: (value) => ['minute', 'hour', 'day'].indexOf(value) !== -1
      }
    },

    computed: {
      startValue() {
        return this.startRange ? new Date(this.startRange).valueOf() : Date.now()
      },

      endValue() {
        return this.endRange ? new Date(this.endRange).valueOf() : Date.now()
      },

      scale() {
        return scaleLinear().range([0, 500]).domain([this.startValue, this.endValue])
      },

      intervalValue() {
        if ('minute' === this.interval) {
          return 60 * 1000;
        } else if ('hour' === this.interval) {
          return 60 * 60 * 1000;
        } else if ('day' === this.interval) {
          return 24 * 60 * 60 * 1000;
        } else {
          return 1000;
        }
      },

      parsedStats() {
        return this.stats.map(s => {
          return {
            period: new Date(s.period),
            successes: s.successes,
            failures: s.failures
          }
        })
      },

      errorStats() {
        return this.parsedStats.filter(s => s.failures > 0)
      },

      errorSegments() {
        return this.segments(this.errorStats)
      },

      errorPath() {
        return this.errorSegments.map(segment => {
          return `M ${this.scale(segment.start)},5 ${this.scale(segment.end)},5`
        }).join(' ')
      },

      successStats() {
        return this.parsedStats.filter(s => s.failures === 0 && s.successes > 0)
      },

      successSegments() {
        return this.segments(this.successStats)
      },

      successPath() {
        return this.successSegments.map(segment => {
          return `M ${this.scale(segment.start)},5 ${this.scale(segment.end)},5`
        }).join(' ')
      }
    },

    methods: {
      segments(stats) {
        const segments = []
        for (let i = 0; i < stats.length; ++i) {
          let stat = stats[i]
          let start = stat.period.valueOf() - this.intervalValue
          let end = stat.period.valueOf()
          while (i + 1 < stats.length &&
            stats[i + 1].period.valueOf() <= end + this.intervalValue) {
              end = stats[++i].period.valueOf()
          }
          segments.push({start, end})
        }
        return segments
      }
    }
  }
</script>
