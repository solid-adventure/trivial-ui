<template>
	<div class="flex">
		<Panel class="w-9 border-noround-right pt-2" :pt="{header: {class: 'pb-0'}}">
			<div class="flex flex-column">
				<div class="flex justify-content-between align-items-center w-full">
					<h2 class="flex justify-content-between align-items-center m-0 gap-2 font-semibold">
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
					<li v-for="(item, index) in selected" :key="index" class="flex align-items-center gap-1">
						<Icon icon="fa-solid:check-circle" class="actuals__list--icon" />
						{{ item.name }}
					</li>
				</ul>
				<div v-if="selectedLength == 0" class="flex justify-content-center align-items-center mt-4 gap-3">
					<Icon icon="fluent:task-list-20-regular" class="w-4rem text-muted" />
					<div>
						<h3 class="m-0 font-semibold">Maximize Performance: Enter Your Forectas Data Today</h3>
						<p class="mt-1 mb-0 text-sm text-muted">Utilize in-depth insights to guide your decisions.</p>
					</div>
				</div>
			</div>
		</Panel>
		<Panel class="w-3 border-left-none border-noround-left" :pt="{header: {class: 'pb-0'}}">
			<div class="flex flex-column justify-content-end align-items-end">
				<Button label="View Example" severity="info" text :pt="{label: {class: 'font-semibold'}}" @click="openExampleDialog" class="mb-2" />

				<Image :src="thumbnailImgPreview" alt="Forecast small preview" width="356" class="mx-auto" />
			</div>
		</Panel>
	</div>

	<CustomizeForecastDialog :visible="isDialogOpen" :selectedForecast="selected" @saveSelected="updateSelected" @closeModal="closeDialog" />

	<ForecastExampleDialog :visible="isExampleDialogOpen" @closeExampleModal="closeExampleDialog" :selected="selected" />
</template>

<script setup>
	import { ref, computed, watch, onMounted } from 'vue'
	import { useStore } from 'vuex'
	import { Icon } from '@iconify/vue'
	import CustomizeForecastDialog from './CustomizeForecastDialog.vue'
	import ForecastExampleDialog from './ForecastExampleDialog.vue'
	import ForecastLightImgPreview from '@/assets/images/organization-settings/light/forecast-preview.svg'
	import ForecastDarkImgPreview from '@/assets/images/organization-settings/dark/forecast-preview.svg'

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
		selected = ref([
			{name: 'Last 7 Days x 30 x 12 Fcst', value: '$54,903', icon:'prime:arrow-down', class: 'down'},
			{name: 'Last 30 Days x 12 Fcst', value: '$231,947', icon:'prime:arrow-up', class: 'up'},
			{name: 'Last 90 Days x 4 Fcst', value: '$657,295', icon:'prime:arrow-up', class: 'up'},
		]),
		thumbnailImgPreview = ref(null)

	const selectedLength = computed(() => selected.value.length)
	
	watch(() => store.getters.getIsDarkTheme, async (newVal, oldVal) => {
		thumbnailImgPreview.value = newVal ? ForecastDarkImgPreview : ForecastLightImgPreview
	})

	onMounted(async () => {
		thumbnailImgPreview.value = await store.getters.getIsDarkTheme ? ForecastDarkImgPreview : ForecastLightImgPreview
	})

	const toggleInfoPopup = event => infoPopup.value.toggle(event)
	const toggleMenu = event => menu.value.toggle(event)

	const openDialog = () => isDialogOpen.value = true
	const closeDialog = () => isDialogOpen.value = false
	const openExampleDialog = () => isExampleDialogOpen.value = true
	const closeExampleDialog = () => isExampleDialogOpen.value = false
	const updateSelected = data => selected.value = data
</script>