<template>
	<Dialog v-model:visible="visible" :draggable="false" modal @hide="closeModal" header="Example of Gross Revenue" class="org-settings__dialog revenue__gross w-10">
		<template v-if="loading">
			<Skeleton height="33.75rem" borderRadius=".25rem" />
		</template>
		<template v-else>
			<GrossRevenue :grData="grossRevenueData" /> 
		</template>
	</Dialog>
</template>

<script setup>
	import { ref, watch, computed, onMounted } from "vue"
	import moment from 'moment-timezone'
	import { useStore } from 'vuex'
	import { useToastNotifications } from '@/composable/toastNotification'
	import GrossRevenue from '@/components/dashboard/GrossRevenue.vue'

	const props = defineProps(['visible'])
	const emit = defineEmits(['closeExampleModal'])

	const visible = ref(false),
		loading = ref(false),
		store = useStore(),
		registersNames = ['Sales', 'Income Account'],
		selectOrgMsgInfo = 'Please, select an organization.',
		{ showSuccessToast, showErrorToast, showInfoToast } = useToastNotifications()

	watch(props, newVal => visible.value = newVal.visible)

	let regId = null,
		dashboard = null,
		allDashboards = null,
		allCharts = null,
		groupBy = [],
		grossRevenueData = ref(null)

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
				allCharts = await getAllCharts(dashboard.id)
				allCharts.charts.forEach(async item => {
					if (item.chart_type === 'table') {
						grossRevenueData.value = await formatAllChartsData(item)
					}
				})
			}

			loading.value = false
		}

		loading.value = false
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

	const getAllCharts = async dashId => {
		try {
			let res = await store.state.Session.apiCall(`/dashboards/${dashId}/charts`)
			return res
		} catch (err) {
			console.log(err)
		}
	}

	const getChartsData = async (groupBy, invertSign = false) => {
		let total = null
		const timezone = 'Etc/GMT+5', // Etc/GMT+5 -> Not support DST | 'America/Detroit' -> support DST | More info at https://appler.dev/time-zone-table
			end_at = moment.tz(timezone).format(),
			start_at = moment.tz(timezone).startOf('year').startOf('day').format(),
			group_by_period = 'month'

		try {
			total = await store.state.Session.apiCall('/reports/item_sum', 'POST', { register_id: regId, start_at, end_at, group_by_period, timezone, group_by: groupBy, invert_sign: invertSign })

			return total
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

		let res = await getChartsData(groupBy, data?.invert_sign)

		chartCount = res?.count || []

		chartObj.title = res?.title || ''
		chartObj.group = groupBy || ''
		
		chartObj.count = chartCount

		return chartObj
	}

	const closeModal = () => {
		visible.value = false
		emit('closeExampleModal')
	}
</script>