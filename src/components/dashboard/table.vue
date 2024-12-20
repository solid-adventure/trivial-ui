<template>
	<Panel class="w-full shadow-2">
	  <DataTable :value="tableData"
	  	:scrollable="true"
	  	scroll-height="500px"
	  	size="small"
 			v-model:filters="filters"
      @filter="onFilterChange"
			filterDisplay="menu"
	  	>
	      <template #header>
	        <div class="flex justify-content-between align-items-center">
	          <h2 class="font-semibold">{{ chart.name }}</h2>
	        </div>
	      </template>

	      <template #empty>
	        <div class="flex justify-content-center align-items-center">
	          <h2 class="font-semibold">No data</h2>
	        </div>
	      </template>

	      <template #loading>
	        <Image :src="loadingImg" alt="Loader" width="160" />
	        <h3>Loading ...</h3>
	      </template>

				<Column v-for="(title, index) in groupByColumns"
	        :key="title"
	        :field="title"
	        :header="title.replaceAll('_', ' ')"
	        :filterField="title"
	        :showFilterMatchModes="false"
	        sortable
	        frozen
	        alignFrozen="left">
	        <template #filter="{ filterModel }">
	            <InputText v-model="filterModel.value" type="text" class="p-column-filter" :placeholder="`Search by ${title}`" />
	        </template>
				</Column>

        <!-- Period group columns -->
		    <Column v-for="period in periods"
		            :key="period"
		            :field="period"
		            :header="period"
		            headerClass="header-right"
		            class="text-right"
		            sortable>
		      <template #body="{ data, field }">
		        {{ useFormatCurrency(data[field], 2) }}
		      </template>
		    </Column>
		    <!-- Grand total column -->
		    <Column field="grandTotal"
		            header="Grand Total"
		            class="text-right font-bold"
		            headerClass="header-right"
								frozen alignFrozen="right"
		            sortable>
		      <template #body="{ data }">
		        {{ useFormatCurrency(data.grandTotal, 2) }}
		      </template>
		    </Column>
		    <!-- Totals footer row -->
				<ColumnGroup type="footer">
	        <Row>
	            <Column footer="Totals:" :colspan="groupByColumns.length" footerStyle="text-align:right" frozen alignFrozen="left" />
	            <Column v-for="period in periods" :footer="useFormatCurrency(getTotalForPeriod(period), 2)" class="text-right" />
	            <Column
	            	:footer="useFormatCurrency(grandTotals, 2)"
	            	class="text-right font-bold"
								frozen alignFrozen="right" />
	        </Row>
		    </ColumnGroup>

	    </DataTable>

	   	<div class="footer-signature">
	      <p>{{ formattedStartAt }} - {{ formattedEndAt }}, {{ chartSettings.timezone }} </p>
				<p> Prepared {{ new Date().toLocaleString(undefined, { timeZoneName: 'short' }) }}</p>
	    </div>

	  </Panel>
</template>

