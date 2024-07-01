<template>
	<h2 class="font-semibold">Users and Roles</h2>
	
	<!-- ************* Users TABLE *************** -->
	<UsersRolesTable :organization="orgData" @openAddUserModal="openAddUserModal" @openDeleteUserModal="setDeletedUser" @openDeleteOrgModal="setDeleteOrg" />

	<!-- ADD USER DIALOG/MODAL -->
	<AddUserDialog :visible="addUserModal" @closeUserModal="closeAddUserModal" @addNewUser="addNewUser" />

	<!-- DELETE USER DIALOG/MODAL -->
	<DeleteUserDialog :visible="deleteUserModal" :deletedUser="deletedUser" @closeDeleteUserModal="closeDeleteUserModal" @deleteUser="deleteUser" />

	<!-- DELETE ORGANIZATION DIALOG/MODAL -->
	<DeleteOrganizationDialog :visible="deleteOrganizationModal" :deletedOrg="deletedOrg" @closeDeleteOrgModal="closeDeleteOrgModal" @deleteOrganization="deleteOrganization" />
</template>

<script setup>
	import { ref, toRaw, computed, watch } from 'vue'
	import { useStore } from "vuex"
	import { useRoute, useRouter } from 'vue-router'
	import { useBrowserLocation } from '@vueuse/core'
	import { useToastNotifications } from '@/composable/toastNotification'
	import UsersRolesTable from '@/components/organization-settings/users/UsersRolesTable.vue'
	import AddUserDialog from '@/components/organization-settings/users/AddUserDialog.vue'
	import DeleteUserDialog from '@/components/organization-settings/users/DeleteUserDialog.vue'
	import DeleteOrganizationDialog from '@/components/organization-settings/users/DeleteOrganizationDialog.vue'

	const addUserModal = ref(false),
		deleteUserModal = ref(false),
		deleteOrganizationModal = ref(false),
		organization = ref([]),
		{ showSuccessToast, showErrorToast } = useToastNotifications(),
		store = useStore(),
		route = useRoute(),
		router = useRouter(),
		browserLocation = useBrowserLocation()

	let deletedUser = null,
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
</script>