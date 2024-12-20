<template>
  <Panel class="w-full shadow-2">


    <Steps :model="steps" v-model:activeStep="active" />


    <!-- Step 1 -->
    <div v-if="active==0">
      <p>Step 1, select charge  groups and dates</p>
      <ChartControls
        v-model="chartSettings"
      />

      <div class="action-bar">
        <Button @click="handleProceed">Next</Button>
      </div>
    </div>


    <!-- Step 2 -->
    <div v-if="active==1">
      <h4 class="headroom">Step 2</h4>
      <p>Review charges and filter to specific customers</p>

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
          :non-editable-search="[{c: 'invoice_id', o: '', p: 'IS NULL'}]"
        />
      </div>

      <div class="action-bar space-between">
        <Button severity="secondary" @click="active--">Back</Button>
        <Button @click="handleProceed">Next</Button>
      </div>
    </div>


    <!-- Step 3 -->
    <div v-if="active==2">
      <p>Commit charges to invoices</p>

      <Dropdown v-model="invoiceStrategy"
      :options="invoiceStrategyOptions"
      optionLabel="label"
      optionValue="value"
      placeholder="Select invoice options"
      />


      <template v-if="invoiceStrategy == 'per_customer_id'">
        <div v-if="!hasCustomerIdGroup">
          <p><InlineMessage severity="error">Missing Customer ID groups</InlineMessage></p>
          <p>You must select a Customer ID group to create an invoice per customer</p>
        </div>

        <div v-if="!hasValidCustomerIdValues">
          <p><InlineMessage severity="error">Missing Customer ID values</InlineMessage></p>
          <p>All rows must contain a customer ID to create an invoice per customer</p>
        </div>

        <div v-if="hasCustomerIdGroup && hasValidCustomerIdValues">
          <p>The Customer ID column will be used to create an invoice for each customer. This will create
            <strong>{{ uniqueCustomerIds.length }} invoice(s).</strong></p>
        </div>
      </template>

      <Dropdown v-if="invoiceStrategy=='single' " v-model="customer"
      :options="customerOptions"
      optionLabel="label"
      optionValue="value"
      placeholder="Select customer"
      />
      <div class="action-bar space-between">
        <Button severity="secondary" @click="active--">Back</Button>
        <Button @click="handleProceed">Create Invoices</Button>
      </div>
    </div>


    <div v-if="active==3">

      <div v-if="creatingInvoices">
        <h3>Creating invoices...</h3>
      </div>

      <div v-else class="headroom">
        <h3>Done</h3>

        <p>{{ invoiceIds.length }} invoices created</p>
        <li v-for="invoiceId in invoiceIds" :key="invoiceId">
          <a :href="`/invoices/${invoiceId}`">Invoice {{ invoiceId }}</a>
        </li>
      </div>

      <div class="action-bar">
        <RouterLink to="/invoices">
          <Button class="mx-3">Done</Button>
        </RouterLink >
      </div>

    </div>

  </Panel>

</template>

<script setup>
  import { ref, onMounted, computed, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { useStore } from 'vuex'
  import InlineMessage from 'primevue/inlinemessage';
  import Steps from 'primevue/steps';
  import ChartControls from '@/components/dashboard/ChartControls.vue'
  import table from '@/components/dashboard/table.vue'
  import { useDateRange } from '@/composable/useDateRange'
  import { searchFromFilter } from '@/composable/searchFromFilter'
  import { useToastNotifications } from '@/composable/toastNotification'

  const steps = ref([
      {
          label: 'Select items'
      },
      {
          label: 'Review charges'
      },
      {
          label: 'Create invoices'
      }
  ]);

  const active = ref(0);

  const customer = ref()
  const invoiceStrategy = ref('per_customer_id')

  const hasCustomerIdGroup = computed(() => {
    return chartSettings.value.groupBy.includes('customer_id')
  })

  const hasValidCustomerIdValues = computed(() => {
    // Ensure all rows have a non-empty customer_id
    const customerIds = tableData.value.map(row => row.customer_id).filter(id => id !== null && id !== '')
    return customerIds.length === tableData.value.length
  })

  const uniqueCustomerIds = computed(() => {
    return [...new Set(tableData.value.map(row => row.customer_id))]
  })

  const invoiceStrategyOptions = ref([
    // TODO, when we bring in the real customer options, briing this back
    // { label: 'One invoice for all customers', value: 'single' },
    { label: 'Separate invoice per customer' , value: 'per_customer_id'},
  ])

  // TODO To support 'single' strategy, fetch organizations with customer tags from API
  // const customerOptions = ref([
  //   { label: 'All customers', value: 'all' },
  //   { label: 'Acme Co', value: 'acme' },
  //   { label: 'Beta Co', value: 'beta' },
  //  ])

  const handleProceed = () => {
    switch (active.value) {
      case 0:
        active.value++
        break;
      case 1:
        active.value++
        break;
      case 2:
        active.value++
        handleCreateInvoices()
        break;
    }
  }

  const handleReset = () => {
    // reload the page to get a clean slate
    location.reload()
  }

  const store = useStore()
  const orgId = computed(() => store.getters.getOrgId)
  const regId = computed(() => store.getters.getRegisterId)
  const { showSuccessToast, showErrorToast, showInfoToast } = useToastNotifications()
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
  const tableData = ref([])

  const { getDateRange } = useDateRange()
  const creatingInvoices = ref(false)
  const invoiceIds = ref([])

  onMounted(async () => {
    init()
  })

  watch([dashboards, orgId, regId], async (newVal, oldVal) => {
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

  const handleCreateInvoices = () => {
    creatingInvoices.value = true
    store.state.Session.apiCall('/invoices/create_from_register', 'POST', createInvoicesPayload.value)
      .then((response) => {
        invoiceIds.value = response.invoice_ids
      })
      .then(() => showSuccessToast('Success', 'Invoices created successfully.'))
      .catch((e) => showErrorToast('Error', `${e}`))
      .finally(() => creatingInvoices.value = false)
  }

  const createInvoicesPayload = computed(() => {
    return {
      register_id: regId.value,
      timezone: chartSettings.value.timezone,
      start_at: dateRange.value.startAt,
      end_at: dateRange.value.endAt,
      group_by: chartSettings.value.groupBy,
      group_by_period: chartSettings.value.groupByPeriod,
      invert_sign: chartSettings.value.invertSign,
      search: searchFromFilter(chartSettings.filters),
      strategy: invoiceStrategy.value,
      payor_customer_id: customer.value,
    }
  })


  const handleFilterChange = (newVal, filteredResults) => {
    chartSettings.filters = newVal
    tableData.value = filteredResults
  }

  const dateRange = computed(() =>
    getDateRange(
      chartSettings.value.namedDateRange,
      chartSettings.value.timezone
    )
  )


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