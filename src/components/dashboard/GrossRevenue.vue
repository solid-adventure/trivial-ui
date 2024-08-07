<template>
	<Panel class="shadow-2">
		<DataTable :value="grossRevenue" :loading="loading" scrollable rowGroupMode="rowspan" :groupRowsBy="groupBy[0]" tableStyle="min-width: 120rem" class="revenue__gross__table">
			<template #header>
				<div class="flex justify-content-between align-items-center">
					<h2 class="font-semibold">Gross Revenue ($)</h2>

					<!-- SELECT QUARTERS-->
					<!--<Dropdown v-model="selectedQuarters" :options="quarters" optionLabel="name" placeholder="Select Quarter(s)" class="w-14rem" />-->
				</div>
			</template>
			<template #empty>
				<h4 class="font-medium">No Gross Revenue data found.</h4>
			</template>
			<template #loading>
				<Image :src="loadingImg" alt="Loader" width="160" />
				<h3>Loading ...</h3>
			</template>
			<ColumnGroup type="header" v-if="grossRevenue.length">
				<Row>
					<template v-if="groupBy.length">
						<Column v-for="col in groupBy" :key="col" :field="col" :header="col.replaceAll('_', ' ')" sortable rowspan="3" class="capitalize" />
					</template>
					<template v-else>
						<Column header="All" rowspan="3" />
					</template>
				</Row>
				<Row>
					<!-- Empty row -->
					<Column :colspan="4" />
					<Column :colspan="4" />
				</Row>
				<Row>
					<Column v-for="col in headerCols" :key="col" :field="col" :header="col" sortable class="month__col capitalize" />
					<Column v-if="grossRevenue.length" header="Grand Total" frozen alignFrozen="right" sortable field="grandTotal" class="border-left-1 border-top-1 border-200 month__col" />
				</Row>
			</ColumnGroup>

			<template v-if="groupBy.length">
				<Column v-for="col in groupBy" :key="col" :field="col" />
			</template>
			<template v-else>
				<Column field="All" />
			</template>

			<Column v-for="col in headerCols" :key="col" :field="col" class="text-right">
				<template #body="slotProps">
					{{useFormatCurrency(slotProps.data[col], 2)}}
				</template>
			</Column>

			<Column field="grandTotal" frozen alignFrozen="right" class="w-12rem border-left-1 border-200 font-semibold text-right">
				<template #body="slotProps">
					{{useFormatCurrency(slotProps.data.grandTotal, 2)}}
				</template>
			</Column>
			<ColumnGroup v-if="grossRevenue.length" type="footer" frozen>
				<Row>
					<Column footer="Grand Total" footerStyle="text-align:left" :colspan="groupBy.length" />
					<Column v-for="(item, index) in grandTotals" :key="index" :footer="useFormatCurrency(item, 2)" alignFrozen="right" :frozen="index === 'grandTotals'" class="text-right" :class="{ 'border-left-1 border-200': index === 'grandTotals' }" />
				</Row>
			</ColumnGroup>
		</DataTable>
	</Panel>
</template>

