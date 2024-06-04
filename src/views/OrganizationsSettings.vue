<template>

	<!-- API KEY TABLE -->
	<ApiKeysTable :keys="keys" @openAddKeyModal="openAddKeyModal" @openDeleteKeyModal="setDeletedApiKey" />

	<!-- ADD API KEY DIALOG/MODAL -->
	<AddApiKeysDialog :visible="addKeyDialogVisible" @closeAddKeyModal="closeAddKeyModal" />

	<!-- DELETE DIALOG/MODAL -->
	<DeleteApiKeysDialog :visible="delKeyDialogVisible" :deletedApiKey="deletedApiKey" @closeDeleteKeyModal="closeDeleteModal" @deleteApiKey="deleteApiKey" />
</template>

<script setup>
	import { ref, onMounted, toRaw } from 'vue'
	import { useToast } from 'primevue/usetoast'

	import ApiKeysTable from '@/components/organization-settings/ApiKeysTable.vue'
	import AddApiKeysDialog from '@/components/organization-settings/AddApiKeyDialog.vue'
	import DeleteApiKeysDialog from '@/components/organization-settings/DeleteApiKeyDialog.vue'

	const keys = ref(),
		addKeyDialogVisible = ref(false),
		delKeyDialogVisible = ref(false),
		toast = useToast()

	let deletedApiKey = null

	onMounted(() => {
		keys.value = [
			{ key: 'fgh145r7-b9ku44m11', description: 'Test key purpose', created_at: '2024-04-30T20:43:00.930Z' },
			{ key: 'fgh145r7-b9ku44m11', description: 'API Key for testing', created_at: '2024-04-30T20:43:00.930Z' },
			{ key: 'fgh145r7-b9ku44m11', description: 'Get API Key 111', created_at: '2024-04-30T20:43:00.930Z' },
			{ key: 'fgh145r7-b9ku44m11', description: 'API Key New Test', created_at: '2024-04-30T20:43:00.930Z' },
			{ key: 'fgh145r7-b9ku44m11', description: 'My API key', created_at: '2024-04-30T20:43:00.930Z' }
		]
	})

	const openAddKeyModal = () => addKeyDialogVisible.value = true
	const closeAddKeyModal = () => addKeyDialogVisible.value = false

	const openDeleteModal = () => delKeyDialogVisible.value = true
	const closeDeleteModal = () => delKeyDialogVisible.value = false

	const setDeletedApiKey = keyItem => {
		deletedApiKey = toRaw(keyItem)
		openDeleteModal()
	}

	const deleteApiKey = () => {
		// DELETE API Key from databse
		console.log('deletedApiKey - ', deletedApiKey)
		// Delete table row in memmory. Replace description with ID when we have real data
		keys.value = keys.value.filter(item => item.description !== deletedApiKey.description)
		
		closeDeleteModal()
		toast.add({ severity: 'info', summary: 'Info', detail: 'You have just deleted API Key.', life: 3000 })
	}
</script>