<template>
	<div class="flex actuals__panels">
		<Panel class="w-9 border-noround-right pt-2" :pt="{header: {class: 'pb-0'}}">
			<div class="flex flex-column">
				<div class="flex justify-content-between align-items-center w-full">
					<h2 class="flex justify-content-between align-items-center m-0 gap-2 font-semibold">
						Actuals

						<Button type="button" icon="pi pi-info-circle" severity="secondary" size="small" text rounded outlined aria-label="Info" @click="toggleInfoPopup" class="info__btn p-0 w-1rem h-1rem" />
						<OverlayPanel ref="infoPopup">
							<p class="m-0">This is a Actuals section.</p>
						</OverlayPanel>
					</h2>

					<!-- <div class="card flex justify-content-center">
						<Button type="button" icon="pi pi-ellipsis-v" outlined severity="secondary" @click="toggleMenu" aria-haspopup="true" aria-controls="overlay_menu" />
						<Menu ref="menu" id="overlay_menu" :model="menuItems" :popup="true" />
					</div> -->
				</div>

				<ul class="flex flex-wrap gap-4 w-9 mt-5 p-0 actuals__list">
					<li v-for="(item, index) in selected" :key="index" class="flex align-items-center gap-1">
						<Icon icon="fa-solid:check-circle" class="actuals__list--icon" />
						{{ item.name }}
					</li>
				</ul>
				<div v-if="selectedLength == 0" class="flex justify-content-center align-items-center gap-3">
					<Icon icon="fluent:task-list-20-regular" class="w-4rem text-muted" />
					<div>
						<h3 class="m-0">Unlock Full Potential with Adding Data to Actuals</h3>
						<p class="mt-1 mb-0 text-sm text-muted">Customize your data to meet your specific requirements.</p>
					</div>
				</div>
			</div>
		</Panel>
		<Panel class="w-3 border-left-none border-noround-left actuals__panel" :pt="{header: {class: 'pb-0'}}">
			<div class="flex flex-column justify-content-end align-items-end actuals__panel__example">
				<Button label="View Example" severity="info" text :pt="{label: {class: 'font-semibold'}}" @click="openExampleDialog" class="mb-2" />

				<Image :src="thumbnailImgPreview" alt="Actuals small preview" width="356" class="mx-auto" />
			</div>
		</Panel>
	</div>

	<CustomizeActualsDialog :visible="isDialogOpen" :selected="selected" @saveSelected="updateSelected" @closeModal="closeDialog" />

	<ActualsExampleDialog :visible="isExampleDialogOpen" @closeExampleModal="closeExampleDialog" :selected="selected" />

	<AuditLogs :visible="isAuditLogsOpen" @closeAuditLogsSidebar="closeAuditLogs" />
</template>

<script setup>
	import { ref, computed, watch, onMounted } from 'vue'
	import { useStore } from 'vuex'
	import { Icon } from '@iconify/vue'
	import CustomizeActualsDialog from './CustomizeActualsDialog.vue'
	import ActualsExampleDialog from './ActualsExampleDialog.vue'
	import AuditLogs from './AuditLogs.vue'
	import ActualsLightImgPreview from '@/assets/images/organization-settings/light/actuals-preview.svg'
	import ActualsDarkImgPreview from '@/assets/images/organization-settings/dark/actuals-preview.svg'

	const infoPopup = ref(),
		isDialogOpen = ref(false),
		isExampleDialogOpen = ref(false),
		isAuditLogsOpen = ref(false),
		menu = ref(),
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
						command: () => openAuditLogs()
					}*/
				]
			}
		]),
		selected = ref([
			{ key: 'last1DayData', name: 'Last Day Revenue', value: null, icon: null, class: null },
			{ key: 'last7DaysData', name: 'Last 7 Days Revenue', value: null, icon: null, class: null },
			{ key: 'last1MonthsData', name: 'Last 30 Days Revenue', value: null, icon: null, class: null },
			{ key: 'last3MonthsData', name: 'Last 90 Days Revenue', value: null, icon: null, class: null },
			{ key: 'last1YearData', name: 'Year to Date Revenue', value: null, icon: null, class: null }
		]),
		store = useStore(),
		thumbnailImgPreview = ref(null)

	const selectedLength = computed(() => selected.value.length)

	watch(() => store.getters.getIsDarkTheme, async (newVal, oldVal) => {
		thumbnailImgPreview.value = newVal ? ActualsDarkImgPreview : ActualsLightImgPreview
	})

	onMounted(async () => {
		thumbnailImgPreview.value = await store.getters.getIsDarkTheme ? ActualsDarkImgPreview : ActualsLightImgPreview
	})

	const toggleInfoPopup = event => infoPopup.value.toggle(event)
	const toggleMenu = event => menu.value.toggle(event)

	const closeAuditLogs = () => isAuditLogsOpen.value = false
	const openAuditLogs = () => isAuditLogsOpen.value = true
	const openDialog = () => isDialogOpen.value = true
	const closeDialog = () => isDialogOpen.value = false
	const openExampleDialog = () => isExampleDialogOpen.value = true
	const closeExampleDialog = () => isExampleDialogOpen.value = false
	const updateSelected = data => selected.value = data
</script>