<template>
	<div class="flex w-full gross__revenue__panels">
		<Panel class="w-9 border-noround-right pt-2" :pt="{header: {class: 'pb-0'}}">
			<div class="flex flex-column">
				<div class="flex justify-content-between align-items-center w-full">
					<h2 class="flex justify-content-between align-items-center m-0 gap-2 font-semibold">
						{{ props.chart.name }}
						<button @click="deleteChart(props.chart.id)">Delete - {{props.chart.id}}</button>

						<Button type="button" icon="pi pi-info-circle" severity="secondary" size="small" text rounded outlined aria-label="Info" @click="toggleInfoPopup" class="info__btn p-0 w-1rem h-1rem" />
						<OverlayPanel ref="infoPopup">
							<p class="m-0">This is a {{ props.chart.name }} section.</p>
						</OverlayPanel>
					</h2>

					<div class="card flex justify-content-center">
						<Button type="button" icon="pi pi-ellipsis-v" outlined severity="secondary" @click="toggleMenu" aria-haspopup="true" aria-controls="overlay_menu" />
						<Menu ref="menu" id="overlay_menu" :model="menuItems" :popup="true" />
					</div>
				</div>

				<p class="w-5 mt-2 mb-4 text-muted">The table columns can be drag & dropped from the My Groups list to the Reporting Groups list and vice verse</p>

				<h3 class="font-medium">Reporting Groups <span class="text-muted">{{ reportingGroupsCountTxt }}</span></h3>

				<div v-if="loading">
					<Skeleton height="3.375rem" class="mb-2" borderRadius=".25rem" />
					<Skeleton height="3.375rem" class="mb-2" borderRadius=".25rem" />
					<Skeleton height="3.375rem" class="mb-2" borderRadius=".25rem" />
				</div>
				<div v-else-if="reportingGroupsLength == 0" class="flex justify-content-center align-items-center mt-5 gap-3 gross__revenue__panel__empty">
					<Icon icon="lets-icons:folder-add-light" class="w-4rem text-muted" />
					<div class="w-6">
						<h3 class="m-0 font-semibold">Enhance Your Insights: Add Columns for Gross Revenue</h3>
						<p class="mt-1 mb-0 text-sm text-muted">Tailor your data to your specific needs and leverage <br /> comprehensive insights to inform your decisions.</p>
					</div>
				</div>
				<Accordion v-else> <!-- :activeIndex="0" -->
					<AccordionTab v-for="(tab, index) in selected" :key="index" :pt="{header: {class: 'revenue__gross'}}">
						<template #header>
							<div class="flex column-gap-2 align-items-center">
								<Icon icon="fa-solid:check-circle" class="revenue__gross--icon" />
								<span class="revenue__gross--title">{{ tab.name }}</span>
								<!--<span class="font-normal">({{ tab.type }})</span> -->
							</div>
						</template>
						<ul class="flex flex-wrap gap-4 w-9 mt-5 p-0 actuals__list">
							<!--<li v-for="(item, index) in tab.selectedValues" :key="index" class="flex align-items-center gap-1">
								<Icon icon="fa-solid:check-circle" class="actuals__list--icon" />
								{{ item }}
							</li>-->
						</ul>
					</AccordionTab>
				</Accordion>
			</div>
		</Panel>
		<Panel class="w-3 border-left-none border-noround-left gross__revenue__panel" :pt="{header: {class: 'pb-0'}}">
			<div class="flex flex-column justify-content-end align-items-end gross__revenue__panel__example">
				<Button label="View Example" severity="info" text :pt="{label: {class: 'font-semibold'}}" @click="openExampleDialog" class="mb-2" />

				<Skeleton v-if="isLoading" height="20rem" borderRadius=".25rem" />
				<Image v-else :src="thumbnailImgPreview" alt="Gross Revenue small preview" width="356" class="mx-auto" />
			</div>
		</Panel>
	</div>

	<CustomizeGrossRevenueDialog :visible="isDialogOpen" :groupsColumnArr="reportGroups" :selected="selected" @saveSelected="updateSelectedRG" @closeModal="closeDialog" :initInvertSign="invertSign" />

	<GrossRevenueExampleDialog :visible="isExampleDialogOpen" @closeExampleModal="closeExampleDialog" :selected="selected" />
</template>

