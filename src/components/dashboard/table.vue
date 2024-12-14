<template>
	<Panel class="w-full shadow-2">
	  <DataTable :value="tableData"
	  	:scrollable="true"
	  	scroll-height="500px"
	  	size="small"
 			v-model:filters="filters"
			filterDisplay="menu"
	  	>
	      <template #header>
	        <div class="flex justify-content-between align-items-center">
	          <h2 class="font-semibold">{{ chart.name }}</h2>
						<div>
						  <FloatLabel class="w-full md:w-20rem">
						    <MultiSelect
						      id="group-by"
						      v-model="groupBy"
						      :options="reportGroupOptions"
						      optionLabel="label"
						      optionValue="value"
						      display="chip"
						      :maxSelectedLabels="4"
						      class="w-full"
						    />
						    <label for="group-by">Select Groups</label>
						  </FloatLabel>
						</div>

						<div>
						  <FloatLabel class="w-14rem">
						    <Dropdown
						      id="timezone"
						      v-model="timezone"
						      :options="chart.default_timezones"
						      class="w-full"
						    />
						    <label for="timezone">Timezone</label>
						  </FloatLabel>
						</div>

						<div>
						  <FloatLabel class="w-14rem">
						    <Dropdown
						      id="date-range"
						      v-model="namedDateRange"
						      :options="namedDateRanges()"
						      optionLabel="label"
						      optionValue="value"
						      class="w-full"
						    />
						    <label for="date-range">Dates</label>
						  </FloatLabel>
						</div>

						<div>
						  <FloatLabel class="w-14rem">
						    <Dropdown
						      id="group-by-period"
						      v-model="groupByPeriod"
						      :options="groupByPeriodOptions()"
						      class="w-full"
						    />
						    <label for="group-by-period">Group By</label>
						  </FloatLabel>
						</div>
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
	        :key="`group_${index}`"
	        :field="`group_${index}`"
	        :header="title.replaceAll('_', ' ')"
	        :filterField="`group_${index}`"
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
	      <p>{{ formattedStartAt }} - {{ formattedEndAt }}, {{ timezone }} </p>
				<p> Prepared {{ new Date().toLocaleString(undefined, { timeZoneName: 'short' }) }}</p>
	    </div>

	  </Panel>
</template>

<script setup>
	import { computed, ref, onMounted, watch } from "vue"
	import { useStore } from 'vuex'
	import { useFormatCurrency } from '@/composable/formatCurrency.js'
	import { groupByPeriodOptions } from '@/composable/groupByPeriodOptions'
	import { namedDateRanges, getDateRangeFromNamed } from '@/composable/namedDateRanges'
	import loadingImg from '@/assets/images/trivial-loading-optimized.webp'
	import moment from 'moment-timezone'
	import FloatLabel from 'primevue/floatlabel';
	import MultiSelect from 'primevue/multiselect';
	import { FilterMatchMode, FilterOperator } from 'primevue/api';
	import { useToastNotifications } from '@/composable/toastNotification'

	const props = defineProps({
		chart: {
			type: Object,
			required: true,
			default: {}
		}
	})

	const groupByPeriod = ref('')
	const namedDateRange = ref('')
	const timezone = ref('')
	const invertSign = ref(false)
	const groupBy = ref([])
	const filters = ref()
	const rawData = ref({})
	const tableData = ref([])

	const { showSuccessToast, showErrorToast, showInfoToast } = useToastNotifications()
	const selectedQuarters = ref(),
			loading = ref(false),
			store = useStore()

	const reportGroupOptions = computed(() => {
		return Object.keys(props.chart.report_groups || {}).map(key => ({
			value: key,
			label: key.replaceAll('_', ' ')
		}))
	})

	const groupByColumns = computed(() =>{
	  return groupBy.value?.length > 0 ? groupBy.value : [""]
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
	    const key = `group_${index}`
	    newFilters[key] = {
	      operator: FilterOperator.AND,
	      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
	    }
	  })
	  filters.value = newFilters
	}

	const periods = computed(() => {
	  if (!rawData.value?.count) return []
	  return [...new Set(rawData.value.count.map(item => item.period))]
	})

  const grandTotals = computed(() => {
	  if (!rawData.value?.count) return 0
	  return rawData.value.count.reduce((acc, item) => {
	    acc += parseFloat(item.value) || 0
	    return acc
	 	}, 0)
	})

	const getTotalForPeriod = period => {
	  if (!rawData.value?.count) return 0
	  return rawData.value.count.reduce((acc, item) => {
	    if (item.period === period) {
	      acc += parseFloat(item.value) || 0
	    }
	    return acc
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
	          acc[`group_${idx}`] = val || ''
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

	onMounted(() => {
		setChartDefaults()
	})

	const setChartDefaults = () => {
		namedDateRange.value = props.chart.default_time_range
		groupByPeriod.value = props.chart.report_period
		timezone.value = props.chart.default_timezones[0]
		invertSign.value = props.chart.invert_sign

		const reportGroups = props.chart.report_groups || {}
		groupBy.value = Object.keys(reportGroups).filter(key => reportGroups[key] === true)

	}

	const formatDateRange = (date, isEndDate = false) => {
	  if (!date || !timezone.value) return null
	  return moment.utc(date)
	    .tz(timezone.value)
	    [isEndDate ? 'endOf' : 'startOf']('day')
	    .utc()
	    .toISOString()
	}

	const formatDisplayDate = (date) => {
	  if (!date) return null
	  return moment(date).tz(timezone.value).format('MM/DD/YYYY h:mm A')

	}

	const startAt = computed(() => {
	  if (!namedDateRange.value) return null
	  const [start] = getDateRangeFromNamed(namedDateRange.value)
	  return formatDateRange(start)
	})

	const endAt = computed(() => {
	  if (!namedDateRange.value) return null
	  const [, end] = getDateRangeFromNamed(namedDateRange.value)
	  return formatDateRange(end, true)
	})

	const formattedStartAt = computed(() => formatDisplayDate(startAt.value))
	const formattedEndAt = computed(() => formatDisplayDate(endAt.value))

	const getDataOptions = computed(() => {
		return {
			register_id: store.state.registerId,
			start_at: startAt.value,
			end_at: endAt.value,
			group_by_period: groupByPeriod.value,
			timezone: timezone.value,
			invert_sign: invertSign.value,
			group_by: groupBy.value,
		}
	})

	watch([getDataOptions], () => {
		getData()
	}, { deep: true })

	watch([groupBy], () => {
		initFilters()
	})

	const getData = () => {
		loading.value = true
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