<template>
	<DataTable 
		v-model:filters="filters" 
		:value="registersItems" 
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
		resizableColumns
		class="border-round-sm registers_table"
		@page="onPage($event)"
		@sort="onSort($event)"
		@filter="onFilter($event)"
		editMode="cell" 
		@cell-edit-complete="onCellEditComplete" 
		:pt="{
				column: {
					bodycell: ({ state }) => ({ class: [{ 'pt-0 pb-0': state['d_editing'] }] }),
					columnFilter: ({ props }) => ({ class: [{ 'active__col--filter': toRaw(filters[props.field]) && toRaw(filters[props.field]).constraints[0].value }] })
				}

			}"
		>
		
	    <template #header>
	        <div class="flex justify-content-between py-5">
	        	<h2 class="m-0">Revenue Detail</h2>
	        	<!-- Global keyword search filed -->
	            <!--<IconField iconPosition="right">
	                <InputText v-model="defaultFilters['global'].value" placeholder="Keyword Search" />
					<InputIcon>
						<i class="pi pi-search" />
					</InputIcon>
	            </IconField>-->

	            <!-- <Button icon="pi pi-plus" class="add__row-btn" @click="addRow" title="Add Row" /> -->
	        </div>
	    </template>
	    <template #empty>No revenues found.</template>
	    <template #loading>
	    	<Image :src="loadingImg" alt="Loader" width="160" />
	    	<h3>Loading ...</h3>
	    </template>

        <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header" :filterField="col.field" sortable filter :filterMatchModeOptions="setFilterMatchModes(col.field)">
        	<template #filter="{ filterModel, filterCallback }" v-if="filters.hasOwnProperty(col.field)">
        		<Calendar v-if="col.field === 'originated_at'" v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" mask="99/99/9999" />
				<InputText v-else v-model="filterModel.value" type="text" @keydown.enter="filterCallback()" class="p-column-filter" />
			</template>
			<template #filterclear="{ filterCallback }">
				<Button type="button" @click="() => { filterCallback(); onFilterClear(col.field); }" label="Clear" outlined class="clear-btn" />
			</template>
			<template #editor="{ data, field }">
				<InputText v-model="data[field]" autofocus />
			</template>
			<template #body="{ data }">
				<div class="flex align-items-center" :class="{ 'numeric__col justify-content-end': useIsNumeric(data[col.field]) }" v-tooltip="{ content: `${data[col.field]}`, disabled: isDisabledTooltip(data[col.field]) }">
					<span v-if="col.field == 'originated_at'">
						<div class="date">{{ useFormatDate(data.originated_at, dateOptions) }}</div>
						<div class="time">{{ useFormatDate(data.originated_at, timeOptions) }} {{ useFormatDate(data.originated_at, timeZoneOptions).split(' ')[1] }}</div>
					</span>
					<span v-else-if="col.field == 'amount'">{{ Format.money(data[col.field], 2, data['units']) }}</span>
					<span v-else>{{ data[col.field] }}</span>
				</div>
			</template>
        </Column>

        <template #footer>
			<div class="flex justify-content-start footer__col">
				<div v-for="(col, index) of columns" :key="index">
					<div v-if="index == 0">
						<h4 class="flex align-items-center m-0">
							Totals
							<Button type="button" icon="pi pi-info-circle" severity="secondary" size="small" text rounded outlined aria-label="Info" @click="toggleTotalInfoPopup" class="info__btn ml-2 p-0" />
							<OverlayPanel ref="totalInfoPopup">
								<p class="m-0">Total includes results from all pages, including those not displayed.</p>
							</OverlayPanel>
						</h4>
					</div>
					<span v-else-if="col.field === totalsColumns[col.field]">{{ totalAmount }}</span>
				</div>
			</div>
        </template>
    </DataTable>
</template>

