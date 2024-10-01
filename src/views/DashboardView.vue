<template>
	<div class="flex flex-column row-gap-4 dashboard">
		<div v-if="allCharts.length === 0" class="flex justify-content-center align-items-center w-full h-screen">
			<ProgressSpinner aria-label="Loading" />
		</div>
		<div v-else class="flex flex-wrap gap-3 dashboard__carts">
			<template v-for="(item, index) in allCharts" :key="index">
				<component :is="dynamicComponents[tableChartTypes.includes(item?.chart_type) ? item?.chart_type : 'chart']" :chart="item" />
			</template>
		</div>
	</div>
</template>

<script setup>
	import { ref, onMounted, computed, watch, toRaw } from 'vue'
	import { useStore } from 'vuex'
	import moment from 'moment-timezone'
	import table from '@/components/dashboard/table.vue'
	import summary_group from '@/components/dashboard/summary_group.vue'
	import heatmap from '@/components/dashboard/heatmap.vue'
	import chart from '@/components/dashboard/chart.vue'
	import { useToastNotifications } from '@/composable/toastNotification'

	const loading = ref(false),
		store = useStore(),
		selectOrgMsgInfo = 'Please, select an organization.',
		{ showSuccessToast, showErrorToast, showInfoToast } = useToastNotifications(),
		dynamicComponents = {
			summary_group,
			table,
			chart,
			heatmap
		},
		tableChartTypes = ['summary_group', 'table', 'heatmap']

	let dashboard = null,
		allCharts = ref([])

	const orgId = computed(() => store.getters.getOrgId)
	const regId = computed(() => store.getters.getRegisterId)
	const dashboards = computed(() => store.getters.getDashboards)

	watch(orgId, async (newVal, oldVal) => await dashboardInit(newVal))
	watch(regId, async (newVal, oldVal) => await dashboardInit(orgId.value))
	watch(dashboards, async (newVal, oldVal) => await dashboardInit(orgId.value))

	onMounted(async () => {
		if (orgId.value) await dashboardInit(orgId.value)
	})

	const dashboardInit = async id => {
		await store.dispatch('register')
		if (id === null) {
			showInfoToast('Info', selectOrgMsgInfo, 3000)
			loading.value = false
			return
		}

		if (id) {
			if (dashboards.value) {
				dashboard = getDashboard(dashboards.value)
			}

			if (dashboard) {
				let res = await getAllCharts(dashboard.id)

				let sortedCharts = res.charts.filter(chart => chart !== null).sort((a, b) => sortChartsByType(a.chart_type, b.chart_type))
				allCharts.value = sortedCharts
			}
		}
	}

	// Sorting function based on chart type order
	const sortChartsByType = (chartTypeA, chartTypeB) => {
		const sortOrder = ['summary_group', 'table', 'bar_graph', 'line', 'doughnut'],
			indexA = sortOrder.indexOf(chartTypeA),
			indexB = sortOrder.indexOf(chartTypeB)

		// If a type is not in the list, it should appear last
		return (indexA === -1 ? sortOrder.length : indexA) - (indexB === -1 ? sortOrder.length : indexB)
	}

	const getDashboard = data => data?.find(item => item.owner_type === 'Organization' && item.owner_id === orgId.value)

	const getAllCharts = async dashId => {
		try {
			let res = await store.state.Session.apiCall(`/dashboards/${dashId}/charts`)
			return res
		} catch (err) {
			console.log(err)
		}
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
				"name": "Actuals",
				"chart_type": "summary_group",
				"color_scheme": "default",
				"report_period": "year",
				"report_groups": {
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
	}

	*/
</script>