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
				No contracts found.
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
					<span v-else-if="field === 'stats'">
						<!--<ConfirmPopup group="templating" :pt="{ message: { class: 'bg-white' }, footer: { class: 'd-none' }}">
							<template #message="slotProps">
								<div class="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border p-3 mb-3 pb-0">
									<p>Hello World</p>
								</div>
							</template>
						</ConfirmPopup>
						<Button @click="showTemplate($event)" text icon="pi-chart-bar" />-->

						<!--<div class="popup__container">
							<i class="pi pi-chart-bar" />

							<div class="popup">
								<p>Lorem Ipsum</p>
							</div> 
						</div>-->

						<Button type="button" link size="large" text aria-label="Chart Info" @click="toggleActivityPopup" class="p-2">
							<div v-for="(item, index) in data.stats" :key="index"></div>
							<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="20" width="26" class="chart">
									<g class="bar" :class="{ 'error-fill': false, 'success-fill': true }" transform="translate(0,0)">
										<rect height="10" y="10" width="2"></rect>
									</g>
									<g class="bar" :class="{ 'error-fill': true, 'success-fill': false }" transform="translate(3,0)">
										<rect height="6" y="14" width="2"></rect>
									</g>
									<g class="bar" :class="{ 'error-fill': false, 'success-fill': true }" transform="translate(6,0)">
										<rect height="20" y="4" width="2"></rect>
									</g>
									<g class="bar" :class="{ 'error-fill': false, 'success-fill': true }"transform="translate(9,0)">
										<rect height="10" y="10" width="2"></rect>
									</g>
									<g class="bar" :class="{ 'error-fill': false, 'success-fill': true }" transform="translate(12,0)">
										<rect height="9" y="11" width="2"></rect>
									</g>
									<g class="bar" :class="{ 'error-fill': false, 'success-fill': true }" transform="translate(15,0)">
										<rect height="10" y="10" width="2"></rect>
									</g>
									<g class="bar" :class="{ 'error-fill': true, 'success-fill': false }" transform="translate(18,0)">
										<rect height="17" y="6" width="2"></rect>
									</g>

									<!--<g v-for="(item, index) in data.stats" :key="index" class="bar mr-1" :class="{ 'error-fill': item.hasErros, 'success-fill': !item.hasErros }" :transform="`translate(${20 - item.errorsCount}, 0)`">
										<rect :height="item.errorsCount" width="2" :y="20 - item.errorsCount" :x="index * 4" />
									</g>-->
							</svg>
						</Button>
						<OverlayPanel ref="activityPopup">
							<div class="flex flex-column justify-content-start align-items-center w-10rem h-8rem">
								<p class="w-full mt-1 mb-2 text-base text-500">Last {{ activityPeriod(data.stats) }} days</p>
								<p class="w-full m-1">
									<i class="pi mr-2" :class="{ 'pi-times-circle text-red-600': true, 'pi-check-circle text-primary-500': false }" /> 
									<span class="text-lg font-semibold" :class="{ 'text-red-600': true, 'text-primary-500': false }">30 Erros</span>
								</p>

								<Divider />
								<router-link :to="`/apps/${data.name}/activity?search=${activityQueryStrEncoded}`" rel="noopener" class="w-full flex justify-content-start align-items-center">
									<Button label="View Activity" icon="pi pi-external-link" iconPos="right" link class="p-1 text-md font-medium text-blue-500" />
								</router-link>
							</div>
						</OverlayPanel>
					</span>
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
	import { ref, computed, watch, onMounted, toRaw } from 'vue'
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
			{ field: 'stats', header: 'Errors' },
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
		globalFilterFields = ['descriptive_name', 'created_at'],
		activityPopup = ref(),
		activityQueryStr = "[{'c':'status','o':'=','p':'500'}]",
		activityQueryStrEncoded = encodeURIComponent(JSON.stringify(JSON.parse(activityQueryStr.replace(/'/g, '"'))))

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
		contracts.value = await getAppActivity(orgContracts)
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
			appsPermissions = null

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
		apps.forEach(async app => {
			try {
				app.stats = await store.state.Session.apiCall(`/activity_entries/stats?app_id=${app.name}`)

				app.stats.forEach(item => {
					item.hasErrors = Object.keys(item.count).length ? true : false
					item.errorsCount = randomIntFromInterval(1, 20) // get errors from Object.keys(item.count).length
				})
			} catch (err) {
				console.log(err)
			}
		})

		return apps
	}

	const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
	const activityPeriod = item => item.length
	const toggleActivityPopup = event => activityPopup.value[0].toggle(event)
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
