<template>
	<Panel class="w-full shadow-2">
	  <DataTable :value="tableData" :scrollable="true" scroll-height="400px">
	      <template #header>
	        <div class="flex justify-content-between align-items-center">
	          <h2 class="font-semibold">{{ chart.name }}</h2>
	        </div>
	      </template>

	      <template #empty>
	        <div class="flex justify-content-between align-items-center">
	          <h2 class="font-semibold">No data</h2>
	        </div>
	      </template>

	      <template #loading>
	        <Image :src="loadingImg" alt="Loader" width="160" />
	        <h3>Loading ...</h3>
	      </template>

		    <Column v-for="(title, index) in groupBy"
		            :key="title"
		            :field="`group_${index}`"
		            :header="title.replaceAll('_', ' ')"
		            sortable :rowspan="groupBy.length"
		            class="capitalize"
		            :frozen="index === 0" />
		    <Column v-for="period in periods"
		            :key="period"
		            :field="period"
		            :header="period"
		            class="text-right"
		            sortable>
		      <template #body="{ data, field }">
		        {{ useFormatCurrency(data[field], 2) }}
		      </template>
		    </Column>
		    <Column field="grandTotal"
		            header="Grand Total"
		            class="text-right font-bold"
		            sortable>
		      <template #body="{ data }">
		        {{ useFormatCurrency(data.grandTotal, 2) }}
		      </template>
		    </Column>

				<ColumnGroup type="footer">
	        <Row>
	            <Column footer="Totals:" :colspan="groupBy.length" footerStyle="text-align:right" />
	            <Column v-for="period in periods" :footer="useFormatCurrency(getTotalForPeriod(period), 2)" class="text-right" />
	            <Column :footer="useFormatCurrency(grandTotals, 2)" class="text-right font-bold" />
	        </Row>
		    </ColumnGroup>

	    </DataTable>
	  </Panel>
</template>

<script setup>
	import { computed, ref, onMounted } from "vue"
	import { useStore } from 'vuex'
	import { useFormatCurrency } from '@/composable/formatCurrency.js'
	import loadingImg from '@/assets/images/trivial-loading-optimized.webp'
	import { useToastNotifications } from '@/composable/toastNotification'

	const props = defineProps({
		chart: {
			type: Object,
			required: true,
			default: {}
		}
	})

	const { showSuccessToast, showErrorToast, showInfoToast } = useToastNotifications()
	const selectedQuarters = ref(),
			loading = ref(false),
			headerCols = ref([]),
			store = useStore()

	const	rawData = ref({})

	const groupBy = computed(() => {
		const obj = props.chart.report_groups || {}
		return Object.keys(obj).filter(key => obj[key] === true)
	})

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
	const tableData = computed(() => {
	  if (!rawData.value?.count) return []
	  const groupMap = new Map()

	  rawData.value.count.forEach(item => {
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
	})

	onMounted(() => {
		getData()
	})

	const getDataOptions = computed(() => {
		return {
			register_id: store.state.registerId,
			start_at: props.chart.time_range_bounds.start_at,
			end_at: props.chart.time_range_bounds.end_at,
			group_by_period: props.chart.report_period,
			timezone: props.chart.default_timezones[0],
			group_by: groupBy.value,
			invert_sign: props.chart.invertSign
		}
	})

	const getData = () => {
		loading.value = true
		store.state.Session.apiCall(`/reports/item_sum`, 'POST', getDataOptions.value
			)
			.then(data => {
				rawData.value = data
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