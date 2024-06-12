<template>
	<!-- ************* API KEY TABLE *************** -->
	<UsersRolesTable :organization="orgData" @openAddUserModal="openAddUserModal" @openDeleteUserModal="setDeletedUser" @openDeleteOrgModal="setDeleteOrg" />

	<!-- ADD USER DIALOG/MODAL -->
	<AddUserDialog :visible="addUserModal" @closeUserModal="closeAddUserModal" @addNewUser="addNewUser" />

	<!-- DELETE USER DIALOG/MODAL -->
	<DeleteUserDialog :visible="deleteUserModal" :deletedUser="deletedUser" @closeDeleteUserModal="closeDeleteUserModal" @deleteUser="deleteUser" />

	<!-- DELETE ORGANIZATION DIALOG/MODAL -->
	<DeleteOrganizationDialog :visible="deleteOrganizationModal" :deletedOrg="deletedOrg" @closeDeleteOrgModal="closeDeleteOrgModal" @deleteOrganization="deleteOrganization" />

	<!-- ************* API KEY TABLE *************** -->
	<ApiKeysTable :keys="keys" @openAddKeyModal="openAddKeyModal" @openDeleteKeyModal="setDeletedApiKey" />

	<!-- ADD API KEY DIALOG/MODAL -->
	<AddApiKeysDialog :visible="addKeyDialogVisible" @closeAddKeyModal="closeAddKeyModal" />

	<!-- DELETE DIALOG/MODAL -->
	<DeleteApiKeysDialog :visible="delKeyDialogVisible" :deletedApiKey="deletedApiKey" @closeDeleteKeyModal="closeDeleteKeyModal" @deleteApiKey="deleteApiKey" />
</template>

<script setup>
	import { ref, onMounted, toRaw, computed, watch } from 'vue'
	import { mapState, useStore } from "vuex"
	import { useRoute, useRouter } from 'vue-router'
	import { useBrowserLocation } from '@vueuse/core'
	import { useToastNotifications } from '@/composable/toastNotification'
	import ApiKeysTable from '@/components/organization-settings/ApiKeysTable.vue'
	import AddApiKeysDialog from '@/components/organization-settings/AddApiKeyDialog.vue'
	import DeleteApiKeysDialog from '@/components/organization-settings/DeleteApiKeyDialog.vue'
	import UsersRolesTable from '@/components/organization-settings/UsersRolesTable.vue'
	import AddUserDialog from '@/components/organization-settings/AddUserDialog.vue'
	import DeleteUserDialog from '@/components/organization-settings/DeleteUserDialog.vue'
	import DeleteOrganizationDialog from '@/components/organization-settings/DeleteOrganizationDialog.vue'

	const keys = ref(null),
		addKeyDialogVisible = ref(false),
		delKeyDialogVisible = ref(false),
		addUserModal = ref(false),
		deleteUserModal = ref(false),
		deleteOrganizationModal = ref(false),
		organization = ref([]),
		{ showSuccessToast, showErrorToast } = useToastNotifications(),
		store = useStore(),
		route = useRoute(),
		router = useRouter(),
		browserLocation = useBrowserLocation()

	let deletedApiKey = null,
		deletedUser = null,
		deletedOrg = null

	const orgId = computed(() => route.params.id)
	const orgData = computed(() => organization.value)
	const storedOrgId = computed(() => store.getters.getOrgId)

	watch(storedOrgId, async (newVal, oldVal) => {
		if (!newVal) {
			resetOrganization()
			return
		}

		router.replace({
			params: {
				id: newVal
			}
		})
	})


	onMounted(async () => {

		keys.value = [
			{ key: 'fgh145r7-b9ku44m11', description: 'Test key purpose', created_at: '2024-04-30T20:43:00.930Z' },
			{ key: 'fgh145r7-b9ku44m11', description: 'API Key for testing', created_at: '2024-04-30T20:43:00.930Z' },
			{ key: 'fgh145r7-b9ku44m11', description: 'Get API Key 111', created_at: '2024-04-30T20:43:00.930Z' },
			{ key: 'fgh145r7-b9ku44m11', description: 'API Key New Test', created_at: '2024-04-30T20:43:00.930Z' },
			{ key: 'fgh145r7-b9ku44m11', description: 'My API key', created_at: '2024-04-30T20:43:00.930Z' }
		]
	})

	// Organization delete modal
	const openDeleteOrgModal = () => deleteOrganizationModal.value = true
	const closeDeleteOrgModal = () => deleteOrganizationModal.value = false

	const deleteOrganization = async () => {
		try {
			await store.state.Session.apiCall(`/organizations/${orgId.value}`, 'DELETE')
			localStorage.removeItem("orgId")
			store.dispatch('selectOrgId', null)
			organization.value = []
			showSuccessToast('Success', 'Successfully deleted Organization.')
		}
		catch (error) {
			showErrorToast('Error', error)
		}

		closeDeleteOrgModal()
	}

	// Users and Roles Modals
	const openAddUserModal = () => addUserModal.value = true
	const closeAddUserModal = () => addUserModal.value = false

	const openDeleteUserModal = () => deleteUserModal.value = true
	const closeDeleteUserModal = () => deleteUserModal.value = false

	// Add new user
	const addNewUser = async userData => {
		
		let user = toRaw(userData)

		// Set user props
		user.invitation_metadata.org_id = orgId.value
		user.trivial_ui_url = browserLocation.value.origin

		try {
			await store.state.Session.apiCall('/auth/invitation', 'POST', user)
			showSuccessToast('Success', 'Successfully added new User.')
		} catch(error) {
			showErrorToast('Error', `Failed to add new user: ${error.message}`)
		}
	}

	const setDeletedUser = userItem => {
		deletedUser = toRaw(userItem)
		openDeleteUserModal()
	}

	const setDeleteOrg = () => {
		deletedOrg = organization.value.name
		openDeleteOrgModal()
	}

	const deleteUser = async userData => {
		try{
			await store.state.Session.apiCall(`/organizations/${orgId.value}/delete_org_role?user_id=${userData.user_id}`, 'DELETE')
			organization.value.users = toRaw(organization.value.users).filter(item => item.user_id != userData.user_id)
			showSuccessToast('Success', 'Successfully deleted User.')
		} catch(error){
			showErrorToast('Error', `Failed to delete user: ${error.message}`)
		}
		
		closeDeleteUserModal()
	}

	// Get API data from organizations/users
	const getOrganization = async orgId => {
		try{
			organization.value = await store.state.Session.apiCall(`/organizations/${orgId}`)
		} catch(error){
			showErrorToast( 'Error', error)
		}
	}

	const resetOrganization = () => organization.value = []

	// Get Organization Users and Roles
	await getOrganization(orgId.value)






	// ***************************************************************************************** //
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