<template>
	<div class="flex">
		<Panel class="w-9 border-noround-right pt-2" :pt="{header: {class: 'pb-0'}}">
			<div class="flex flex-column">
				<div class="flex justify-content-between align-items-center w-full">
					<h2 class="flex justify-content-between align-items-center m-0 gap-2">
						Forecast

						<Button type="button" icon="pi pi-info-circle" severity="secondary" size="small" text rounded outlined aria-label="Info" @click="toggleInfoPopup" class="info__btn p-0 w-1rem h-1rem" />
						<OverlayPanel ref="infoPopup">
							<p class="m-0">This is a Forecast Section.</p>
						</OverlayPanel>
					</h2>

					<div class="card flex justify-content-center">
						<Button type="button" icon="pi pi-ellipsis-v" outlined severity="secondary" @click="toggleMenu" aria-haspopup="true" aria-controls="overlay_menu" />
						<Menu ref="menu" id="overlay_menu" :model="menuItems" :popup="true" />
					</div>
				</div>

				<ul class="flex flex-wrap gap-4 w-9 mt-5 p-0 actuals__list">
					<li v-for="(item, index) in selectedForecast" :key="index" class="flex align-items-center gap-1">
						<Icon icon="fa-solid:check-circle" class="actuals__list--icon" />
						{{ item.name }}
					</li>
				</ul>
			</div>
		</Panel>
		<Panel class="w-3 border-left-none border-noround-left" :pt="{header: {class: 'pb-0'}}">
			<div class="flex flex-column justify-content-end align-items-end">
				<Button label="View Example" severity="info" text :pt="{label: {class: 'font-semibold'}}" @click="openForecastExampleDialog" class="mb-2" />

				<Image :src="ForecastImgPreview" alt="Forecast small preview" width="356" />
			</div>
		</Panel>
	</div>

	<CustomizeForecastDialog :visible="isForecastDialogOpen" :selectedForecast="selectedForecast" @saveSelectedForecast="updateSelectedForecast" @closeForecastModal="closeForecastDialog" />

	<ForecastExampleDialog :visible="isForecastExampleDialogOpen" @closeForecastExampleModal="closeForecastExampleDialog" :selectedForecast="selectedForecast" />
</template>

<script setup>
	import { ref, onMounted } from 'vue'
	import { Icon } from '@iconify/vue'
	import CustomizeForecastDialog from './CustomizeForecastDialog.vue'
	import ForecastExampleDialog from './ForecastExampleDialog.vue'
	import ForecastImgPreview from '@/assets/images/organization-settings/forecast-preview.svg'

	const infoPopup = ref(),
		isForecastDialogOpen = ref(false),
		isForecastExampleDialogOpen = ref(false),
		menu = ref(),
		menuItems = ref([
			{
				items: [
					{
						label: 'Customize',
						icon: 'pi pi-cog',
						command: () => openForecastDialog()
					},
					{
						label: 'Audit Logs',
						icon: 'pi pi-file',
						command: () => console.log('Audit Logs')
					}
				]
			}
		]),
		selectedForecast = ref([
			{name: 'Last 7 Days x 30 x 12 Fcst', value: '$54,903', icon:'prime:arrow-down', class: 'down'},
			{name: 'Last 30 Days x 12 Fcst', value: '$231,947', icon:'prime:arrow-up', class: 'up'},
			{name: 'Last 90 Days x 4 Fcst', value: '$657,295', icon:'prime:arrow-up', class: 'up'},
		])

	const toggleInfoPopup = event => infoPopup.value.toggle(event)
	const toggleMenu = event => menu.value.toggle(event)

	const openForecastDialog = () => isForecastDialogOpen.value = true
	const closeForecastDialog = () => isForecastDialogOpen.value = false
	const openForecastExampleDialog = () => isForecastExampleDialogOpen.value = true
	const closeForecastExampleDialog = () => isForecastExampleDialogOpen.value = false
	const updateSelectedForecast = data => selectedForecast.value = data
</script>