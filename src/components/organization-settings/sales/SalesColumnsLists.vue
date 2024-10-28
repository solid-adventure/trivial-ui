<template>
	<Panel>
		<div class="flex justify-content-between align-items-start gap-8">
			<!-- Customizable Columns -->
			<DataView :value="customizableColumns" class="w-50" :pt="{ footer: { class: 'border-0' } }">
				<template #header>
					<h3 class="flex align-items-center m-0 gap-2 font-semibold">
						Editable Columns

						<Button type="button" icon="pi pi-info-circle" severity="secondary" size="small" text rounded outlined aria-label="Info" @click="toggleInfoPopupCustomColumns" class="info__btn p-0" />
						<OverlayPanel ref="infoPopupCustomColumns">
							<p class="w-25rem">Editable columns can be added, edited, or deleted. <br /><br />
							Note: Renaming columns <strong>does not affect table data</strong>. Changing the purpose of a column (the type of data stored) may produce unexpected results.</p>
						</OverlayPanel>
					</h3>
				</template>
				<template #empty>
					<h3 v-if="!orgId">Please, select an organization.</h3>
					<p v-if="customizableColumns.length === 0" class="pl-3">No columns found.</p>
				</template>

				<template v-if="loading" #list>
					<Skeleton v-for="i in 7" :key="i" height="3.75rem" borderRadius=".25rem" class="mb-2" />
				</template>
				<template v-else #list="slotProps">
					<div class="grid grid-nogutter pl-3">
						<div v-for="(item, index) in slotProps.items" :key="index" class="col-12">
							<div class="flex justify-content-between align-items-center p-1 gap-2" :class="{ 'border-top-1 surface-border': index !== 0 }">
								<div class="flex gap-2">
									<p class="font-semibold capitalize">{{ item.name }}</p>
									<!--<p>({{ item.type }})</p>-->
								</div>

								<div class="flex gap-2">
									<Button icon="pi pi-pencil" severity="secondary" text aria-label="Edit" @click="openAddEditColDialog(item)"/>
									<Button icon="pi pi-trash" severity="danger" text aria-label="Delete" @click="openDeleteColDialog(item)" />
								</div>
							</div>
						</div>
					</div>
				</template>

				<template #footer>
					<Button label="Add new Column" text icon="pi pi-plus" :disabled="customColumnsLength" @click="openAddEditColDialog"/>
					<p v-if="customColumnsLength" class="mt-1 text-xs font-normal text-500">
						<i class="text-xs pi pi-exclamation-triangle"></i>
						Maximum number of columns reached.
					</p>
				</template>
			</DataView>

			<!-- Non-Customizable Columns -->
			<DataView :value="nonCustomizableColumns" class="w-50">
				<template #header>
					<h3 class="flex align-items-center m-0 pl-0 gap-2 font-semibold">
						Locked Columns

						<Button type="button" icon="pi pi-info-circle" severity="secondary" size="small" text rounded outlined aria-label="Info" @click="toggleInfoPopupNonCustomColumns" class="info__btn p-0" />
						<OverlayPanel ref="infoPopupNonCustomColumns">
							<p class="w-25rem">These columns are always available on the register, and cannot be edited or deleted.</p>
						</OverlayPanel>
					</h3>
				</template>
				<template #empty>
					<h3 v-if="!orgId">Please, select an organization.</h3>
					<p class="pl-3">No columns found.</p>
				</template>
				<template #list="slotProps">
					<div class="grid grid-nogutter pl-3">
						<div v-for="(item, index) in slotProps.items" :key="index" class="col-12">
							<div class="flex p-1 gap-2" :class="{ 'border-top-1 surface-border': index !== 0 }">
								<p class="font-semibold">{{ item.name }}</p>
								<!-- <p>({{ item.type }})</p> -->
							</div>
						</div>
					</div>
				</template>
			</DataView>
		</div>
	</Panel>
</template>

<script setup>
	import { ref, toRaw, computed, watch, onMounted } from 'vue'
	import { useStore } from 'vuex'
	import { useToastNotifications } from '@/composable/toastNotification'

	const props = defineProps({
		metaCols: {
			type: Object,
			required: false,
			default: () => {}
		}
	})

	const emit = defineEmits(['openDeleteSalesColsModal', 'openAddEditSalesColModal'])

	const infoPopupCustomColumns = ref(),
		infoPopupNonCustomColumns = ref(),
		store = useStore(),
		nonCustomizableColumns = ref([
			{name: 'Amount', field: 'amount', type: 'Decimals', key: ''},
			{name: 'Description', field: 'description', type: 'String', key: ''},
			{name: 'Created at', field: 'created_at', type: 'Datetime', key: ''},
			{name: 'Updated at', field: 'updated_at', type: 'Datetime', key: ''},
			{name: 'Originated at', field: 'originated_at', type: 'Datetime', key: ''}
		]),
		customColumns = ref([]),
		loading = ref(false),
		{ showSuccessToast, showErrorToast } = useToastNotifications()

	const orgId = computed(() => store.getters.getOrgId)
	const customizableColumns = computed(() => customColumns.value)
	const customColumnsLength = computed(() => customColumns.value.length >= 9)

	watch(props, newVal => initColumns())

	onMounted(() => initColumns())

	const toggleInfoPopupCustomColumns = event => infoPopupCustomColumns.value.toggle(event)
	const toggleInfoPopupNonCustomColumns = event => infoPopupNonCustomColumns.value.toggle(event)
	const openDeleteColDialog = col => emit('openDeleteSalesColsModal', col)
	const openAddEditColDialog = col => emit('openAddEditSalesColModal', col)

	const initColumns = () => {
		loading.value = true
		customColumns.value = getMetaColumns()
		loading.value = false
	}

	const getMetaColumns = () => {
		let customColsArr = []

		// Map the filtered keys to the desired object structure
		Object.keys(props.metaCols).forEach(key => {
			let colObj = {
				name: props.metaCols[key] !== null ? props.metaCols[key].replaceAll('_', ' ') : '',
				field: props.metaCols[key],
				type: 'Unknown',  // Default value since we don't have the 'type' info for these keys
				key: key
			}

			customColsArr.push(colObj)
		})

		return customColsArr
	}
</script>