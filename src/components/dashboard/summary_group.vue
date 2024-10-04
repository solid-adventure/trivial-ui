<template>
	<Panel header="Actuals" :pt="{root: {class: 'shadow-2'}, header: {class: 'text-lg'}}" class="w-full">
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
				<div v-for="(item, index) in actuals" :key="index" @click="togglePopup(index, $event)" class="actuals__wrapper__item p-3 border-round-md border-100" :class="{'border-right-1': index !== lastItem}">

					<template v-if="item.value">
						<p class="m-0 text-md text-muted">{{ item.name }}</p>
						<div class="flex align-items-center gap-1 mt-1">
							<p class="m-0 text-xl font-semibold">{{ useFormatCurrency(item.value) }}</p>
							<Icon :icon="item.icon" class="indicator__icon text-xl" :class="item.class"/>
						</div>
					</template>
					<template v-else>
						<i class="pi pi-minus text-500" />
					</template>

					<OverlayPanel ref="op" class="px-2" >
						<div class="flex flex-column justify-content-start align-items-center actuals__wrapper__item__info">
							<div class="flex justify-content-start align-items-center gap-2 w-full px-1 py-2 border-bottom-1 border-300 actuals__wrapper__item__info--title">
								<h4 class="m-0">{{ item.name }}</h4>
								<Tag :value="`${item.class === 'up' ? '+' : '-'} ${calcPercentage(actualsOffsets[index].value, item.value)}%`" class="border-1 actuals__wrapper__item__info--title-tag" :class="item.class" />
							</div>

							<div class="flex justify-content-start align-items-center gap-6 w-full px-1 py-2 border-bottom-1 border-300 actuals__wrapper__item__info--values">
								<div class="flex flex-column">
									<h4 class="my-0 text-base font-normal">Previous Value</h4>
									<p v-if="actualsOffsets[index].dayOffset === 1" class="my-1 text-sm text-500">{{ formatDate(item.date, actualsOffsets[index].dayOffset) }}</p>
									<p v-else class="my-1 text-sm text-500">{{ formatDate(item.date, actualsOffsets[index].dayOffset) }} - {{ formatDate(item.date, true) }}</p> 

									<p class="text-md font-bold">{{ useFormatCurrency(actualsOffsets[index].value) }}</p>
								</div>
								<div class="flex flex-column">
									<h4 class="my-0 text-base font-normal">Current Value</h4>
									<p v-if="actualsOffsets[index].dayOffset === 1" class="my-1 text-sm text-500">{{ formatDate(item.date) }}</p>
									<p v-else class="my-1 text-sm text-500">{{ formatDate(item.date) }} - {{ formatDate(item.date, actualsOffsets[index].dayOffset, true) }}</p>

									<div class="flex gap-2">
										<p class="text-md font-bold">{{ useFormatCurrency(item.value) }}</p>
										<Icon :icon="item.icon" class="indicator__icon text-xl" :class="item.class" />
									</div>
								</div>
							</div>

							<div class="flex justify-content-end align-items-center w-full py-2 actuals__wrapper__item__info--link">
								<router-link to="/" target="_blank" rel="noopener">
									<Button label="View Details" link icon="pi pi-external-link" iconPos="right" class="font-semibold text-blue-600" />
								</router-link>
							</div>
						</div>
					</OverlayPanel>
				</div>
			</template>
		</div>
	</Panel>
	<Divider class="my-1" />
</template>

