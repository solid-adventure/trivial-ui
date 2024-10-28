<template>
	<h2 class="mb-0">Sales</h2>
	<p class="mt-2 mb-5 text-muted">The columns displayed on the Sales page can be customized here.</p>

	<SalesColumnsLists @openDeleteSalesColsModal="setDeleteSalesCols" @openAddEditSalesColModal="openAddEditSalesColsDialog" :metaCols="metaColumns" />

	<!-- ADD/EDIT SALES COLUMN DIALOG/MODAL -->
	<AddEditSalesColumnDialog :visible="visibleAddSalesColumnModal" :editCol="column" @addEditSalesCol="addEditSalesCol" @closeAddEditSalesColModal="closeAddEditSalesColsModal" />

	<!-- DELETE SALES COLUMN DIALOG/MODAL -->
	<DeleteSalesColumnDialog :visible="visibleDelSalesColumnModal" :deletedCol="column" @closeDeleteSalesColModal="closeDeleteSalesColsModal" @deleteSalesCol="deleteSalesCols" />
</template>

<script setup>
	import { ref, toRaw, computed, watch, onMounted } from 'vue'
	import { useStore } from 'vuex'
	import { useToastNotifications } from '@/composable/toastNotification'
	import SalesColumnsLists from '@/components/organization-settings/sales/SalesColumnsLists'
	import DeleteSalesColumnDialog from '@/components/organization-settings/sales/DeleteSalesColumnDialog'
	import AddEditSalesColumnDialog from '@/components/organization-settings/sales/AddEditSalesColumnDialog'

	const visibleDelSalesColumnModal = ref(false),
		visibleAddSalesColumnModal = ref(false),
		metaCol = ref(null),
		metaColumns = ref({}),
		column = ref(null),
		store = useStore(),
		{ showSuccessToast, showErrorToast } = useToastNotifications()

	const register = computed(() => store.getters.getRegister)
	const regId = computed(() => store.getters.getRegisterId)

	watch(register, newVal => { metaColumns.value = newVal?.meta || {} }, { deep: true })

	onMounted(() => {
		metaColumnsInit()
	})

	const metaColumnsInit = () => metaColumns.value = register.value?.meta || {}
	// Sales Columns modals
	const openDeleteSalesColsModal = () => visibleDelSalesColumnModal.value = true
	const closeDeleteSalesColsModal = () => visibleDelSalesColumnModal.value = false
	const openAddEditSalesColsModal = () => visibleAddSalesColumnModal.value = true
	const closeAddEditSalesColsModal = () => visibleAddSalesColumnModal.value = false

	const deleteSalesCols = async payload => {
		try {
			let msg = 'Successfully deleted Sales column.',
				data = formatColObjData(payload)
			await registerAPICall(data, msg)
		}
		catch (error) {
			showErrorToast('Error', error)
		}

		closeDeleteSalesColsModal()
	}

	const addEditSalesCol = async payload => {
		try {
			let msg = 'Successfully added or edited Sales column.',
				data = formatColObjData(payload)
			await registerAPICall(data, msg)
		}
		catch (error) {
			showErrorToast('Error', error)
		}

		closeDeleteSalesColsModal()
	}

	const formatColObjData = data => {
		// Get the values of the original object
		const values = Object.values(metaColumns.value),
			modifiedObject = {} // Create a new object with sequential meta keys based on array length

		for (let i = 0; i < values.length; i++) {
			modifiedObject[`meta${i}`] = values[i]
		}

		// Determine the key to use, defaulting to `meta` + current length
		const metaColumnsLength = Object.keys(modifiedObject).length,
			key = data?.key === undefined ? `meta${metaColumnsLength}` : data.key

		// If field is not null, add/update the key; if null, delete it
		data.field !== null ? modifiedObject[key] = data.field : delete modifiedObject[key]

		// Update `metaColumns.value` and return formated data for API
		metaColumns.value = modifiedObject
		return { meta: { ...metaColumns.value } }
	}

	const registerAPICall = async (data, msg) => {
		await store.state.Session.apiCall(`/registers/${regId.value}`, 'PUT', data)
		showSuccessToast('Success', msg)
	}

	const setDeleteSalesCols = payload => {
		column.value = payload
		openDeleteSalesColsModal()
	}

	const openAddEditSalesColsDialog = payload => {
		column.value = payload.hasOwnProperty('field') ? payload : {}
		openAddEditSalesColsModal()
	}
</script>