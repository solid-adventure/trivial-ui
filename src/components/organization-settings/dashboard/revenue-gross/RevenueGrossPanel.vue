<template>
	<div class="flex">
		<Panel class="w-9 border-noround-right pt-2" :pt="{header: {class: 'pb-0'}}">
			<div class="flex flex-column">
				<div class="flex justify-content-between align-items-center w-full">
					<h2 class="flex justify-content-between align-items-center m-0 gap-2">
						Gross Revenue ($)

						<Button type="button" icon="pi pi-info-circle" severity="secondary" size="small" text rounded outlined aria-label="Info" @click="toggleInfoPopup" class="info__btn p-0 w-1rem h-1rem" />
						<OverlayPanel ref="infoPopup">
							<p class="m-0">This is a Gross Revenue section.</p>
						</OverlayPanel>
					</h2>

					<div class="card flex justify-content-center">
						<Button type="button" icon="pi pi-ellipsis-v" outlined severity="secondary" @click="toggleMenu" aria-haspopup="true" aria-controls="overlay_menu" />
						<Menu ref="menu" id="overlay_menu" :model="menuItems" :popup="true" />
					</div>
				</div>

				<p class="w-5 mt-2 mb-4 text-muted">The table columns can be drag & dropped from the My Groups list to the Reporting Groups list and vice verse</p>

				<h3>Reporting Groups <span class="text-muted">{{ reportingGroupsCount }}</span></h3>

				<Accordion :activeIndex="0">
					<AccordionTab v-for="(tab, index) in selectedRG" :key="index" :pt="{header: {class: 'revenue__gross'}}">
						<template #header>
							<div class="flex column-gap-2 align-items-center">
								<Icon icon="fa-solid:check-circle" class="revenue__gross--icon" />
								<span class="revenue__gross--title">{{ tab.name }}</span>
								<span class="font-normal">({{ tab.type }})</span>
							</div>
						</template>
						<ul class="flex flex-wrap gap-4 w-9 mt-5 p-0 actuals__list">
							<li v-for="(item, index) in tab.selectedRGValues" :key="index" class="flex align-items-center gap-1">
								<Icon icon="fa-solid:check-circle" class="actuals__list--icon" />
								{{ item }}
							</li>
						</ul>
					</AccordionTab>
				</Accordion>
			</div>
		</Panel>
		<Panel class="w-3 border-left-none border-noround-left" :pt="{header: {class: 'pb-0'}}">
			<div class="flex flex-column justify-content-end align-items-end">
				<Button label="View Example" severity="info" text :pt="{label: {class: 'font-semibold'}}" @click="openRGExampleDialog" class="mb-2" />

				<Image :src="GrossRevenueImgPreview" alt="Gross Revenue small preview" width="356" />
			</div>
		</Panel>
	</div>

	<CustomizeRevenueGrossDialog :visible="isRGDialogOpen" :selectedRG="selectedRG" @saveSelectedRG="updateSelectedRG" @closeRGModal="closeRGDialog" :reportingGroupsCount="reportingGroupsCount" />

	<!--<RevenueGrossExampleDialog :visible="isRGExampleDialogOpen" @closeActualsExampleModal="closeRGExampleDialog" :selectedActuals="selectedActuals" />-->
</template>

<script setup>
	import { ref, computed, onMounted } from 'vue'
	import { Icon } from '@iconify/vue'
	import CustomizeRevenueGrossDialog from './CustomizeRevenueGrossDialog.vue'
	import RevenueGrossExampleDialog from './RevenueGrossExampleDialog.vue'
	import GrossRevenueImgPreview from '@/assets/images/organization-settings/gross-revenue-preview.svg'

	const infoPopup = ref(),
		isRGDialogOpen = ref(false),
		isRGExampleDialogOpen = ref(false),
		menu = ref(),
		menuItems = ref([
			{
				items: [
					{
						label: 'Customize',
						icon: 'pi pi-cog',
						command: () => openRGDialog()
					},
					{
						label: 'Audit Logs',
						icon: 'pi pi-file',
						command: () => console.log('Audit Logs')
					}
				]
			}
		]),
		selectedRG = ref([])

	const reportingGroupsCount = computed(() => `(${selectedRG.value.length} of 3)`)

	const toggleInfoPopup = event => infoPopup.value.toggle(event)
	const toggleMenu = event => menu.value.toggle(event)

	const openRGDialog = () => isRGDialogOpen.value = true
	const closeRGDialog = () => isRGDialogOpen.value = false
	const openRGExampleDialog = () => isRGDialogOpen.value = true
	const closeRGExampleDialog = () => isRGDialogOpenDialogOpen.value = false
	const updateSelectedRG = data => selectedRG.value = data
</script>
