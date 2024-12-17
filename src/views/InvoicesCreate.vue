<template>
  <Panel class="w-full shadow-2">


    <Steps :model="steps" v-model:activeStep="active" />


    <!-- Step 1 -->
    <div v-if="active==0">
      <p>Step 1, select dates and charge  groups</p>
      <ChartControls
        v-model="chartSettings"
      />

      <div class="action-bar">
        <Button @click="handleProceed()">Next</Button>
      </div>
    </div>


    <!-- Step 2 -->
    <div v-if="active==1">
      <h4 class="headroom">Step 2</h4>
      <p>Review charges and scope to specific customers</p>

      <ChartControls
        v-model="chartSettings"
        class="headroom"
      />

      <div class="headroom">
        <component
          :is="table"
          :chart="chart"
          :chart-settings="chartSettings"
          @filter-change="handleFilterChange"
        />
      </div>

      <div class="action-bar space-between">
        <Button @click="active--">Back</Button>
        <Button @click="handleProceed()">Create Invoices</Button>
      </div>
    </div>


    <!-- Step 3 -->
    <div v-if="active==2">
      <p>Step 3,create invoices and download</p>

      <div class="action-bar space-between">
        <Button @click="handleProceed()" class="secondary">Done</Button>
        <Button @click="handleReset">+ Create more invoices</Button>
      </div>
    </div>

  </Panel>

</template>

<script setup>
  import { ref, onMounted, computed, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { useStore } from 'vuex'
  import Steps from 'primevue/steps';
  import ChartControls from '@/components/dashboard/ChartControls.vue'
  import table from '@/components/dashboard/table.vue'

  const steps = ref([
      {
          label: 'Select items'
      },
      {
          label: 'Review charges'
      },
      {
          label: 'Download invoices'
      }
  ]);

  const active = ref(0);

  const handleProceed = () => {

    if (active.value <= steps.value.length) {
      active.value++
    }

    switch (active.value) {
      case 1:
        console.log("TODO Review charges")
        break;
      case 2:
        console.log("TODO Create Invoices")
        break;
      default:
        alert('Nice job!')
        setTimeout(() => {
          active.value = 0 // TEMP Redirect home
        }, 2000)
        break;
    }
  }

  const store = useStore()
  const orgId = computed(() => store.getters.getOrgId)
  const regId = computed(() => store.getters.getRegisterId)
  const dashboards = computed(() => store.getters.getDashboards)
  const dashboard = ref(null)
  const loading = ref(false)
  const chart = ref({})
  const chartSettings = ref({
    namedDateRange: '',
    groupByPeriod: '',
    timezone: '',
    timezoneOptions: [],
    invertSign: false,
    groupBy: [],
    groupByOptions: []
  })


  onMounted(async () => {
    store.dispatch('register')
    init()
  })

  watch([dashboards, orgId], async (newVal, oldVal) => {
    init()
  })

  const init = () => {
    loading.value = true
    // Set the dashboard for the org
    let dashboard = dashboards.value.filter((dashboard) => {
      return dashboard.owner_type == 'Organization' &&
      dashboard.owner_id == orgId.value
    })[0]
    if (!dashboard) return
    // Grab the first table and set it as the chart, then set the chart settings
    chart.value = dashboard.charts.find(chart => chart.chart_type == 'table')
    setChartSettings(chart.value)
    loading.value = false
  }

  const setChartSettings = (chart) => {
    chartSettings.value = {
      namedDateRange: chart.default_time_range,
      groupByPeriod: chart.report_period,
      timezone: chart.default_timezones[0],
      timezoneOptions: chart.default_timezones.map(timezone => ({
        label: timezone,
        value: timezone
      })),
      invertSign: chart.invert_sign,
      groupBy: Object.keys(chart.report_groups || {})
        .filter(key => chart.report_groups[key] === true),
      groupByOptions: Object.keys(chart.report_groups || {}).map(key => ({
        value: key,
        label: key.replaceAll('_', ' ')
      }))
    }
  }

  const handleFilterChange = (filters) => {
    console.log('Filters', filters)
  }


</script>

<style scoped>
  div.action-bar {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin-top: 1rem;
    align-items: center;
  }

  div.action-bar.space-between {
    justify-content: space-between;
  }

  div.headroom {
    margin-top: 1rem;

  }


</style>