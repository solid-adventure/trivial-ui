<template>
	<Panel header="Actuals" :pt="{root: {class: 'shadow-2'}, header: {class: 'text-lg'}}" class="w-full">
		<div class="flex flex-wrap justify-content-between align-items-center actuals__wrapper">
			<template v-if="!getRegId">
				<h4 class="font-medium">No Actuals data</h4>
			</template>
			<template v-else>
				<div v-for="(item, index) in selectedActuals" :key="index" @click="togglePopup(index, $event)" class="actuals__wrapper__item p-3 border-round-md border-100" :class="{'border-right-1': index !== lastItem && !loading}">
					<p class="m-0 pb-2 text-md text-muted">{{ item.name }}</p>
					<Skeleton v-if="loading" height="3rem"></Skeleton>
					<template v-else-if="item.value">
						<div class="flex align-items-center gap-1 mt-1">
							<p class="m-0 text-xl font-semibold">{{ useFormatCurrency(item.value, 2) }}</p>
							<Icon :icon="item.icon" class="indicator__icon text-xl" :class="item.class"/>
						</div>
					</template>
					<template v-else>
						<p class="m-0 text-xl font-semibold">Not Available</p>
					</template>

					<OverlayPanel ref="op" class="px-2" >
						<div class="flex flex-column justify-content-start align-items-center actuals__wrapper__item__info">
							<div class="flex justify-content-start align-items-center gap-2 w-full px-1 py-2 border-bottom-1 border-300 actuals__wrapper__item__info--title">
								<h4 class="m-0">{{ item.name }}</h4>
								<!--<Tag :value="`${item.class === 'up' ? '+' : '-'} 0%`" class="border-1 actuals__wrapper__item__info--title-tag" :class="item.class" />-->
							</div>

							<div class="flex justify-content-start align-items-center gap-6 w-full px-1 py-2 border-bottom-1 border-300 actuals__wrapper__item__info--values">
								<!--<div class="flex flex-column">
									<h4 class="my-0 text-base font-normal">Previous Value</h4>
									<p v-if="item.dayOffset === 1" class="my-1 text-sm text-500">{{ formatDate(item.date, item.dayOffset) }}</p>
									<p v-else class="my-1 text-sm text-500">{{ formatDate(item.date, item.dayOffset) }} - {{ formatDate(item.date) }}</p> 

									<p v-if="item.value" class="text-md font-bold">{{ useFormatCurrency(item.value)}}</p>
									<p v-else class="m-0 text-xl font-semibold">Not Available</p>
								</div>-->
								<div class="flex flex-column">
									<h4 class="my-0 text-base font-normal">Current Value</h4>
									<p v-if="item.dayOffset === 1" class="my-1 text-sm text-500">{{ formatDate(item.date) }}</p>
									<p v-else class="my-1 text-sm text-500">{{ formatDate(item.date, item.dayOffset) }} - {{ formatDate(item.date) }}</p>

									<div class="flex gap-2">
										<p v-if="item.value" class="text-md font-bold">{{ useFormatCurrency(item.value, 2)}}</p>
										<p v-else class="m-0 text-xl font-semibold">Not Available</p>
										<Icon :icon="item.icon" class="indicator__icon text-xl" :class="item.class" />
										<pre>{{ item.link }}</pre>
									</div>
								</div>
							</div>

							<div class="flex justify-content-end align-items-center w-full py-2 actuals__wrapper__item__info--link">
								<router-link :to="item.link" target="_blank" rel="noopener">
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
	import { useDateTimeZoneOptions } from '@/composable/dateTimeZoneOptions';
	//const props = defineProps(['selected']);

	const props = defineProps({
		chart: {
			type: Object,
			required: true,
			default: {}
		}
	})

	const store = useStore(),
		op = ref([]),
		{ timeZoneOptions } = useDateTimeZoneOptions(),
		timezone = timeZoneOptions.timeZone,
		apiOptionsObj = {
			register_id: null,
			start_at: null,
			end_at: moment.tz(timezone).endOf('day').format(),
 			timezone: timezone,
 			invert_sign: false
		},
		selectedActuals = ref([
			{ key: 'last1DayData', name: 'Last Day Revenue', value: null, icon: null, class: null, dayOffset: 1 },
			{ key: 'last7DaysData', name: 'Last 7 Days Revenue', value: null, icon: null, class: null, dayOffset: 8 },
			{ key: 'last1MonthsData', name: 'Last 30 Days Revenue', value: null, icon: null, class: null, dayOffset: 31 },
			{ key: 'last3MonthsData', name: 'Last 90 Days Revenue', value: null, icon: null, class: null, dayOffset: 93 },
			{ key: 'last1YearData', name: 'Year to Date Revenue', value: null, icon: null, class: null, dayOffset: 367 }
		]),
		loading = ref(false),
		{ showSuccessToast, showErrorToast, showInfoToast } = useToastNotifications(),
		last1Day =     moment().tz(timezone),
		last7Days =    moment().tz(timezone).subtract({ days: selectedActuals.value[1].dayOffset }),
		last1Months =  moment().tz(timezone).subtract({ days: selectedActuals.value[2].dayOffset }),
		last3Months =  moment().tz(timezone).subtract({ days: selectedActuals.value[3].dayOffset }),
		last1Year =    moment().tz(timezone).subtract({ days: selectedActuals.value[4].dayOffset })

		// TODO: These offsets are not conceptually what we're trying to achieve
		//        They need a full refactor to reflect a period of the same length as the
		//        period they are comparing, stepped back by the same amount of time

		// last1DayOffset = moment(last1Day).tz(timezone).subtract({ days: 1 }),
		// last7DaysOffset = moment(last7Days).tz(timezone).subtract({ days: 7 }),
		// last1MonthsOffset = moment(last1Months).tz(timezone).subtract({ months: 1 }),
		// last3MonthsOffset = moment(last3Months).tz(timezone).subtract({ months: 3 }),
		// last1YearOffset = moment(last1Year).tz(timezone).subtract({ months: 6 })

	let regId = null,
		allActualsData = null,
		dashboard = null,
		allDashboards = null

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
		options.start_at = datePeriod.startOf('day').format()
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
			const last1DayData = await getActuals(apiOptionsObj, last1Day),
				last7DaysData = await getActuals(apiOptionsObj, last7Days),
				last1MonthsData = await getActuals(apiOptionsObj, last1Months),
				last3MonthsData = await getActuals(apiOptionsObj, last3Months),
				last1YearData = await getActuals(apiOptionsObj, last1Year)
			return {last1DayData, last7DaysData, last3MonthsData, last1MonthsData, last1YearData}

				// TODO  Re-enable when the offset logic is correct
				// last1DayDataOffset = await getActuals(apiOptionsObj, last1DayOffset),
				// last7DaysDataOffset = await getActuals(apiOptionsObj, last7DaysOffset),
				// last1MonthsDataOffset = await getActuals(apiOptionsObj, last1MonthsOffset),
				// last3MonthsDataOffset = await getActuals(apiOptionsObj, last3MonthsOffset),
				// last1YearDataOffset = await getActuals(apiOptionsObj, last1YearOffset)

			// return {last1DayData, last1DayDataOffset, last7DaysData, last7DaysDataOffset, last3MonthsData, last3MonthsDataOffset, last1MonthsData, last1MonthsDataOffset, last1YearData, last1YearDataOffset}
		} catch (err) {
			console.error(err)
			return []
		} finally {
			loading.value = false
		}
	}

	const formattingActualsData = data => {
		selectedActuals.value.forEach(item => {

			let currentDate = moment(item.date).tz(timezone).startOf('day').utc().format()

			item.value = data[item.key]?.count[0]?.value

			if (data[item.key] < data[`${item.key}Offset`]) {
				item.class = 'down'
				item.icon = 'prime:arrow-down'
			} else if ((data[item.key] > data[`${item.key}Offset`])){
				item.class = 'up'
				item.icon = 'prime:arrow-up'
			} else {
				item.class = ''
				item.icon = ''
			}

			if (item.dayOffset !== 1) {
				let perviousDate = moment(item.date).tz(timezone).subtract({ days: (item.dayOffset) }).startOf('day').utc().format()

				item.link = `/sales?search=${JSON.stringify([{c: "originated_at", o: "<", p: currentDate },{c: "originated_at", o:">", p: perviousDate}])}` 
			} else {
				let perviousDate = moment(item.date).tz(timezone).subtract({ days: item.dayOffset }).startOf('day').utc().format()

				item.link = `/sales?search=${JSON.stringify([{c: "originated_at", o : ">=", p : perviousDate}, {c: "originated_at", o: "<", p: currentDate}])}` 
			}
		})
	}

	const dashboardInit = () => {
		dashboard = getDashboard(dashboards.value)
	}

	const getDashboard = data => data?.find(item => item.owner_type === 'Organization' && item.owner_id === orgId.value)
	const togglePopup = (index, event) => op.value[index]?.toggle(event)

	const calcPercentage = (x, y) => {
		const percent = (Math.abs(parseFloat(x) - parseFloat(y)) / parseFloat(x)) * 100
		if(!isNaN(percent)){
			return Number(percent.toFixed(0));
		} else {
			return 0
		}
	}

	const formatDate = (date, offset = 0) => {
		const currentYear = moment().format('YYYY'),
			perviousYear = moment(date).subtract({ days: offset }).format('YYYY')

		return (currentYear > perviousYear) ? moment(date).subtract({ days: offset }).format('MMM Do YYYY') : moment(date).subtract({ days: offset }).format('MMM Do')
	}
</script>