<script setup>
	import { ref, onMounted, computed, watch, toRaw } from 'vue'
	import { useStore } from 'vuex'
	import { useToast } from 'primevue/usetoast'
	import Format from '@/lib/Format'
	import { useFormatDate } from '@/composable/formatDate.js'
	import { useIsNumeric } from '@/composable/isNumeric.js'
	import { useDateTimeZoneOptions } from '@/composable/dateTimeZoneOptions.js'
	import { useFilterMatchModes } from '@/composable/filterMatchModes.js'
	import loadingImg from '@/assets/images/trivial-loading-optimized.webp'

	const loading = ref(false),
			filters = ref({}),
			registers = ref([]),
			totalAmount = ref(null),
			rows = ref(10), // per_page
			totalRecords = ref(0),
			first = ref(1),
			totalInfoPopup = ref(),
			sortField = ref(null),
			sortOrder = ref(null),
			rowsPerPageOpt = [10, 20, 50],
			{dateOptions, timeOptions, timeZoneOptions} = useDateTimeZoneOptions(),
			{
				dateFilterMatchModes,
				numericFilterMatchModes,
				textFilterMatchModes,
				filterMatchModeMapping,
				defaultFilters,
				defaultMatchMode,
				defaultDateMatchMode,
				globalFilterFields
			} = useFilterMatchModes(),
			toast = useToast(),
			store = useStore()

	let columns = [],
		defaultColumns = [
			{field: 'originated_at', header: 'Date'},
			{field: 'description', header: 'Description'},
			{field: 'unique_key', header: 'Unique Key'},
			{field: 'amount', header: 'Amount'}
		],
		totalsColumns = { amount: 'amount' },
		allRegisters = null,
		regId = null,
		filterDate = { end_at: null, start_at: null },
		page = 1 // Default start page is from first

	const orgId = computed(() => store.getters.getOrgId)
	const registersItems = computed(() => registers.value)
	watch(orgId, async (newVal, oldVal) => await getRegisters(newVal))

	onMounted(async () => {
		if (orgId.value) {
			await getRegisters(orgId.value)
		}
	})

	const setCSSCustomProp = () => document.documentElement.style.setProperty('--cols', columns.length - 1)
	const totalPaginatorPages = (totalPages, itemsPerPage) => totalPages * itemsPerPage
	const setColumns = () => columns = [...defaultColumns] // Add fixed columns at the beginig of the table
	const setFilters = () => filters.value = defaultFilters
	const resetColumns = () => columns = [] // Reset columns before new set of columns from API call
	const resetFilters = () => filters.value = {} // Reset filters before new set of dynamic filters
	const resetDateFilter = () => filterDate = {end_at: null, start_at: null}
	const resetRegisters = () => registers.value = []
	const resetTotlaAmount = () => totalAmount.value = null
	const isDisabledTooltip = data => data?.length < 14
	const toggleTotalInfoPopup = event => totalInfoPopup.value.toggle(event)
	const setFilterMatchModes = field => field === 'amount' ? numericFilterMatchModes : field === 'originated_at' ? dateFilterMatchModes : textFilterMatchModes
	
	const addRow = () => {
		let emptyRowObj = { 'originated_at': new Date() }
		columns.forEach(item => emptyRowObj[item.field] = '')
		registers.value.unshift(emptyRowObj) 
	}

	const getRegisters = async orgId => {
		loading.value = true
		resetColumns()
		resetFilters()

		try {
			setColumns()
			setFilters()

			allRegisters = await store.state.Session.apiCall('/registers')
			let register = allRegisters.find(r => r.owner_type === 'Organization' && r.owner_id === orgId && r.name === 'Sales')

			// If regiester don't exists or don't have sales data for table
			if (!register) {
				resetColumns()
				resetFilters()
				resetRegisters()
				resetTotlaAmount()
				loading.value = false
				return
			}

			regId = register.id
			setMetaColumns(register.meta)
			setCSSCustomProp()
			getSearchableCols()

			let queryString = updateQueryString()
			const { register_items, total_pages } = await getRegistersData(queryString)
			registers.value = register_items
			totalRecords.value = totalPaginatorPages(total_pages, rows.value)

			await getTotalAmount()
		} catch (err) {
			console.log(err)
			toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data', life: 3000 });
		}

		loading.value = false
	}

	const getRegistersData = async queryString => {
		try {
			return await store.state.Session.apiCall(`/register_items?register_id=${regId}&${queryString}`);
		} catch (err) {
			toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data', life: 3000 });
			console.error(err);
		}
	}


	// Alternative way to update total amount col
	/*const setTotalAmount = searchProp => {
		let total = null

		registers.value.forEach(item => total += parseInt(item[searchProp]))

		return Format.money(total)
	}*/

	const getTotalAmount = async () => {
		let end_at = filterDate.end_at || new Date().setYear('2100'),
			start_at = filterDate.start_at || new Date().setYear('2000'),
			total = null

		total = await store.state.Session.apiCall('/reports/item_sum', 'POST', { register_ids: regId, start_at: new Date(start_at).toISOString(), end_at: new Date(end_at).toISOString() })

		totalAmount.value = Format.money(total.count)

		resetDateFilter()
	}

	// For date field filter
	/*const getDateFilter = (date = {}) => {
		if (date?.matchMode === 'dateAfter') {
			filterDate.start_at = date.value
		} else if (date?.matchMode === 'dateBefore') {
			filterDate.end_at = date.value
		}
	}*/

	const getSearchableCols = async () => {
		// Get Searchable Columns
		let searchableColumns = await store.state.Session.apiCall(`/register_items/columns?register_id=${regId}`)

		// Settign filters dynamic fileds for search options
		searchableColumns.forEach(item => {
			globalFilterFields.push(item) // Search dynamic fields
			
			let matchMode = item !== 'originated_at' ? defaultMatchMode : defaultDateMatchMode;
			filters.value[item] = { constraints: [{ value: null, matchMode }] }
		})
	}

	// Setting dynamic table columns headers - (register.meta)
	const setMetaColumns = metaCols => {
		for (let property in metaCols) {
			columns.push({field: metaCols[property], header: metaCols[property].replaceAll('_', ' ')})
		}
	}

	const onPage = async event => {
		loading.value = true

		first.value = event?.first || 0
		rows.value = event?.rows || 10
		page = event?.page + 1

		try {
			const queryString = updateQueryString()
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

		sortField.value = event.sortField
		sortOrder.value = event?.sortOrder === 1 ? 'ASC' : 'DESC'

		try {
			const queryString = updateQueryString()
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
		filters.value = event.filters

		try {
			const queryString = updateQueryString()

			// Get registers data
			const { register_items, total_pages, current_page } = await getRegistersData(queryString)
			
			// Set paggination
			totalRecords.value = totalPaginatorPages(total_pages, rows.value)

			// Set table registers value
			registers.value = register_items
			
			//await getTotalAmount()
		} catch (err) {
			loading.value = false
			console.log(err)
		}

		loading.value = false
	}

	const onFilterClear = async field => {
		if (filters.value.hasOwnProperty(field)) {
			filters.value[field].constraints = [{ value: null, matchMode: defaultMatchMode }]
		}

		try {
			page = 1
			const queryString = updateQueryString()
			const { register_items } = await getRegistersData(queryString)
			registers.value = register_items
			// await getTotalAmount()
		} catch (err) {
			console.error(err)
		}
	}

	const onCellEditComplete = async event => {
		let bodyObj = {}

		const { newData, field, data, newValue } = event
		
		bodyObj[field] = newValue

		const rowIndex = registers.value.findIndex(item => item.id === data.id)

		try {
			if (event.type === 'enter') {
				// Update value in the DB
				await store.state.Session.apiCall(`/register_items/${newData.id}`, 'PUT', bodyObj)

				// Update value on the table (in memory)				
				if (rowIndex !== -1) {
					registers.value[rowIndex][field] = newData[field]
				}

				toast.add({ severity: 'success', summary: 'Success', detail: 'Table cell updated.', life: 3000 })
				return
			}

			toast.add({ severity: 'info', summary: 'Info', detail: 'To save data, please hit enter.', life: 3000 })

		} catch (err) {
			toast.add({ severity: 'error', summary: 'Error', detail: 'There was an error.', life: 3000 })
			console.log(err)
		}
	}

	const updateQueryString = () => {
		let queryString = `per_page=${rows.value}&page=${page}`

		if (sortField.value) {
			queryString += `&order_by=${sortField.value}&ordering_direction=${sortOrder.value}`
		}

		const filtersArray = []

		for (let key in filters.value) {
			const filter = filters.value[key]

			if (filter.constraints && filter.constraints.length > 0) {
				filter.constraints.forEach(constraint => {
				
					if (constraint.value) {
						filtersArray.push({
							c: key,
							o: filterMatchModeMapping[constraint.matchMode],
							p: constraint.value
						})
					}
				})
			}
		}

		if (filtersArray.length > 0) {
			queryString += `&search=${encodeURIComponent(JSON.stringify(filtersArray))}`
		}

		return queryString
	}
</script>
