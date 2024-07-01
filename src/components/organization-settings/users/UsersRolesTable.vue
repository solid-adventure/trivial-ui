<template>
	<Panel>
		<DataTable :value="usersRolesData.users" tableStyle="max-width: 100%" class="org-settings__table">
			<template #header>
				<div class="flex justify-content-between pb-5">
					<h2 class="flex justify-content-between align-items-center m-0 gap-2 font-semibold">
						{{ usersRolesData.name }}

						<Button type="button" icon="pi pi-info-circle" severity="secondary" size="small" text rounded outlined aria-label="Info" @click="toggleInfoPopup" class="info__btn p-0" />
						<OverlayPanel ref="infoPopup">
							<p class="m-0">This users belongs to <strong>{{ organizationName }}</strong> organization.</p>
						</OverlayPanel>
					</h2>

					<div class="flex">
						<Button label="Add New User" icon="pi pi-plus" @click="emit('openAddUserModal')" class="org-settings__table__add--btn" />
					</div>
				</div>
			</template>
			
			<template #empty>
				<h3 v-if="isUsersRolesData">Please, select an organization.</h3>
				No users found.
			</template>
			
			<template #loading>
				<Image :src="loadingImg" alt="Loader" width="160" />
				<h3>Loading ...</h3>
			</template>
			
			<Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" sortable>
				<template #body="{ data, field }">
					{{ data[field] }}
				</template>
			</Column>
			<Column class="org-settings__table__action">
				<template #body="{ data, field }">
					<Button v-if="data.canBeRemoved" icon="pi pi-trash" severity="danger" @click="emit('openDeleteUserModal', data)" text rounded aria-label="Delete" />
				</template>
			</Column>

			<template #footer v-if="isOrganizationDeletable">
				<div class="flex justify-content-start">
					<Button label="Delete Organization" severity="danger" outlined icon="pi pi-trash" @click="emit('openDeleteOrgModal')" class="org-settings__table__delete--btn organization__delete--btn" />
				</div>
			</template>
		</DataTable>
	</Panel>
</template>


<script setup>
	import { ref, computed, onMounted, toRaw, watch } from 'vue'
	import { useStore } from "vuex"
	import { useFormatDate } from '@/composable/formatDate.js'
	import loadingImg from '@/assets/images/trivial-loading.gif'


	const props = defineProps(['organization'])
	const emit = defineEmits(['openAddUserModal', 'openDeleteUserModal', 'openDeleteOrgModal'])

	const usersRolesData = ref([]),
		columns = [
			{ field: 'name', header: 'Full Name' },
			{ field: 'email', header: 'Email' },
			{ field: 'role', header: 'Organization Role' }
		],
		store = useStore(),
		infoPopup = ref()

	const organizationName = computed(() => usersRolesData.value.name)
    const isOrganizationDeletable = computed(() => usersRolesData.value.length === 1)
	const lastAdmin = computed(() => usersRolesData.value.users.filter(user => user.role == 'admin').length == 1)
	const currentUserRole = computed(() => usersRolesData.value.users.find(user => user.user_id === store.state.user.id)?.role)
	const isUsersRolesData = computed(() => !usersRolesData.value?.id)

	watch(() => props.organization, (newVal, oldVal) => setUsersRolesData(newVal))

	onMounted(async () => {
		await setUsersRolesData(props.organization)
	})

	const toggleInfoPopup = event => infoPopup.value.toggle(event)

	const setUsersRolesData = async organization => {
		usersRolesData.value = await toRaw(organization)
		await setOrgPermits()
	}

    const setOrgPermits = async () => {
		for (const user of usersRolesData.value?.users || []) {
			user.canBeRemoved = await store.state.Permissions.can('removeMember', 'Org', { memberRole: user.role, userRole: currentUserRole.value, lastAdmin: lastAdmin.value })
		}
	}
</script>