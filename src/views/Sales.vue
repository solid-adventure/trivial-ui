<template>
	<DataTable 
		v-model:filters="filters" 
		:value="registersComp" 
		:loading="loading" 
		:globalFilterFields="globalFilterFields" 
		:rows="rows" 
		:rowsPerPageOptions="rowsPerPageOpt"
		:first="first"
		:totalRecords="totalRecords"
		paginator
		lazy
		tableStyle="max-width: 100%" 
		dataKey="id"
		filterDisplay="menu"
		scrollable
		class="border-round-sm registers_table"
		@page="onPage($event)"
		@sort="onSort($event)"
		@filter="onFilter($event)"
		editMode="cell" 
		@cell-edit-complete="onCellEditComplete" 
		:pt="{
			column: {
				bodycell: ({ state }) => ({ class: [{ 'pt-0 pb-0': state['d_editing'] }] })
			}
		}"
		>
		
	    <template #header>
	        <div class="flex justify-content-between py-5">
	        	<h2 class="m-0">Revenue Detail</h2>
	        	<!-- Global keyword search filed -->
	            <!--<IconField iconPosition="right">
	                <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
					<InputIcon>
						<i class="pi pi-search" />
					</InputIcon>
	            </IconField>-->
	        </div>
	    </template>
	    <template #empty>No revenues found.</template>
	    <template #loading>
	    	<Image :src="loadingImg" alt="Loader" width="160" />
	    	<h3>Loading ...</h3>
	    </template>

		<Column header="Date" filterField="date" dataType="date" key="date" :filterMatchModeOptions="dateFilterMatchModes">
			<template #body="{ data }">
				<div class="date">{{ useFormatDate(data.created_at, dateOptions) }}</div>
				<div class="time">{{ useFormatDate(data.created_at, timeOptions) }} {{ useFormatDate(data.created_at, timeZoneOptions).split(' ')[1] }}</div>
			</template>
			<!--<template #filter="{ filterModel, filterCallback }">
				<Calendar v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" mask="99/99/9999" @blur=" getDateFilter(filterModel)" />
			</template>
			<template #filterclear="{ filterCallback }">
				<Button type="button" @click="() => { filterCallback(); getTotalAmountCol()}" label="Clear" outlined class="clear-btn" />
			</template>
			<template #filterapply="{ filterCallback }">
				<Button type="button" @click="filterCallback(), getTotalAmountCol()" label="Apply" class="apply-btn" />
			</template>-->
		</Column>

        <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header" :filterField="col.field" sortable filter :filterMatchModeOptions="filterMatchModesOpt">
        	<template #filter="{ filterModel, filterCallback }" v-if="filters.hasOwnProperty(col.field)">
				<InputText v-model="filterModel.value" type="text" @keydown.enter="filterCallback()" class="p-column-filter" />
			</template>
			<template #filterclear="{ filterCallback }">
				<Button type="button" @click="() => { filterCallback(); onFilterClear(col.field); }" label="Clear" outlined class="clear-btn" />
			</template>
			<template #editor="{ data, field }">
				<InputText v-model="data[field]" autofocus />
			</template>
			<template #body="{ data }">
				<div class="flex align-items-center" v-tooltip="{ content: `${data[col.field]}`, disabled: isDisabledTooltip(data[col.field]) }">
					<span v-if="col.field == 'amount'">{{ Format.money(data[col.field], 2, data['units']) }}</span>
					<span v-else>{{ data[col.field] }}</span>
				</div>
			</template>
        </Column>

        <template #footer>
			<div class="flex justify-content-start footer__col">
				<div>
					<h4 class="flex align-items-center m-0">
						Totals
						<Button type="button" icon="pi pi-info-circle" severity="secondary" size="small" text rounded outlined aria-label="Info" @click="toggleTotalInfoPopup" class="info__btn ml-2 p-0" />
						<OverlayPanel ref="totalInfoPopup">
							<p class="m-0">Total includes results from all pages, including those not displayed.</p>
						</OverlayPanel>
					</h4>
				</div>
				<div v-for="(col, index) of columns" :key="index">
					<span v-if="col.field === totalsColumns[col.field]">{{ totalAmount }}</span>
				</div>
			</div>
        </template>
    </DataTable>
</template>

