<template>
	<Panel class="border-round-lg shadow-2">
		<DataTable
			v-model:filters="filters"
			:value="contracts" 
			:loading="loading"
			:rows="rows" 
			:rowsPerPageOptions="rowsPerPageOpt"
			:first="first"
			:totalRecords="totalRecords"
			paginator
			tableStyle="max-width: 100%" 
			dataKey="id"
			filterDisplay="menu"
			scrollable
			:globalFilterFields="globalFilterFields"
		>
			<template #header>
				<div class="flex justify-content-between py-5">
					<div class="flex align-content-center gap-5">
						<h2 class="m-0 line-height-3">Customer Contracts</h2>
						<Dropdown v-model="selectedContract" :options="dropdownContracts" optionLabel="name" placeholder="Select a Contract" class="w-14rem" />
					</div>
					<div>
						<router-link to="/apps/new?paneltype=contract" rel="noopener">
							<Button label="Add New Contract" icon="pi pi-plus" />
						</router-link>
					</div>
				</div>
			</template>
			<template #empty>
				<h3 v-if="!orgId">{{ selectOrgMsgInfo }}</h3>
				No revenues found.
			</template>
			<template #loading>
				<div class="flex align-content-center justify-content-center flex-column">
					<Image :src="loadingImg" alt="Loader" width="160" />
					<h3 class="text-center">Loading ...</h3>
				</div>
			</template>

			<Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" sortable filter :filterMatchModeOptions="setFilterMatchModes(col.field)">
				<template #filter="{ filterModel, filterCallback }">
					<Calendar v-if="col.field === 'created_at'" v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" mask="99/99/9999" />
					<InputText v-else v-model="filterModel.value" type="text" @keydown.enter="filterCallback()" class="p-column-filter" />
				</template>
				<template #filterclear="{ filterCallback }">
					<Button type="button" @click="() => { filterCallback(); onFilterClear(col.field); }" label="Clear" outlined class="clear-btn" />
				</template>
				<template #filterapply="{ filterCallback }">
                    <Button type="button" @click="filterCallback()" label="Apply" severity="success" class="clear-btn" />
                </template>

				<template #body="{ data, field }">
					<span v-if="field === 'descriptive_name'">
						<router-link :to="`/apps/${data.name}`" rel="noopener">
							{{ data[field] }}
						</router-link>
					</span>
					<span v-else-if="field === 'created_at'">{{ useFormatDate(data[field]) }}</span>
					<span v-else>{{ data[field] }}</span>
				</template>
			</Column>
			<Column class="org-settings__table__action">
				<template #body="{ data, field }">
					<router-link v-if="data.canUpdate" :to="`/apps/${data.name}/builder2`" rel="noopener">
						<Button icon="pi pi-pencil" severity="secondary" text rounded aria-label="Edit" />
					</router-link>
				</template>
			</Column>
		</DataTable>
	</Panel>
</template>

<script setup>
	import { ref, computed, onMounted, toRaw } from 'vue'
	import { useStore } from 'vuex'
	import { useFormatCurrency } from '@/composable/formatCurrency.js'
	import { useFormatDate } from '@/composable/formatDate.js'
	import { useFilterMatchModes } from '@/composable/filterMatchModes.js'
	import loadingImg from '@/assets/images/trivial-loading-optimized.webp'

	const store = useStore(),
		selectedContract = ref(),
		dropdownContracts = ref([
			{ name: 'All Contract' },
			{ name: 'Active' },
			{ name: 'Archived' }
		]),
		selectOrgMsgInfo = 'Please, select an organization.',
		columns = [
			{ field: 'descriptive_name', header: 'Customer' },
			{ field: 'created_at', header: 'Start Date' },
			{ field: 'errors', header: 'Errors' },
		],
		loading = ref(false),
		rows = ref(10),
		rowsPerPageOpt = [10, 20, 50],
		first = ref(1),
		totalRecords = ref(0),
		filters = ref({
			"created_at": {"operator": "and", "constraints": [{"value":null,"matchMode":"dateIs"}]},
			"descriptive_name": {"constraints": [{"value":null,"matchMode":"equals"}]}
		}),
		{ dateFilterMatchModes, textFilterMatchModes } = useFilterMatchModes(),
		globalFilterFields = ['descriptive_name', 'created_at']

	let contracts = ref([]),
		apps = [],
		appsPermissions = [],
		orgContracts = []

	const orgId = computed(() => store.getters.getOrgId)
	const currentUser = computed(() => store.getters.getUser)

	onMounted(async () => {
		await initContracts()
	})

	const initContracts = async () => {
		loading.value = true
		apps = await getApps()
		appsPermissions = await setAppPermits(apps)
		orgContracts = await getOrgContracts(appsPermissions)
		let x = await getAppActivity(orgContracts)

		console.log('x - ', x)
		totalRecords.value = totalPaginatorPages(contracts.value.length, rows.value)
		loading.value = false
	}

	const getApps = async () => {
		try {
			return await store.state.Session.apiCall('/apps')
		} catch (err) {
			console.log(err)
		}
	}

	const getOrgContracts = appsPerm => {
		return appsPerm.filter(item => item.owner_id === orgId.value && item.owner_type === 'Organization' && item.panels.component === 'Contract')
	}

	const setAppPermits = async apps => {
		let tempArr = [],
			appsPermissions

		try {
			appsPermissions = await store.state.Permissions.load()
		} catch (err) {
			console.log(err)
		}

		tempArr = apps.map(app => {
			if(appsPermissions?.update?.app_names.includes(app?.name)) {
				app.canUpdate = true
				return app
			}
		})

		return tempArr
	}

	const getAppActivity = apps => {
		let tempArr = [],
			stats = null

		tempArr = apps.map(async app => {
			try {
				stats = await store.state.Session.apiCall(`/activity_entries/stats?app_id=${app.name}`)

				app.stats = stats
				return app
			} catch (err) {
				console.log(err)
			}
		})

		console.log('tempArr stat - ', tempArr)
		return tempArr
	}

	const totalPaginatorPages = (totalItems, itemsPerPage) => totalItems / itemsPerPage
	const setFilterMatchModes = field => field === 'created_at' ? dateFilterMatchModes : textFilterMatchModes
	const onFilterClear = async field => {
		/*loading.value = true

		if (filters.value.hasOwnProperty(field)) {
			setDefaultFilters(field)
		}

		try {
			page = 1
			const queryString = updateQueryString()
			const { register_items } = await getRegistersData(queryString)
			registers.value = register_items
			// await getTotalAmount()
			loading.value = false
		} catch (err) {
			console.error(err)
		}

		loading.value = false*/
	}

	//const getContracts = async type => await store.state.Session.apiCall(`apps/stats/${type}`)

	//{"created_at":{"operator":"and","constraints":[{"value":null,"matchMode":"dateIs"}]},"descriptive_name":{"constraints":[{"value":null,"matchMode":"equals"}]}}
</script>