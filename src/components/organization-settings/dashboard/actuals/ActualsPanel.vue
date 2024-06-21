<template>
	<div class="flex">
		<Panel class="w-9 border-noround-right pt-2" :pt="{header: {class: 'pb-0'}}">
			<div class="flex flex-column">
				<div class="flex justify-content-between align-items-center w-full">
					<h2 class="flex justify-content-between align-items-center m-0 gap-2">
						Actuals

						<Button type="button" icon="pi pi-info-circle" severity="secondary" size="small" text rounded outlined aria-label="Info" @click="toggleInfoPopup" class="info__btn p-0 w-1rem h-1rem" />
						<OverlayPanel ref="infoPopup">
							<p class="m-0">This is a Actuals section.</p>
						</OverlayPanel>
					</h2>

					<div class="card flex justify-content-center">
						<Button type="button" icon="pi pi-ellipsis-v" outlined severity="secondary" @click="toggleMenu" aria-haspopup="true" aria-controls="overlay_menu" />
						<Menu ref="menu" id="overlay_menu" :model="menuItems" :popup="true" />
					</div>
				</div>

				<ul class="flex flex-wrap gap-4 w-9 mt-5 p-0 actuals__list">
					<li v-for="(item, index) in selectedActuals" :key="index" class="flex align-items-center gap-1">
						<Icon icon="fa-solid:check-circle" class="actuals__list--icon" />
						{{ item.name }}
					</li>
				</ul>
			</div>
		</Panel>
		<Panel class="w-3 border-left-none border-noround-left" :pt="{header: {class: 'pb-0'}}">
			<div class="flex flex-column justify-content-end align-items-end">
				<Button label="View Example" severity="info" text :pt="{label: {class: 'font-semibold'}}" @click="openActualsExampleDialog" class="mb-2" />

				<Image :src="ActualsImgPreview" alt="Actuals small preview" width="356" />
			</div>
		</Panel>
	</div>

	<CustomizeActualsDialog :visible="isActualsDialogOpen" :selectedActuals="selectedActuals" @saveSelectedActuals="updateSelectedActuals" @closeActualsModal="closeActualsDialog" />

	<ActualsExampleDialog :visible="isActualsExampleDialogOpen" @closeActualsExampleModal="closeActualsExampleDialog" :selectedActuals="selectedActuals" />
</template>

<script setup>
	import { ref, onMounted } from 'vue'
	import { Icon } from '@iconify/vue'
	import CustomizeActualsDialog from './CustomizeActualsDialog.vue'
	import ActualsExampleDialog from './ActualsExampleDialog.vue'
	import ActualsImgPreview from '@/assets/images/organization-settings/actuals-preview.svg'

	const infoPopup = ref(),
		isActualsDialogOpen = ref(false),
		isActualsExampleDialogOpen = ref(false),
		menu = ref(),
		menuItems = ref([
			{
				items: [
					{
						label: 'Customize',
						icon: 'pi pi-cog',
						command: () => openActualsDialog()
					},
					{
						label: 'Audit Logs',
						icon: 'pi pi-file',
						command: () => console.log('Audit Logs')
					}
				]
			}
		]),
		selectedActuals = ref([
			{name: 'Last Day Revenue', value: '$6,885', icon:'prime:arrow-up', class: 'up'},
			{name: 'Last 7 Days Revenue', value: '$54,903', icon:'prime:arrow-down', class: 'down'},
			{name: 'Last 30 Days Revenue', value: '$231,947', icon:'prime:arrow-up', class: 'up'},
			{name: 'Last 90 Days Revenue', value: '$657,295', icon:'prime:arrow-up', class: 'up'},
			{name: 'Year to Date Revenue', value: '$884,225', icon:'prime:arrow-down', class: 'down'}
		])

	const toggleInfoPopup = event => infoPopup.value.toggle(event)
	const toggleMenu = event => menu.value.toggle(event)

	const openActualsDialog = () => isActualsDialogOpen.value = true
	const closeActualsDialog = () => isActualsDialogOpen.value = false
	const openActualsExampleDialog = () => isActualsExampleDialogOpen.value = true
	const closeActualsExampleDialog = () => isActualsExampleDialogOpen.value = false
	const updateSelectedActuals = data => selectedActuals.value = data
</script>