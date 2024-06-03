<template>
	<!-- !!!! The values are hardcoded until the API is implemented !!!! -->
	<h2>API Keys</h2>
	<!-- ************* API KEY TABLE *************** -->
	<ApiKeysTable :keys="keys" @openAddKeyModal="openAddKeyModal" @openDeleteKeyModal="setDeletedApiKey" />

	<!-- ADD API KEY DIALOG/MODAL -->
	<AddApiKeysDialog :visible="addKeyDialogVisible" @closeAddKeyModal="closeAddKeyModal" />

	<!-- DELETE DIALOG/MODAL -->
	<DeleteApiKeysDialog :visible="delKeyDialogVisible" :deletedApiKey="deletedApiKey" @closeDeleteKeyModal="closeDeleteKeyModal" @deleteApiKey="deleteApiKey" />
</template>

<script setup>
	import { ref, onMounted, toRaw, computed, watch } from 'vue'
	//import { mapState, useStore } from "vuex"
	//import { useRoute, useRouter } from 'vue-router'
	//import { useBrowserLocation } from '@vueuse/core'
	import { useToastNotifications } from '@/composable/toastNotification'
	import ApiKeysTable from '@/components/organization-settings/apikeys/ApiKeysTable.vue'
	import AddApiKeysDialog from '@/components/organization-settings/apikeys/AddApiKeyDialog.vue'
	import DeleteApiKeysDialog from '@/components/organization-settings/apikeys/DeleteApiKeyDialog.vue'

	const keys = ref(null),
		addKeyDialogVisible = ref(false),
		delKeyDialogVisible = ref(false)


	let deletedApiKey = null

	onMounted(async () => {

		keys.value = [
			{ key: 'EXAMPLE_KEY_1', description: 'Test key purpose', created_at: '2024-04-30T20:43:00.930Z' },
			{ key: 'EXAMPLE_KEY_2', description: 'API Key for testing', created_at: '2024-04-30T20:43:00.930Z' },
			{ key: 'EXAMPLE_KEY_3', description: 'Get API Key 111', created_at: '2024-04-30T20:43:00.930Z' },
			{ key: 'EXAMPLE_KEY_4', description: 'API Key New Test', created_at: '2024-04-30T20:43:00.930Z' },
			{ key: 'EXAMPLE_KEY_5', description: 'My API key', created_at: '2024-04-30T20:43:00.930Z' }
		]
	})

	// API Key Modals
	const openAddKeyModal = () => addKeyDialogVisible.value = true
	const closeAddKeyModal = () => addKeyDialogVisible.value = false

	const openDeleteKeyModal = () => delKeyDialogVisible.value = true
	const closeDeleteKeyModal = () => delKeyDialogVisible.value = false

	const setDeletedApiKey = keyItem => {
		deletedApiKey = toRaw(keyItem)
		openDeleteKeyModal()
	}

	const deleteApiKey = () => {
		// DELETE API Key from databse
		console.log('deletedApiKey - ', deletedApiKey)
		// Delete table row in memmory. Replace description with ID when we have real data
		keys.value = keys.value.filter(item => item.description !== deletedApiKey.description)
		
		closeDeleteKeyModal()
		useToastNotification({ severity: 'info', summary: 'Info', detail: 'You have just deleted API Key.', life: 3000 })
	}
</script>