<script setup>
	import { ref, computed, watch, onMounted } from 'vue'
	import { useImage } from '@vueuse/core'
	import { useStore } from 'vuex'
	import { Icon } from '@iconify/vue'
	import { useToastNotifications } from '@/composable/toastNotification'
	import CustomizeGrossRevenueDialog from './CustomizeGrossRevenueDialog.vue'
	import GrossRevenueExampleDialog from './GrossRevenueExampleDialog.vue'
	import GrossRevenueLightImgPreview from '@/assets/images/organization-settings/light/gross-revenue-preview.svg'
	import GrossRevenueDarkImgPreview from '@/assets/images/organization-settings/dark/gross-revenue-preview.svg'

	const props = defineProps({
		chart: {
			type: Object,
			required: true,
			default: {}
		}
	})

	const infoPopup = ref(),
		isDialogOpen = ref(false),
		isExampleDialogOpen = ref(false),
		{ showSuccessToast, showErrorToast, showInfoToast } = useToastNotifications(),
		store = useStore(),
		menu = ref(),
		loading = ref(false),
		menuItems = ref([
			{
				items: [
					{
						label: 'Customize',
						icon: 'pi pi-cog',
						command: () => openDialog()
					},
					/*{
						label: 'Audit Logs',
						icon: 'pi pi-file',
						command: () => console.log('Audit Logs')
					}*/
				]
			}
		]),
		selected = ref([]),
		thumbnailImgPreview = ref(null),
		reportGroupsChartObj = { name: 'Gross Revenue', report_period: 'month', report_groups: {}, invert_sign: false },
		selectOrgMsgInfo = 'Please, select an organization.',
		invertSign = ref(false)

	let reportGroups = ref(null),
		dashboardChart = null,
		dashboard = null,
		allDashboards = null

	const reportingGroupsLength = computed(() => selected.value.length)
	const reportingGroupsCountTxt = computed(() => `(${reportingGroupsLength.value} of 3)`)
	const orgId = computed(() => store.getters.getOrgId)
	const { isLoading } = useImage({ src: thumbnailImgPreview.value }, { delay: 1000 })

	watch(() => store.getters.getIsDarkTheme, async (newVal, oldVal) => {
		thumbnailImgPreview.value = newVal ? GrossRevenueDarkImgPreview : GrossRevenueLightImgPreview
	})

	watch(orgId, newVal => grossRevenueInit(newVal))
	watch(() => props.chart, newVal => grossRevenueInit())

	onMounted(async () => {
		grossRevenueInit(orgId.value)

		thumbnailImgPreview.value = await store.getters.getIsDarkTheme ? GrossRevenueDarkImgPreview : GrossRevenueLightImgPreview
	})

	const toggleInfoPopup = event => infoPopup.value.toggle(event)
	const toggleMenu = event => menu.value.toggle(event)

	const openDialog = () => isDialogOpen.value = true
	const closeDialog = () => isDialogOpen.value = false
	const openExampleDialog = () => isExampleDialogOpen.value = true
	const closeExampleDialog = () => isExampleDialogOpen.value = false
	const updateSelectedRG = async data => {
		selected.value = data?.selectedCols.filter(item => item.selected)

		let grColsOrder = []

		selected.value.forEach(item => grColsOrder.push(item.name.replaceAll(' ', '_')))

		localStorage.setItem('grColsOrder', JSON.stringify(grColsOrder))

		reportGroupsChartObj.invert_sign = data?.invertSign
		data?.selectedCols.forEach(item => reportGroupsChartObj.report_groups[item.key] = item.selected)

		try {
			let res = await store.state.Session.apiCall(`/dashboards/${dashboard.id}/charts/${dashboardChart.id}`, 'PUT', reportGroupsChartObj)
			showSuccessToast('Success', 'Reporting Groups updated successfully.')
		} catch (err) {
			console.log(err)
			showErrorToast('Error', 'Failed to update Reporting Groups.')
		}
	}

	const grossRevenueInit = async id => {
		loading.value = true
		
		/*if (id === null) {
			//showInfoToast('Info', selectOrgMsgInfo, 6000)
			loading.value = false
			return
		}

		if (id) {
			allDashboards = await getAllDashboards()
			dashboard = getDashboard(allDashboards)

			if (dashboard) {
				dashboardChart = getReportGroups(dashboard?.charts)
				reportGroups.value = setReportGroups(dashboardChart)
				selected.value = setSelectedRGCols(dashboardChart)
				invertSign.value = dashboardChart?.invert_sign
			}

			loading.value = false
		}*/


		console.log('props.chart - ', props.chart)
		
		reportGroups.value = setReportGroups(props.chart)
		selected.value = setSelectedRGCols(props.chart)
		invertSign.value = props.chart?.invert_sign

		console.log('invertSign.value - ', invertSign.value)

		loading.value = false
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
	const getReportGroups = charts => charts.find(item => item.chart_type === 'table')
	const setReportGroups = chart => {
		let groupsColsArr = []

		Object.keys(chart.report_groups).forEach((item, index) => {
			let groupsCol = {id: '', name: '', values: [], type: 'String', selectedValues: []}
			groupsCol.id = index,
			groupsCol.key = item,
			groupsCol.name = item.replaceAll('_', ' ')

			if (!chart.report_groups[item]) groupsColsArr.push(groupsCol)
		})

		return groupsColsArr
	}
	const setSelectedRGCols = chart => {
		const orderMap = {}
		let selectedColsArr = [],
			orderArray = JSON.parse(localStorage.getItem('grColsOrder')) || []

		Object.keys(chart.report_groups).forEach((item, index) => {
			let groupsCol = {id: '', name: '', values: [], type: 'String', selectedValues: []}
				groupsCol.id = index,
				groupsCol.key = item,
				groupsCol.name = item.replaceAll('_', ' ')

			if (chart.report_groups[item]) selectedColsArr.push(groupsCol)
		})

		orderArray.forEach((item, index) => orderMap[item] = index)

		selectedColsArr.sort((a, b) => orderMap[a.key] - orderMap[b.key])

		return selectedColsArr
	}

	const deleteChart = async id => await store.state.Session.apiCall(`/dashboards/${props.chart.dashboard_id}/charts/${id}`, 'DELETE')
</script>