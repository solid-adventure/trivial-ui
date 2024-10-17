<template>
	<h2 class="mb-0">Sales</h2>
	<p class="mt-2 mb-5">The column names and types displayed on the Sales page can be customized here.</p>

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
		if (register.value) {
			metaColumns.value = register?.meta || {}
		}
	})

	// Sales Columns delete modal
	const openDeleteSalesColsModal = () => visibleDelSalesColumnModal.value = true
	const closeDeleteSalesColsModal = () => visibleDelSalesColumnModal.value = false
	const openAddEditSalesColsModal = () => visibleAddSalesColumnModal.value = true
	const closeAddEditSalesColsModal = () => visibleAddSalesColumnModal.value = false

	const deleteSalesCols = async payload => {
		try {
			let msg = 'Successfully deleted Sales column.'
			await registerAPICall(payload, msg)
		}
		catch (error) {
			showErrorToast('Error', error)
		}

		closeDeleteSalesColsModal()
	}

	const addEditSalesCol = async payload => {
		try {
			let msg = 'Successfully added or edited Sales column.'
			await registerAPICall(payload, msg)
		}
		catch (error) {
			showErrorToast('Error', error)
		}

		closeDeleteSalesColsModal()
	}

	const registerAPICall = async (data, msg) => {
		let metaColumnsLenght = Object.keys(metaColumns.value).length,
			bodyObj = {meta: {}}

		if (metaColumnsLenght <= 9) {
			let key = data?.key === undefined ? `meta${metaColumnsLenght}` : data?.key
			
			data.field !== null ? metaColumns.value[key] = data.field : delete metaColumns.value[key]

			bodyObj.meta = {...metaColumns.value}

			await store.state.Session.apiCall(`/registers/${regId.value}`, 'PUT', bodyObj)
			showSuccessToast('Success', 'Successfully added or edited Sales column.')
		} else {
			showErrorToast('Error', 'Max number of meta columns has reached.')
		}
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