<script setup>
	import { FilterMatchMode, FilterOperator } from 'primevue/api'
	import { ref, onMounted, computed, watch, toRaw } from 'vue'
	import { useStore } from 'vuex'
	import { useToast } from 'primevue/usetoast'
	import Format from '@/lib/Format'
	import { useFormatDate } from '@/composable/formatDate.js'
	import loadingImg from '@/assets/images/trivial-loading.gif'

	const loading = ref(false),
			filters = ref({}),
			store = useStore(),
			registers = ref([]),
			totalAmount = ref(null),
			rows = ref(10), // per_page
			totalRecords = ref(0),
			first = ref(1),
			totalInfoPopup = ref(),
			rowsPerPageOpt = [10, 20, 50],
			dateOptions = {
				dateStyle: 'short',
				timeZone: 'America/New_York'
			},
			timeOptions = {
				timeStyle: 'short',
				timeZone: 'America/New_York',
				hourCycle: "h12"
			},
			timeZoneOptions = {
				timeZone: 'America/New_York',
				timeZoneName: 'short'
			},
			// Define custom match modes for the date field
			dateFilterMatchModes = [
				{ label: 'Date is', value: FilterMatchMode.DATE_IS },
				{ label: 'Date is before', value: FilterMatchMode.DATE_BEFORE },
				{ label: 'Date is after', value: FilterMatchMode.DATE_AFTER },
				{ label: 'Date is not', value: FilterMatchMode.DATE_IS_NOT },
			],
			// Define custom match modes for the date field
			filterMatchModesOpt = [
				{ label: 'Equals', value: FilterMatchMode.EQUALS },
				{ label: 'Not Equals', value: FilterMatchMode.NOT_EQUALS },
				{ label: 'Less Than Or Equal To', value: FilterMatchMode.LESS_THAN_OR_EQUAL_TO },
				{ label: 'Less Than', value: FilterMatchMode.LESS_THAN },
				{ label: 'Greater Than Or Equal To', value: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO },
				{ label: 'Greater Than', value: FilterMatchMode.GREATER_THAN }
			],
			// Mapping filter match modes to their corresponding textual or mathematical signs
			filterMatchModeMapping = {
				between: 'between',
				contains: 'contains',
				dateAfter: '>',
				dateBefore: '<',
				dateIs: '=',
				dateIsNot: '!=',
				endsWith: 'ends with',
				equals: '=',
				gt: '>',
				gte: '>=',
				in: 'in',
				lt: '<',
				lte: '<=',
				notContains: 'does not contain',
				notEquals: '!=',
				startsWith: 'starts with'
			},
			toast = useToast()

	let columns = [],
		fixedColumns = [
			{field: 'description', header: 'Description'},
			{field: 'originated_at', header: 'Originated'},
			{field: 'unique_key', header: 'Unique Key'},
			{field: 'amount', header: 'Amount'}
		],
		// Fiexed colums filters and constrains - implementation when API is finished
		/*fiexdFilters = {
			// global: { value: null, matchMode: FilterMatchMode.CONTAINS },
			// date: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
			// date: { constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
		},*/
		totalsColumns = { amount: 'amount' },
		globalFilterFields = [],
		allRegisters = null,
		localStorageOrgId = null,
		regId = null,
		filterDate = { end_at: null, start_at: null }

	const orgId = computed(() => store.getters.getOrgId)
	const registersComp = computed(() => registers.value)
	watch(orgId, async (newVal, oldVal) => await getRegisters(newVal))

	onMounted(async () => {
		orgId.value ? await getRegisters(orgId.value) : false
	})

	const getRegisters = async orgId => {
		loading.value = true
		columns = [] // Reset columns before new set of columns from API call
		filters.value = {} // Reset filters before new set of dynamic filters

		try {
			columns = [...fixedColumns] // Add fixed columns at the beginig of the table
			//filters.value = fiexdFilters

			allRegisters = await store.state.Session.apiCall('/registers')
			let register = allRegisters.find(r => r.owner_type == 'Organization' && r.owner_id == orgId && r.name == 'Sales')

			regId = register.id

			// Setting dynamic table columns headers
			for (let property in register.meta) {
				columns.push({field: register.meta[property], header: register.meta[property].replaceAll('_', ' ')})
			}

			setCssPropColsLength()

			// Get Searchable Columns
			let searchableColumns = await store.state.Session.apiCall(`/register_items/columns?register_id=${regId}`)

			// Settign filters dynamic fileds for search options
			searchableColumns.forEach(item => {
				globalFilterFields.push(item) // Search dynamic fields
				//filters.value[item] = filterDefaultMode
				filters.value[item] = { constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
			})

			// Get registers item - query string -> register_id=${registerId}&order_by=${orderBy}&ordering_direction=${orderingDirection}&per_page=${perPage}&page=${page}`
			
			let queryString = `per_page=${rows.value}`
			let { current_page, register_items, total_pages } = await getRegistersData(queryString)

			totalRecords.value = totalPaginatorPages(total_pages, rows.value)
			registers.value = register_items

			await getTotalAmountCol()

			loading.value = false
		} catch (err) {
			console.log(err)
			toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data', life: 3000 });
			loading.value = false
		}
	}

	const getRegistersData = async (query = '') => await store.state.Session.apiCall(`/register_items?register_id=${regId}&${query}`)
	const totalPaginatorPages = (totalPages, itemsPerPage) => totalPages * itemsPerPage

	const setTotalColValue = searchProp => {
		let total = null

		registers.value.forEach(item => total += parseInt(item[searchProp]))

		return Format.money(total)
	}

	const setCssPropColsLength = () => document.documentElement.style.setProperty('--cols', columns.length + 1)

	const getTotalAmountCol = async () => {
		let end_at = filterDate.end_at || new Date().setYear('2100'),
			start_at = filterDate.start_at || new Date().setYear('2000'),
			total = null

		total = await store.state.Session.apiCall('/reports/item_sum', 'POST', { register_ids: regId, start_at: new Date(start_at).toISOString(), end_at: new Date(end_at).toISOString() })

		totalAmount.value = Format.money(total.count)

		clearFilterDate()
	}

	const getDateFilter = (date = {}) => {
		if (date?.matchMode === 'dateAfter') {
			filterDate.start_at = date.value
		} else if (date?.matchMode === 'dateBefore') {
			filterDate.end_at = date.value
		}
	}

	const clearFilterDate = () => filterDate = {end_at: null, start_at: null}

	const isDisabledTooltip = data => data?.length < 14

	const toggleTotalInfoPopup = event => totalInfoPopup.value.toggle(event)

	const onPage = async event => {
		loading.value = true

		first.value = event?.first || 0
		rows.value = event?.rows || 10

		let page = event?.page + 1,
			queryString = `per_page=${rows.value}&page=${page}`
		
		try {
			const { register_items } = await getRegistersData(queryString)
			registers.value = register_items
		} catch (err) {
			loading.value = false
			console.log(err)
		}

		loading.value = false
	}

	const onSort = async event => {
		loading.value = true

		first.value = event?.first || 0
		rows.value = event?.rows || 10

		let orderingDirection = event?.sortOrder === 1 ? 'ASC' : 'DESC',
			queryString = `per_page=${rows.value}&order_by=${event?.sortField}&ordering_direction=${orderingDirection}`
		
		try {
			const { register_items } = await getRegistersData(queryString)
			registers.value = register_items
		} catch (err) {
			loading.value = false
			console.log(err)
		}

		loading.value = false
	}

	const onFilter = async event => {
		loading.value = true

		let selectedFilter = toRaw(event.filters),
			queryArr = [],
			queryString = ''

		for (let property in selectedFilter) {

			let dateConstraints = toRaw(selectedFilter[property].constraints)

			dateConstraints.forEach(item => {
				if (item.value) {
					queryArr.push({
						c: property, 
						o: filterMatchModeMapping[item.matchMode], 
						p: item.value 
					})
				}
			})
		}

		queryString = `search=${JSON.stringify(queryArr)}`

		try {
			const { register_items } = await getRegistersData(queryString)

			registers.value = register_items
		} catch (err) {
			loading.value = false
			console.log(err)
		}

		loading.value = false
	}

	const onFilterClear = field => {
		const rawFilters = toRaw(filters.value);

		// Reset the specific filter
		if (rawFilters.hasOwnProperty(field)) {
			const rawFiltersConstrains = toRaw(rawFilters[field].constraints)
			
			rawFiltersConstrains[0].value = null; // or reset as per your logic
			rawFiltersConstrains[0].matchMode = 'equals'; // default match mode

			rawFilters[field].constraints = { ...rawFiltersConstrains }
		}

		// Update the reactive filters object
		filters.value = { ...rawFilters }

		// Fetch original register data
		getRegisters()
	}

	const onCellEditComplete = async event => {
		console.log(event)
		let cellPayload =  {
				method: 'PUT',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({amount: event.newValue, description: event.field })
			}

		try {
			if (event.type === 'enter') {
				let rawNewCellData = toRaw(event.newData)
				// Update value in the DB
				await store.state.Session.apiCall(`/register_items/${rawNewCellData.id}`, 'PUT', cellPayload)

				// Update value on the table (in memory)
				toRaw(registers.value).find(item => {
					if (item.id === rawNewCellData.id) {
						item[event.field] = event.newValue
					}
				})

				toast.add({ severity: 'success', summary: 'Success', detail: 'Table cell updated!', life: 3000 })
				return
			}

			toast.add({ severity: 'info', summary: 'Info', detail: 'To save data, please hit enter', life: 3000 })

		} catch (err) {
			toast.add({ severity: 'error', summary: 'Error', detail: 'There was an error', life: 3000 })
			console.log(err)
		}
	}
</script>