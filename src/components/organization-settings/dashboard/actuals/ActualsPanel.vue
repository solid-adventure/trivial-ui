<template>
	<div class="flex">
		<Panel class="w-9 border-noround-right pb-4">
			<div class="flex flex-column">
				<div class="flex justify-content-between align-items-center w-full">
					<h2 class="flex justify-content-between align-items-center m-0 gap-2">
						Actuals

						<Button type="button" icon="pi pi-info-circle" severity="secondary" size="small" text rounded outlined aria-label="Info" @click="toggleInfoPopup" class="info__btn p-0 w-1rem h-1rem" />
						<OverlayPanel ref="infoPopup">
							<p class="m-0">This users belongs to <strong>{{ organizationName }}</strong> organization.</p>
						</OverlayPanel>
					</h2>

					<Button class="customize__btn" label="Customize" severity="secondary" outlined icon="pi pi-cog" @click="openActualDialog" />
				</div>

				<ul class="flex gap-4 p-0 actuals__list">
					<li><Icon icon="fa-solid:check-circle" class="actuals__list--icon" /> Hello</li>
					<li><Icon icon="fa-solid:check-circle" class="actuals__list--icon" /> World</li>
					<li><Icon icon="fa-solid:check-circle" class="actuals__list--icon" /> Hello</li>
					<li><Icon icon="fa-solid:check-circle" class="actuals__list--icon" /> World</li>
				</ul>
			</div>
		</Panel>
		<Panel class="w-3 border-left-none border-noround-left">
			<div class="">right</div>
		</Panel>
	</div>

	<CustomizeActualsDialog :visible="isActualsDialogOpen" @closeActualsModal="closeActualsModal" />
</template>

<script setup>
	import { ref } from 'vue'
	import { Icon } from '@iconify/vue'
	import CustomizeActualsDialog from './CustomizeActualsDialog.vue'

	const infoPopup = ref(),
		isActualsDialogOpen = ref(false)


	const toggleInfoPopup = event => infoPopup.value.toggle(event)

	const openActualDialog = () => isActualsDialogOpen.value = true
	const closeActualsModal = () => isActualsDialogOpen.value = false
</script>