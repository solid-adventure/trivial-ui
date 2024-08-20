<template>
	<div class="flex flex-column row-gap-4 dashboard">
		<Actuals />
		<!--<Forecast :selected="selectedForecast" /> -->

		<Divider class="my-1" />

		<template v-if="loading">
			<Skeleton height="33.75rem" borderRadius=".25rem" />
		</template>
		<template v-else>
			<template v-for="(item, index) in chartsData" :key="index">
				<template v-if="item.chartTypeAbbr === 'table'" >
					<GrossRevenue :grData="item" /> 
					<!--<RevenueWalk :revenueWalk="rwData" />
					<CashImpacts :cashImpacts="ciData" />-->
				</template>
			</template>
		</template>

		<Divider class="my-1" />

		<template v-if="loading">
			<div class="flex flex-wrap gap-3">
				<Skeleton height="24.5rem" width="49%" borderRadius=".25rem" />
				<Skeleton height="24.5rem" width="49%" borderRadius=".25rem" />
				<Skeleton height="24.5rem" width="49%" borderRadius=".25rem" />
				<Skeleton height="24.5rem" width="49%" borderRadius=".25rem" />
			</div>
		</template>
		<template v-else>
			<div class="flex flex-wrap gap-3">
				<template v-for="(item, index) in chartsData" :key="index">
					<template v-if="item.chartTypeAbbr === 'bar' || item.chartTypeAbbr === 'line'">
						<TheChart :headerTitle="item.name" :headerSubTitle="item.title" :chartDataSet="item.chart" :chartType="item.chartTypeAbbr" class="w-50" />
					</template>
				</template>
			</div>
		</template>

		<template v-if="loading">
			<div class="flex flex-wrap gap-3">
				<Skeleton height="24.5rem" width="49%" borderRadius=".25rem" />
				<Skeleton height="24.5rem" width="49%" borderRadius=".25rem" />
				<Skeleton height="24.5rem" width="49%" borderRadius=".25rem" />
				<Skeleton height="24.5rem" width="49%" borderRadius=".25rem" />
			</div>
		</template>
		<template v-else>
			<div class="flex flex-wrap gap-3">
				<template v-for="(item, index) in chartsData" :key="index">
					<template v-if="item.chartTypeAbbr === 'doughnut'">
						<TheDoughnutChart :headerTitle="item.name" :headerSubTitle="item.title" :chartDataSet="item.chart" :chartType="item.chartTypeAbbr" :width="'w-30'" />
					</template>
				</template>
			</div>
		</template>

		<!--<Divider class="my-1" />

		<RevenuePerHour />-->
	</div>
</template>