<script setup>
	import { ref, watch, computed, onMounted, toRaw } from "vue";
	import { Icon } from '@iconify/vue';
	import { useStore } from 'vuex';
	import { useFormatCurrency } from '@/composable/formatCurrency.js';
	import moment from 'moment-timezone';
	import { useToastNotifications } from '@/composable/toastNotification';

	//const props = defineProps(['selected']);

	const store = useStore(),
		op = ref([]),
		timezone = 'Etc/GMT+5',
		apiOptionsObj = {
			register_id: null,
			start_at: null,
			end_at: moment.tz(timezone).format(),
			timezone: timezone,
			invert_sign: false
		},
		selectedActuals = ref([
			{ key: 'last1Day', name: 'Last Day Revenue', value: null, icon: null, class: null, date: null, dashboardShow: true },
			{ key: 'last1DayOffset', name: 'Last Day Revenue Offset', value: null, icon: null, class: null, date: null, dashboardShow: false, dayOffset: 1 },
			{ key: 'last7Days', name: 'Last 7 Days Revenue', value: null, icon: null, class: null, date: null, dashboardShow: true },
			{ key: 'last7DaysOffset', name: 'Last 7 Days Offset Revenue', value: null, icon: null, class: null, date: null, dashboardShow: false, dayOffset: 7 },
			{ key: 'last1Months', name: 'Last 30 Days Revenue', value: null, icon: null, class: null, date: null, dashboardShow: true },
			{ key: 'last1MonthsOffset', name: 'Last 30 Days Offset Revenue', value: null, icon: null, class: null, date: null, dashboardShow: false, dayOffset: 30 },
			{ key: 'last3Months', name: 'Last 90 Days Revenue', value: null, icon: null, class: null, date: null, dashboardShow: true },
			{ key: 'last3MonthsOffset', name: 'Last 90 Days Offset Revenue', value: null, icon: null, class: null, date: null, dashboardShow: false, dayOffset: 90 },
			{ key: 'last1Year', name: 'Year to Date Revenue', value: null, icon: null, class: null, date: null, dashboardShow: true },
			{ key: 'last1YearOffset', name: 'Year to Date Offset Revenue', value: null, icon: null, class: null, date: null, dashboardShow: false, dayOffset: 365 }
		]),
		loading = ref(false),
		{ showSuccessToast, showErrorToast, showInfoToast } = useToastNotifications(),
		last1Day = moment().tz(timezone).subtract({ days: 1 }).startOf('day').format(),
		last1DayOffset = moment(last1Day).tz(timezone).subtract({ days: 1 }).format(),
		last7Days =  moment().tz(timezone).subtract({ days: 7 }).startOf('day').format(),
		last7DaysOffset = moment(last7Days).tz(timezone).subtract({ days: 7 }).format(),
		last1Months =  moment().tz(timezone).subtract({ months: 1 }).startOf('day').format(),
		last1MonthsOffset = moment(last1Months).tz(timezone).subtract({ months: 1 }).format(),
		last3Months =  moment().tz(timezone).subtract({ months: 3 }).startOf('day').format(),
		last3MonthsOffset = moment(last3Months).tz(timezone).subtract({ months: 3 }).format(),
		last1Year =  moment().tz(timezone).startOf('year').startOf('day').format(),
		last1YearOffset = moment(last1Year).tz(timezone).subtract({ months: 6 }).format(),
		actualsDates = [
			{ key: 'last1Day', date: last1Day },
			{ key: 'last1DayOffset', date: last1DayOffset },
			{ key: 'last7Days', date: last7Days },
			{ key: 'last7DaysOffset', date: last7DaysOffset },
			{ key: 'last1Months', date: last1Months },
			{ key: 'last1MonthsOffset', date: last1MonthsOffset },
			{ key: 'last3Months', date: last3Months },
			{ key: 'last3MonthsOffset', date: last3MonthsOffset },
			{ key: 'last1Year', date: last1Year },
			{ key: 'last1YearOffset', date: last1YearOffset }
		]

	let regId = null,
		allActualsData = null,
		dashboard = null,
		allDashboards = null,
		chart = null

	const lastItem = computed(() => selectedActuals.value.length - 1),
		getRegId = computed(() => store.getters.getRegisterId),
		orgId = computed(() => store.getters.getOrgId),
		dashboards = computed(() => store.getters.getDashboards),
		actuals = computed(() => selectedActuals.value.filter(item => item.dashboardShow)),
		actualsOffsets = computed(() => selectedActuals.value.filter(item => !item.dashboardShow))

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
				last1DayOffsetData = await getActuals(apiOptionsObj, last1DayOffset),
				// Last 7 days
				last7DaysData = await getActuals(apiOptionsObj, last7Days),
				last7DaysOffsetData = await getActuals(apiOptionsObj, last7DaysOffset),
				// Last month
				last1MonthsData = await getActuals(apiOptionsObj, last1Months),
				last1MonthsOffsetData = await getActuals(apiOptionsObj, last1MonthsOffset),
				// Last 3 month
				last3MonthsData = await getActuals(apiOptionsObj, last3Months),
				last3MonthsOffsetData = await getActuals(apiOptionsObj, last3MonthsOffset),
				// Last year
				last1YearData = await getActuals(apiOptionsObj, last1Year),
				last1YearOffsetData = await getActuals(apiOptionsObj, last1YearOffset)

			return {last1DayData, last1DayOffsetData, last7DaysData, last7DaysOffsetData, last3MonthsData, last3MonthsOffsetData, last1MonthsData, last1MonthsOffsetData, last1YearData, last1YearOffsetData}
		} catch (err) {
			console.error(err)
			return []
		} finally {
			loading.value = false
		}
	}

	const formattingActualsData = data => {
		selectedActuals.value.forEach((item, index) => {
			item.date = actualsDates[index].date
			item.value = data[`${item.key}Data`]?.count[0]?.value ? data[`${item.key}Data`]?.count[0]?.value : data[`${item.key}OffsetData`]?.count[0]?.value

			/*if (data[`${item.key}Data`]?.count[0]?.value) {
				item.value = data[`${item.key}Data`]?.count[0]?.value
			} else {
				item.value = data[`${item.key}DataOffset`]?.count[0]?.value
			}*/

			if (data[`${item.key}Data`] > data[`${item.key}OffsetData`]) {
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
	const togglePopup = (index, event) => op.value[index]?.toggle(event)
	const calcPercentage = (x, y) => {
		const percent = (Math.abs(parseFloat(x) - parseFloat(y)) / parseFloat(x)) * 100

		if(!isNaN(percent)){
			return Number(percent.toFixed(0));
		} else {
			return 0
		}
	}

	const formatDate = (date, offset = 0, forward = null ) => {
		const currentYear = moment().format('YYYY'),
			actualsYear = moment(date).subtract({ days: offset }).format('YYYY')

		if (currentYear > actualsYear && !forward) {
			return moment(date).subtract({ days: offset }).format('MMM Do YYYY')
		} else if (currentYear > actualsYear && forward) {
			return moment(date).add({ days: offset }).format('MMM Do YYYY')
		} else if (forward) {
			return moment(date).add({ days: offset }).format('MMM Do')
		} else {
			return moment(date).subtract({ days: offset }).format('MMM Do')
		}
	}
</script>
