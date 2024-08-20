<template>
	<div class="flex cash__impact__panels">
		<Panel class="w-9 border-noround-right pt-2" :pt="{header: {class: 'pb-0'}}">
			<div class="flex flex-column">
				<div class="flex justify-content-between align-items-center w-full">
					<h2 class="flex justify-content-between align-items-center m-0 gap-2 font-semibold">
						Other Cash Impacts ($)

						<Button type="button" icon="pi pi-info-circle" severity="secondary" size="small" text rounded outlined aria-label="Info" @click="toggleInfoPopup" class="info__btn p-0 w-1rem h-1rem" />
						<OverlayPanel ref="infoPopup">
							<p class="m-0">This is a Other Cash Impacts section.</p>
						</OverlayPanel>
					</h2>

					<div class="card flex justify-content-center">
						<Button type="button" icon="pi pi-ellipsis-v" outlined severity="secondary" @click="toggleMenu" aria-haspopup="true" aria-controls="overlay_menu" />
						<Menu ref="menu" id="overlay_menu" :model="menuItems" :popup="true" />
					</div>
				</div>

				<p class="w-5 mt-2 mb-4 text-muted">The table columns can be drag & dropped from the My Groups list to the Reporting Groups list and vice verse</p>

				<h3 class="font-medium">Reporting Groups <span class="text-muted">{{ reportingGroupsCountTxt }}</span></h3>

				<Accordion :activeIndex="0">
					<AccordionTab v-for="(tab, index) in selected" :key="index" :pt="{header: {class: 'revenue__gross'}}">
						<template #header>
							<div class="flex column-gap-2 align-items-center">
								<Icon icon="fa-solid:check-circle" class="revenue__gross--icon" />
								<span class="revenue__gross--title">{{ tab.name }}</span>
								<span class="font-normal">({{ tab.type }})</span>
							</div>
						</template>
						<ul class="flex flex-wrap gap-4 w-9 mt-5 p-0 actuals__list">
							<li v-for="(item, index) in tab.selectedValues" :key="index" class="flex align-items-center gap-1">
								<Icon icon="fa-solid:check-circle" class="actuals__list--icon" />
								{{ item }}
							</li>
						</ul>
					</AccordionTab>
				</Accordion>

				<div v-if="reportingGroupsLength == 0" class="flex justify-content-center align-items-center mt-6 gap-3 cash__impact__panel__empty">
					<Icon icon="lets-icons:folder-add-light" class="w-4rem text-muted" />
					<div class="w-6">
						<h3 class="m-0 font-semibold">Refine Your Analysis: Add New Data Columns</h3>
						<p class="mt-1 mb-0 text-sm text-muted">Utilize detailed insights to enhance your decision-making process.</p>
					</div>
				</div>
			</div>
		</Panel>
		<Panel class="w-3 border-left-none border-noround-left cash__impact__panel" :pt="{header: {class: 'pb-0'}}">
			<div class="flex flex-column justify-content-end align-items-end cash__impact__panel__example">
				<Button label="View Example" severity="info" text :pt="{label: {class: 'font-semibold'}}" @click="openExampleDialog" class="mb-2" />

				<Image :src="thumbnailImgPreview" alt="Revenue Walk small preview" width="356" class="mx-auto" />
			</div>
		</Panel>
	</div>

	<CustomizeCashImpactsDialog :visible="isDialogOpen" :selected="selected" @saveSelected="updateSelected" @closeModal="closeDialog" />

	<CashImpactsExampleDialog :visible="isExampleDialogOpen" @closeExampleModal="closeExampleDialog" :selected="selected" />
</template>

<script setup>
	import { ref, computed, watch, onMounted } from 'vue'
	import { useStore } from 'vuex'
	import { Icon } from '@iconify/vue'
	import CustomizeCashImpactsDialog from './CustomizeCashImpactsDialog.vue'
	import CashImpactsExampleDialog from './CashImpactsExampleDialog.vue'
	import CashImpactsLightImgPreview from '@/assets/images/organization-settings/light/cash-impacts-preview.svg'
	import CashImpactsDarkImgPreview from '@/assets/images/organization-settings/dark/cash-impacts-preview.svg'

	const infoPopup = ref(),
		isDialogOpen = ref(false),
		isExampleDialogOpen = ref(false),
		store = useStore(),
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
						command: () => console.log('Audit Logs')
					}*/
				]
			}
		]),
		selected = ref([]),
		thumbnailImgPreview = ref(null)


	const reportingGroupsLength = computed(() => selected.value.length)
	const reportingGroupsCountTxt = computed(() => `(${reportingGroupsLength.value} of 3)`)

	watch(() => store.getters.getIsDarkTheme, async (newVal, oldVal) => {
		thumbnailImgPreview.value = newVal ? CashImpactsDarkImgPreview : CashImpactsLightImgPreview
	})

	onMounted(async () => {
		thumbnailImgPreview.value = await store.getters.getIsDarkTheme ? CashImpactsDarkImgPreview : CashImpactsLightImgPreview
	})

	const toggleInfoPopup = event => infoPopup.value.toggle(event)
	const toggleMenu = event => menu.value.toggle(event)

	const openDialog = () => isDialogOpen.value = true
	const closeDialog = () => isDialogOpen.value = false
	const openExampleDialog = () => isExampleDialogOpen.value = true
	const closeExampleDialog = () => isExampleDialogOpen.value = false
	const updateSelected = data => selected.value = data
</script>
