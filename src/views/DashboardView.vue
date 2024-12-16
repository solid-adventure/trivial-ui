<template>
	<div class="flex flex-column row-gap-4 dashboard">

		<div v-if="allCharts.length === 0" class="flex justify-content-center align-items-center w-full h-screen">
			<ProgressSpinner aria-label="Loading" />
		</div>
		<div v-else class="flex flex-wrap gap-3 dashboard__carts">
	    <ChartControls
	      v-model="masterChartSettings"
	    />
			<template v-for="(item, index) in allCharts" :key="index">
	    <component
	      :is="dynamicComponents[tableChartTypes.includes(item?.chart_type) ? item?.chart_type : 'chart']"
	      :chart="item"
	      :chart-settings="chartSettings[item.id]"
	      @filter-change="handleFilterChange"
	    />

			</template>
		</div>
	</div>
</template>

<script setup>
	import { ref, onMounted, computed, watch, toRaw } from 'vue'
	import { useRoute } from 'vue-router'
	import { useStore } from 'vuex'
  import ChartControls from '@/components/dashboard/ChartControls.vue'
	import table from '@/components/dashboard/table.vue'
	import summary_group from '@/components/dashboard/summary_group.vue'
	import heatmap from '@/components/dashboard/heatmap.vue'
	import chart from '@/components/dashboard/chart.vue'
	import { useToastNotifications } from '@/composable/toastNotification'
	import { searchFromFilter } from '@/composable/searchFromFilter'

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

	const route = useRoute()
	const orgId = computed(() => store.getters.getOrgId)
	const regId = computed(() => store.getters.getRegisterId)
	const dashboards = computed(() => store.getters.getDashboards)
	const chartSettings = ref({})
	const masterChartSettings = ref({})

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
				initializeChartSettings(sortedCharts)
			}
		}
	}

	const initializeChartSettings = (charts) => {
	  charts.forEach(chart => {
	    chartSettings.value[chart.id] = {
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
	  })
	 	masterChartSettings.value = Object.values(chartSettings.value)[0]
	}


	// watch the masterChartSettings for changes, and set those values to all children chart settings
	watch(masterChartSettings, (newVal, oldVal) => {
		// If the old value is empty, this is the initial load and we don't want to overwrite the chart's saved settings
		if (Object.entries(oldVal).length === 0) return
		Object.keys(chartSettings.value).forEach(key => {
			chartSettings.value[key] = newVal
		})
	}, { deep: true })

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

</script>