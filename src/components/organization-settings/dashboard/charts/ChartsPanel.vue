<template>
	<div class="flex gross__revenue__panels">
		<Panel class="w-full border-noround-right pt-2" :pt="{header: {class: 'pb-0'}}">
			<template #header>
				<div class="flex flex-column">
					<h2 class="m-0">Interactive Charts</h2>
					<p class="mt-2 text-muted">Enhance your data visualization by adding charts here.</p>
				</div>
			</template>
			<template #icons>
				<Button label="Add New Chart" icon="pi pi-plus" @click="openAddNewChartDialog" />
			</template>

			<div class="flex justify-content-center align-items-center my-6 gap-2 gross__revenue__panel__empty">
				<Image :src="EmptyChart" alt="Empty Chart" />
				<div>
					<h3 class="m-0 font-semibold">Enhance Your Insights with Introducing New Charts</h3>
					<p class="mt-1 mb-0 text-sm text-muted">Leverage in-depth insights to improve your day to day work.</p>
				</div>
			</div>
		</Panel>
	</div>

	<AddNewChartDialog :visible="isDialogOpen" :groupsColumnArr="reportGroups" :dashboardId="dashboard?.id" @closeModal="closeAddNewChartDialog" />
</template>

<script setup>
	import { ref, watch, computed, onMounted } from "vue"
	import { useStore } from 'vuex'
	import EmptyChart from '@/assets/images/organization-settings/icons/empty-chart.svg'
	import AddNewChartDialog from './AddNewChartDialog.vue'


	const isDialogOpen = ref(false),
		store = useStore()

	let reportGroups = ref(null),
		dashboardChart = null,
		dashboard = null,
		allDashboards = null

	const orgId = computed(() => store.getters.getOrgId)

	watch(orgId, async (newVal, oldVal) => {
		chartsInit(newVal)
	})

	onMounted(async () => {
		chartsInit(orgId.value)

		//thumbnailImgPreview.value = await store.getters.getIsDarkTheme ? GrossRevenueDarkImgPreview : GrossRevenueLightImgPreview
	})

	const chartsInit = async id => {
		if (id === null) {
			//showInfoToast('Info', selectOrgMsgInfo, 6000)
			return
		}

		if (id) {
			allDashboards = await getAllDashboards()
			dashboard = getDashboard(allDashboards)

			if (dashboard) {
				dashboardChart = getReportGroups(dashboard?.charts)
				reportGroups.value = setReportGroups(dashboardChart)
			}
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
	const getReportGroups = charts => charts.find(item => item.chart_type !== 'summary_group')
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

	const openAddNewChartDialog = () => isDialogOpen.value = true
	const closeAddNewChartDialog = () => isDialogOpen.value = false
</script>