<script setup>
	import { ref, onMounted, computed, watch, toRaw } from 'vue'
	import { useStore } from 'vuex'
	import moment from 'moment-timezone'
	import Actuals from '@/components/dashboard/Actuals.vue'
	import Forecast from '@/components/dashboard/Forecast.vue'
	import GrossRevenue from '@/components/dashboard/GrossRevenue.vue'
	import RevenueWalk from '@/components/dashboard/RevenueWalk.vue'
	import CashImpacts from '@/components/dashboard/CashImpacts.vue'
	import TheChart from '@/components/dashboard/TheChart.vue'
	import TheDoughnutChart from '@/components/dashboard/TheDoughnutChart.vue'
	import RevenuePerHour from '@/components/dashboard/RevenuePerHour.vue'
	import { useToastNotifications } from '@/composable/toastNotification'
	import { useColorScheme } from '@/composable/colorScheme'

	/*const selectedForecast = {name: 'Last 7 Days x 30 x 12 Fcst', value: '$54,903', icon:'prime:arrow-down', class: 'down'},
		{name: 'Last 30 Days x 12 Fcst', value: '$231,947', icon:'prime:arrow-up', class: 'up'},
		{name: 'Last 90 Days x 4 Fcst', value: '$657,295', icon:'prime:arrow-up', class: 'up'},
	])*/

    const loading = ref(false),
    	store = useStore(),
    	registersNames = ['Sales', 'Income Account'],
		selectOrgMsgInfo = 'Please, select an organization.',
		{ showSuccessToast, showErrorToast, showInfoToast } = useToastNotifications(),
		{ themes } = useColorScheme(),
		chartsData = ref([])

	let regId = null,
		dashboardChart = null,
		dashboard = null,
		allDashboards = null,
		allCharts = null

	const orgId = computed(() => store.getters.getOrgId)
	watch(orgId, (newVal, oldVal) => dashboardInit(newVal))

	onMounted(() => {
		dashboardInit(orgId.value)
	})

	const dashboardInit = async id => {
		loading.value = true
		
		if (id === null) {
			showInfoToast('Info', selectOrgMsgInfo, 3000)
			loading.value = false
			return
		}

		if (id) {
			await getRegisters(id)

			allDashboards = await getAllDashboards()
			dashboard = getDashboard(allDashboards)

			if (dashboard) {
				//createChart(dashboard.id)
				//updateChart(dashboard.id)

				allCharts = await getAllCharts(dashboard.id)
				allCharts.charts.forEach(async item => await formatAllChartsData(item))
			}

			loading.value = false
		}

		loading.value = false
	}


	/************  API Calls Functions ***************/
	/*
		channel: null
		customer_id: null
		entity_id: null
		entity_type: null
		income_account: true
		warehouse: false
	*/
	/*const createChart = async dashId => {
		try {
			let res = await store.state.Session.apiCall(`dashboards/${dashId}/charts`, 'POST', {
				"register_id": regId,
				"name": "Example 6",
				"chart_type": "doughnut",
				"color_scheme": "purple",
				"report_period": "month",
				"report_groups": {
					"income_account": true
				}
			})
			
			console.log('RES CREATED - ', res)
		} catch (err) {
			console.log(err)
		}
	}

	const updateChart = async dashId => {
		try {
			let res = await store.state.Session.apiCall(`dashboards/${dashId}/charts/5`, 'PUT', {
				"name": "Example 3",
				"chart_type": "doughnut",
				"color_scheme": "red",
				"report_period": "month",
				"report_groups": {
					"income_account": true,
					"warehouse": true
				}
			})
			
			console.log('RES UPDATED - ', res)
		} catch (err) {
			console.log(err)
		}
	}*/



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

	const getAllCharts = async dashId => {
		try {
			let res = await store.state.Session.apiCall(`/dashboards/${dashId}/charts`)
			return res
		} catch (err) {
			console.log(err)
		}
	}

	const getChartsData = async groupBy => {
		let total = null
		const timezone = 'Etc/GMT+5', // Etc/GMT+5 -> Not support DST | 'America/Detroit' -> support DST | More info at https://appler.dev/time-zone-table
			end_at = moment.tz(timezone).format(),
			start_at = moment.tz(timezone).startOf('year').startOf('day').format(),
			group_by_period = 'month'

		try {
			total = await store.state.Session.apiCall('/reports/item_sum', 'POST', { register_id: regId, start_at, end_at, group_by_period, timezone, group_by: groupBy })

			return total
			//formatGrossRevenueData(total)
		} catch (err) {
			console.log(err)
		}
	}

	const setGroupBy = data => {
		const orderMap = {}
		let orderArray = JSON.parse(localStorage.getItem('grColsOrder')) || []

		orderArray.forEach((item, index) => orderMap[item] = index)
		return Object.keys(data.report_groups).filter(item => data.report_groups[item]).sort((a, b) => orderMap[a] - orderMap[b])
	}


	/************************* FORMAT CHARTS DATA *********************************/
	const formatAllChartsData = async data => {
		let groupBy = [],
			chartCount = null,
			chartTypeAbbr = data?.chart_type.split('_')[0] || '',
			colorScheme = data?.color_scheme || 'default',
			chartObj = {
				name: data?.name || '',
				chartType: data?.chart_type || '',
				chartTypeAbbr: chartTypeAbbr || '',
				count: [],
				title: '',
				group: '',
				chart: {}
			}

		groupBy = setGroupBy(data)

		let res = await getChartsData(groupBy)

		chartCount = res?.count || []

		chartObj.title = res?.title || ''
		chartObj.group = groupBy || ''
		
		if (chartTypeAbbr !== 'table') {
			chartObj.chart = formatBLPChartsData(chartTypeAbbr, colorScheme, chartCount)
		} else {
			chartObj.count = chartCount
		}

		chartsData.value.push(chartObj)
	}

	// Format data for Bar, Line, Pie, Doughnut Charts
	const formatBLPChartsData = (type, colorScheme = 'default', data) => {
		let chart = {}

		const groupedData = {}, // Create a map to group data by the first element in `group`
			months = [] // Define the months in the correct order

		data.forEach((item, index) => {
			let label = typeof item.group === 'string' ? item.group : item.group[0], // Use the first element in `group` as the label
				month = item.period.split(' ')[0]

			if (!months.includes(month)) months.push(month)

			if (!groupedData[label]) {

				let bgColors = type === 'doughnut' ? themes[colorScheme]['color'] : themes[colorScheme]['color'][Object.keys(groupedData).length % themes[colorScheme]['color'].length],
					hoverColor = type === 'doughnut' ? themes[colorScheme]['hover'] : themes[colorScheme]['hover'][Object.keys(groupedData).length % themes[colorScheme]['hover'].length],
					strokeColor = type === 'doughnut' ? themes[colorScheme]['stroke'] : themes[colorScheme]['stroke'][Object.keys(groupedData).length % themes[colorScheme]['stroke'].length],
					borderBgColor = type === 'doughnut' ? '#FFF' : bgColors

				groupedData[label] = {
					type: type,
					label: label.replaceAll('_', ' '),
					backgroundColor: bgColors,
					hoverBackgroundColor: hoverColor,
					strokeStyle: strokeColor,
					hoverOffset: 4,
					fill: false,
					borderWidth: 1,
					borderColor: borderBgColor,
					pointBackgroundColor: bgColors,
					tension: 0.4,
					data: new Array(months.length).fill(0) // Initialize data array with zeros for each month
				}
			}

			const monthIndex = months.indexOf(month)

			if (monthIndex !== -1) groupedData[label].data[monthIndex] = Math.round(parseFloat(item.value)) || 0
		})

		chart.labels = months
		chart.datasets = Object.values(groupedData) // Convert grouped data to array
		return chart
	}
</script>