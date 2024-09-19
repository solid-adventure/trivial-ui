<template>
	<Panel header="Actuals" :pt="{root: {class: 'shadow-2'}, header: {class: 'text-lg'}}">
		<div class="flex flex-wrap justify-content-between align-items-center gap-3 actuals__wrapper">
			<template v-if="loading">
				<Skeleton width="18rem" height="3rem"></Skeleton>
				<Skeleton width="18rem" height="3rem"></Skeleton>
				<Skeleton width="18rem" height="3rem"></Skeleton>
				<Skeleton width="18rem" height="3rem"></Skeleton>
				<Skeleton width="18rem" height="3rem"></Skeleton>
			</template>
			<template v-else-if="!getRegId">
				<h4 class="font-medium">No Actuals data</h4>
			</template>
			<template v-else>
				<div v-for="(item, index) in selectedActuals" :key="index" class="actuals__wrapper__item border-300" :class="{'border-right-1': index !== lastItem}">
					<p class="m-0 text-md text-muted">{{ item.name }}</p>
					<div class="flex align-items-center gap-1 mt-1">
						<p class="m-0 text-xl font-semibold">{{ useFormatCurrency(item.value) }}</p>
						<Icon :icon="item.icon" class="indicator__icon text-xl" :class="item.class"/>
					</div>
				</div>
			</template>
		</div>
	</Panel>
</template>

<script setup>
	import { ref, watch, computed, onMounted, toRaw } from "vue";
	import { Icon } from '@iconify/vue';
	import { useStore } from 'vuex';
	import { useFormatCurrency } from '@/composable/formatCurrency.js';
	import moment from 'moment-timezone';
	import { useToastNotifications } from '@/composable/toastNotification';
	import { useDateTimeZoneOptions } from '@/composable/dateTimeZoneOptions'

	//const props = defineProps(['selected']);

	const store = useStore(),
		{ timeZoneOptions } = useDateTimeZoneOptions(),
		timezone = timeZoneOptions.timeZone,
		apiOptionsObj = {
			register_id: null,
			start_at: null,
			end_at: moment.tz(timezone).utc().format(),
			timezone: timezone,
			invert_sign: false
		},
		selectedActuals = ref([
			{ key: 'last1DayData', name: 'Last Day Revenue', value: null, icon: null, class: null },
			{ key: 'last7DaysData', name: 'Last 7 Days Revenue', value: null, icon: null, class: null },
			{ key: 'last1MonthsData', name: 'Last 30 Days Revenue', value: null, icon: null, class: null },
			{ key: 'last3MonthsData', name: 'Last 90 Days Revenue', value: null, icon: null, class: null },
			{ key: 'last1YearData', name: 'Year to Date Revenue', value: null, icon: null, class: null }
		]),
		loading = ref(false),
		{ showSuccessToast, showErrorToast, showInfoToast } = useToastNotifications(),
		last1Day = moment().tz(timezone).subtract({ days: 1 }).startOf('day').utc().format(),
		last1DayOffset = moment(last1Day).tz(timezone).subtract({ days: 1 }).utc().format(),
		last7Days =  moment().tz(timezone).subtract({ days: 7 }).startOf('day').utc().format(),
		last7DaysOffset = moment(last7Days).tz(timezone).subtract({ days: 7 }).utc().format(),
		last1Months =  moment().tz(timezone).subtract({ months: 1 }).startOf('day').utc().format(),
		last1MonthsOffset = moment(last1Months).tz(timezone).subtract({ months: 1 }).utc().format(),
		last3Months =  moment().tz(timezone).subtract({ months: 3 }).startOf('day').utc().format(),
		last3MonthsOffset = moment(last3Months).tz(timezone).subtract({ months: 3 }).utc().format(),
		last1Year =  moment().tz(timezone).startOf('year').startOf('day').utc().format(),
		last1YearOffset = moment(last1Year).tz(timezone).subtract({ months: 6 }).utc().format()

	let regId = null,
		allActualsData = null,
		dashboard = null,
		allDashboards = null,
		chart = null

	const lastItem = computed(() => selectedActuals.value.length - 1),
		getRegId = computed(() => store.getters.getRegisterId),
		orgId = computed(() => store.getters.getOrgId),
		dashboards = computed(() => store.getters.getDashboards)

	watch(() => store.getters.getRegisterId, async newVal => {
		regId = newVal

		if (regId) await initActualsData()
	})

	watch(dashboards, (newVal, oldVal) => dashboardInit())

	onMounted(async () => {
		if (dashboards.value) dashboardInit()
		regId = getRegId.value
		if (regId) await initActualsData()
	})

	const initActualsData = async () => {
		loading.value = true
		
		allActualsData = await getAllActuals()
		if (allActualsData) formattingActualsData(allActualsData)

		loading.value = false
	}

	const getActuals = async (options, datePeriod) => {
		options.register_id = regId
		options.start_at = datePeriod
		options.invert_sign = chart?.invert_sign

		try {
			return await store.state.Session.apiCall('/reports/item_sum', 'POST', options)
		} catch (err) {
			console.error(err)
			return null
		}
	}

	const getAllActuals = async () => {
		loading.value = true

		try {
			// Last day
			const last1DayData = await getActuals(apiOptionsObj, last1Day),
				last1DayDataOffset = await getActuals(apiOptionsObj, last1DayOffset),
				// Last 7 days
				last7DaysData = await getActuals(apiOptionsObj, last7Days),
				last7DaysDataOffset = await getActuals(apiOptionsObj, last7DaysOffset),
				// Last month
				last1MonthsData = await getActuals(apiOptionsObj, last1Months),
				last1MonthsDataOffset = await getActuals(apiOptionsObj, last1MonthsOffset),
				// Last 3 month
				last3MonthsData = await getActuals(apiOptionsObj, last3Months),
				last3MonthsDataOffset = await getActuals(apiOptionsObj, last3MonthsOffset),
				// Last year
				last1YearData = await getActuals(apiOptionsObj, last1Year),
				last1YearDataOffset = await getActuals(apiOptionsObj, last1YearOffset)

			return {last1DayData, last1DayDataOffset, last7DaysData, last7DaysDataOffset, last3MonthsData, last3MonthsDataOffset, last1MonthsData, last1MonthsDataOffset, last1YearData, last1YearDataOffset}
		} catch (err) {
			console.error(err)
			return []
		} finally {
			loading.value = false
		}
	}

	const formattingActualsData = data => {
		selectedActuals.value.forEach(item => {
			item.value = data[item.key]?.count[0]?.value

			if (data[item.key] > data[`${item.key}Offset`]) {
				item.class = 'up'
				item.icon = 'prime:arrow-up'
			} else {
				item.class = 'down'
				item.icon = 'prime:arrow-down'
			}
		})
	}

	const dashboardInit = () => {
		dashboard = getDashboard(dashboards.value)
		chart = getChart(dashboard)
	}

	const getDashboard = data => data?.find(item => item.owner_type === 'Organization' && item.owner_id === orgId.value)
	const getChart = data => data?.charts.find(item => item.name === 'Actuals' && item.chart_type === 'summary_group')
</script>