<script setup>
	import { ref, onMounted, computed, watch, toRaw } from "vue"
	import { useStore } from 'vuex'
	import { useStorage } from '@vueuse/core'
	import { Icon } from '@iconify/vue'
	import { useFormatCurrency } from '@/composable/formatCurrency.js'
	import loadingImg from '@/assets/images/trivial-loading-optimized.webp'
	import moment from 'moment-timezone'
	import { useToastNotifications } from '@/composable/toastNotification'

	const selectedQuarters = ref(),
			/*quarters = ref([
				//{name: 'Quarter Q1', item: 'q1'},
				//{name: 'Quarter Q2', item: 'q2'},
				{name: 'Quarter Q3', item: 'q3'},
				{name: 'Quarter Q4', item: 'q4'}
			]),*/
			loading = ref(false),
			store = useStore(),
			registersNames = ['Sales', 'Income Account'],
			selectOrgMsgInfo = 'Please, select an organization.',
			{ showSuccessToast, showErrorToast, showInfoToast } = useToastNotifications(),
			headerCols = ref([])

	let regId = null,
		groupBy = ref([]),
		grandTotals = ref(),
		grossRevenue = ref([]),
		dashboardChart = null,
		dashboard = null,
		allDashboards = null

	const orgId = computed(() => store.getters.getOrgId)
	watch(orgId, (newVal, oldVal) => grossRevenueInit(newVal))

	onMounted(() => {
		grossRevenueInit(orgId.value)
	})

	const grossRevenueInit = async id => {
		loading.value = true
		
		if (id === null) {
			showInfoToast('Info', selectOrgMsgInfo, 3000)
			grossRevenue.value = []
			loading.value = false
			return
		}

		if (id) {
			await getRegisters(id)

			allDashboards = await getAllDashboards()
			console.log('allDashboards - ', allDashboards)
			dashboard = getDashboard(allDashboards)
			console.log('dashboard - ', dashboard)

			if (dashboard) {
				dashboardChart = getReportGroups(dashboard?.id, dashboard?.charts)
				console.log('dashboardChart ', dashboardChart)
				setGroupBy(dashboardChart)
				await getGrossRevenue()
			}

			loading.value = false
		}

		loading.value = false
	}

	const getGrossRevenue = async () => {
		let total = null
		const timezone = 'Etc/GMT+5', // Etc/GMT+5 -> Not support DST | 'America/Detroit' -> support DST | More info at https://appler.dev/time-zone-table
			end_at = moment.tz(timezone).format(),
			start_at = moment.tz(timezone).startOf('year').startOf('day').format(),
			group_by_period = 'month'

		try {
			total = await store.state.Session.apiCall('/reports/item_sum', 'POST', { register_id: regId, start_at, end_at, group_by_period, timezone, group_by: toRaw(groupBy.value) })

			formatGrossRevenueData(total)
		} catch (err) {
			console.log(err)
		} finally {
			return
		}
	}

	const getRegisters = async organizationId => {
		try {
			let allRegisters = await store.state.Session.apiCall('/registers'),
				register = allRegisters.find(r => r.owner_type === 'Organization' && r.owner_id === organizationId && registersNames.includes(r.name))

			regId = register.id
		} catch (err) {
			console.log(err)
			showErrorToast('Error', 'Failed to fetch data.')
		}
	}

	const getAllDashboards = async () => {
		try {
			let res = await store.state.Session.apiCall('/dashboards')
			return res
		} catch (err) {
			console.log(err)
		}
		
	}
	const getDashboard = data => data.dashboards.find(item => item.owner_type === 'Organization' && item.owner_id === orgId.value)
	const getReportGroups = (dashID, charts) => charts.find(item => item.dashboard_id === dashID)
	const setGroupBy = data => {
		const orderMap = {}
		let orderArray = JSON.parse(localStorage.getItem('grColsOrder')) || []

		orderArray.forEach((item, index) => orderMap[item] = index)
		groupBy.value = Object.keys(data.report_groups).filter(item => data.report_groups[item]).sort((a, b) => orderMap[a] - orderMap[b])
	}
	const abbreviateMonth = month => {
		const months = {
			"Jan": "jan", "Feb": "feb", "Mar": "mar", "Apr": "apr", 
			"May": "may", "Jun": "jun", "Jul": "jul", "Aug": "aug", 
			"Sep": "sep", "Oct": "oct", "Nov": "nov", "Dec": "dec"
		}
		return months[month]
	}

	const formatGrossRevenueData = data => {
		let formattedData = [],
			groupedData = {},
			headers = []

		data?.count.forEach(item => {
			let dynamicColOne = null, // dynamic col first
				dynamicColTwo = null, // dynamic col second
				dynamicColTree = null, // dynamic col tree
				month = item?.period.split(" ")[0],
				value = parseFloat(item?.value)

			if (typeof item?.group !== 'string') {
				dynamicColOne = item?.group[0]
				dynamicColTwo = item?.group[1]
				dynamicColTree = item?.group[2]
			} else {
				dynamicColOne = item?.group
			}

			if (!headers.includes(abbreviateMonth(month))) headers.push(abbreviateMonth(month))

			if (!groupedData[dynamicColOne]) groupedData[dynamicColOne] = {}

			if (!groupedData[dynamicColOne][dynamicColTwo]) {
				groupedData[dynamicColOne][dynamicColTwo] = {
					grandTotal: 0,
					headers: []
				}

				groupedData[dynamicColOne][dynamicColTwo][groupBy?.value[0]] = dynamicColOne
				groupedData[dynamicColOne][dynamicColTwo][groupBy?.value[1]] = dynamicColTwo
				groupedData[dynamicColOne][dynamicColTwo][groupBy?.value[2]] = dynamicColTree
			}

			groupedData[dynamicColOne][dynamicColTwo].headers.push(abbreviateMonth(month))
			groupedData[dynamicColOne][dynamicColTwo][abbreviateMonth(month)] = value
			groupedData[dynamicColOne][dynamicColTwo].grandTotal += value
		})

		Object.keys(groupedData).forEach(dynColOneItem => {
			Object.keys(groupedData[dynColOneItem]).forEach(dynColTwoItem => {
				formattedData.push(groupedData[dynColOneItem][dynColTwoItem])
			})
		})

		//headerCols.value = [... new Set(formattedData[0].headers)]
		headerCols.value = headers
		calculateColumnTotals(formattedData)

		grossRevenue.value = formattedData
	}

	const calculateColumnTotals = formattedDataArray =>{
		let columnTotals = {},
			total = null

		formattedDataArray.forEach(data => {
			data.headers.forEach(month => {
				if (!columnTotals[month]) {
					columnTotals[month] = 0
				}

				columnTotals[month] += data[month]
			})

			total += data.grandTotal
		})

		columnTotals.grandTotals = total
		grandTotals.value = columnTotals
	}
</script>