<script setup>
	import { computed, ref, onMounted, watch } from "vue"
	import { useStore } from 'vuex'
  import { useDateRange } from '@/composable/useDateRange'
	import { useFormatCurrency } from '@/composable/formatCurrency.js'
	import loadingImg from '@/assets/images/trivial-loading-optimized.webp'
	import MultiSelect from 'primevue/multiselect';
	import { FilterMatchMode, FilterOperator } from 'primevue/api';
	import { useToastNotifications } from '@/composable/toastNotification'

	const props = defineProps({
		chart: {
			type: Object,
			required: true,
			default: {}
		},
    chartSettings: {
      type: Object,
      required: true
    },
    nonEditableSearch: {
    	type: Object,
    	required: false
    },
	})

  const emit = defineEmits(['filter-change'])

	const filters = ref()
	const rawData = ref({})
	const tableData = ref([])
	const filteredTableData = ref([])
	const regId = computed(() => store.getters.getRegisterId)


	const { showSuccessToast, showErrorToast, showInfoToast } = useToastNotifications()
	const selectedQuarters = ref(),
			loading = ref(false),
			store = useStore()

  const groupByColumns = computed(() => {
    return props.chartSettings.groupBy?.length > 0 ? props.chartSettings.groupBy : [""]
  })

	// Currently unused, but this allows us to populate a multi-select dropdown
	const getFilterOptionsForColumn = (columnIndex) => {
	  if (columnIndex === -1 || !rawData.value?.count?.length) return []

	  const uniqueValues = [...new Set(
	    rawData.value.count.map(item => item.group[columnIndex])
	  )].filter(value => value !== undefined && value !== null)

	  return uniqueValues.map(value => ({
	    label: value?.toString() || '(Empty)',
	    value: value
	  })).sort((a, b) => a.label.localeCompare(b.label))
	}

	const initFilters = () => {
	  if (!groupByColumns.value) return
	  const newFilters = {}
	  groupByColumns.value.forEach((column, index) => {
      const key = props.chartSettings.groupBy[index]
	    newFilters[key] = {
	      operator: FilterOperator.AND,
	      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
	    }
	  })
	  filters.value = newFilters
	}

  const onFilterChange = (event) => {
  	filteredTableData.value = event.filteredValue
    emit('filter-change', event.filters, event.filteredValue)
  }

	const periods = computed(() => {
	  if (!rawData.value?.count) return []
	  return [...new Set(rawData.value.count.map(item => item.period))]
	})

	const grandTotals = computed(() => {
	  if (!filteredTableData.value?.length) return 0
	  return filteredTableData.value.reduce((acc, item) => {
	    acc += parseFloat(item.grandTotal) || 0
	    return acc
	  }, 0)
	})

	const getTotalForPeriod = period => {
	  if (!filteredTableData.value?.length) return 0
	  return filteredTableData.value.reduce((acc, item) => {
	   	return acc += parseFloat(item[period]) || 0
	  }, 0)
	}

	// Transform data for the table
	const formatForTable = (data) => {
	  if (!rawData.value?.count) return []
	  const groupMap = new Map()

	  data.count.forEach(item => {
	  	item.group = Array.isArray(item.group) ? item.group : [item.group]
	    const groupKey = item.group.join('_')
	    if (!groupMap.has(groupKey)) {
	      const row = {
	        ...item.group.reduce((acc, val, idx) => {
            const column_name = props.chartSettings.groupBy[idx]
	          acc[column_name] = val || ''
	          return acc
	        }, {}),
	        grandTotal: 0
	      }
	      groupMap.set(groupKey, row)
	    }

	    const currentValue = parseFloat(item.value) || 0
	    const row = groupMap.get(groupKey)
	    row[item.period] = currentValue // Store raw number
	    row.grandTotal += currentValue  // Add to running total
	  })

	  return Array.from(groupMap.values())
	}

  const { getDateRange, formatDisplayDate } = useDateRange()

  const dateRange = computed(() =>
    getDateRange(props.chartSettings.namedDateRange, props.chartSettings.timezone)
  )

  const startAt = computed(() => dateRange.value.startAt)
  const endAt = computed(() => dateRange.value.endAt)

  const formattedStartAt = computed(() =>
    formatDisplayDate(startAt.value, props.chartSettings.timezone)
  )
  const formattedEndAt = computed(() =>
    formatDisplayDate(endAt.value, props.chartSettings.timezone)
  )

  onMounted(() => {
    getData()
    initFilters()
  })

	const getDataOptions = computed(() => {
		return {
			register_id: regId.value,
			start_at: startAt.value,
			end_at: endAt.value,
      group_by_period: props.chartSettings.groupByPeriod,
      timezone: props.chartSettings.timezone,
      invert_sign: props.chartSettings.invertSign,
      group_by: props.chartSettings.groupBy,
      search: props.nonEditableSearch
      // NOTE These are the only search terms passed to the API, the rest are applied at render.
      //      It's possible we'll want to revisit this in the future.
		}
	})

	watch([getDataOptions], () => {
		getData()
	}, { deep: true })

  watch([() => props.chartSettings.groupBy], () => {
    initFilters()
  })

	const getData = () => {
		if (!regId.value) return
		loading.value = true
    rawData.value = {}
    tableData.value = []
		store.state.Session.apiCall(`/reports/item_sum`, 'POST', getDataOptions.value
			)
			.then(data => {
				rawData.value = data
				tableData.value = formatForTable(data)
			})
			.catch(error => {
				console.error(error)
				showErrorToast('Error', 'Failed to fetch data.')
			})
			.finally(() => {
				loading.value = false
			})
	}

</script>

<style scoped>
	div.footer-signature {
		margin-top: 2rem;
		font-size: 0.8rem;
		display: flex;
		justify-content: space-between;
	}

</style>