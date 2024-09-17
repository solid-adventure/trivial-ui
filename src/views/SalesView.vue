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
		@page="onPage"
		@sort="onSort"
		@filter="onFilter"
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

	        	<Button label="Export as CSV" aria-label="Download CSV" icon="pi pi-download" class="registers_table--csv-btn" @click="exportCSV" />

	        	<!-- Global keyword search filed -->
	            <!--<IconField iconPosition="right">
	                <InputText v-model="defaultFilters['global'].value" placeholder="Keyword Search" />
					<InputIcon>
						<i class="pi pi-search" />
					</InputIcon>
	            </IconField>-->
	        </div>
	    </template>
		<template #empty>
			<h3 v-if="!orgId">{{ selectOrgMsgInfo }}</h3>
			No revenues found.
		</template>
		<template #loading>
			<Image :src="loadingImg" alt="Loader" width="160" />
			<h3>Loading ...</h3>
		</template>

        <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" :filterField="col.field" sortable filter :filterMatchModeOptions="setFilterMatchModes(col.field)">
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
					<span v-else-if="col.field == 'amount'">{{ useFormatCurrency(data[col.field], 2, data['units']) }}</span>
					<span v-else>{{ data[col.field] }}</span>
				</div>
			</template>
		</Column>

		<ColumnGroup type="footer">
			<Row>
				<template v-for="(col, index) in columns" :key="index">
					<Column v-if="index == 0">
						<template #footer>
							<div class="flex align-items-center footer__col">
								<h4 class="m-0">Totals</h4>
								<Button type="button" icon="pi pi-info-circle" severity="secondary" size="small" text rounded outlined aria-label="Info" @click="toggleTotalInfoPopup" class="info__btn ml-2 p-0" />
								<OverlayPanel ref="totalInfoPopup">
									<p class="m-0">Total includes results from all pages, including those not displayed.</p>
								</OverlayPanel>
							</div>
						</template>
					</Column>
					<Column v-else-if="col.field === totalsColumns[col.field]" :footer="totalAmount" footerStyle="text-align:right" />
					<Column v-else />
				</template>
			</Row>
		</ColumnGroup>
	</DataTable>

	<Dialog v-model:visible="csvDialogVisible" modal :closable="false" class="csv__dialog">
		<div class="flex align-items-center justify-content-between gap-3 mb-3">
			<template v-if="(streamPending || streamOpen) && !cancelCSV"> <!-- streamPending || streamOpen-->
				<h3 class="m-0 text-lg font-normal">Generating CSV...</h3>
				<span class="text-lg font-normal text-600">{{ streamProgress }}%</span>
			</template>

			<template v-if="cancelCSV">
				<h3 class="m-0 text-lg font-normal">Cancel Export</h3>
			</template>

			<template v-if="streamFailed">
				<h3 class="m-0 text-lg font-normal">Failed to Generate CSV</h3>
			</template>
		</div>
		<div v-if="(streamPending || streamOpen) && !cancelCSV" class="flex align-items-center justify-content-center mb-2"> <!-- streamPending || streamOpen-->
			<ProgressBar :value="streamProgress" aria-label="CSV Progress Download Status" class="w-full h-1rem csv__dialog--progersbar" />
		</div>

		<div class="flex align-items-center mb-4 text-sm text-600">
			<template v-if="streamPending">
				<p class="m-0">Preparing your download now...</p>
			</template>

			<template v-if="streamOpen && !cancelCSV"> <!--streamOpen -->
				<p class="w-full m-0 text-right">Generated <span class="csv__dialog--streamed-lines">{{ streamedLines }}</span> out of {{ streamedLinesTotal }} rows</p>
			</template>

			<template v-if="cancelCSV">
				<p class="m-0">Are you sure you want to cancel the export?</p>
			</template>

			<template v-if="streamFailed">
				<p class="m-0 text-base text-red-500">Error: {{ streamErrorMessage }}!</p>
			</template>
		</div>

		<div class="flex align-items-center justify-content-between gap-1">
			<template v-if="(streamPending || streamOpen) && !cancelCSV"> <!-- streamPending || streamOpen-->
				<p class="text-xs text-600">
					<i class="pi pi-exclamation-triangle text-600" />
					This might take some time. Closing this page will cancel the download.
				</p>
				<Button type="button" label="Cancel" text class="csv__dialog--cancel-btn" @click="csvExportShow()" />
			</template>

			<template v-if="cancelCSV">
				<Button type="button" label="Stop Export" text class="csv__dialog--cancel-btn" @click="cancelStream()" />
				<Button type="button" label="Keep the Export Running" class="csv__dialog--btn" @click="csvExportHide()" />
			</template>

			<template v-if="streamFailed">
				<Button type="button" label="OK" class="csv__dialog--btn" @click="resetStreamInfo(), closeCSVDialog()" />
			</template>
		</div>

		<div v-if="streamClosed" class="flex flex-column align-items-center justify-content-center gap-2">
			<Icon icon="fa6-solid:circle-check" class="w-3rem h-3rem text-primary" />
			<h3 class="m-0 text-lg font-normal font-semibold">Success</h3>

			<p class="flex align-items-center text-sm text-600 gap-1">
				<i class="pi pi-check-circle text-green-500" />
				CSV Export completed.
			</p>

			<Button type="button" label="OK" class="csv__dialog--btn" @click="resetStreamInfo(), closeCSVDialog()" />
		</div>
	</Dialog>
</template>

<script setup>
	import { ref, onMounted, computed, watch, toRaw } from 'vue'
	import moment from 'moment-timezone'
	import { useStore } from 'vuex'
	import { useFormatCurrency } from '@/composable/formatCurrency.js'
	import { useFormatDate } from '@/composable/formatDate.js'
	import { useIsNumeric } from '@/composable/isNumeric.js'
	import { useDateTimeZoneOptions } from '@/composable/dateTimeZoneOptions.js'
	import { useFilterMatchModes } from '@/composable/filterMatchModes.js'
	import loadingImg from '@/assets/images/trivial-loading-optimized.webp'
	import { useToastNotifications } from '@/composable/toastNotification'
	import { Icon } from '@iconify/vue'

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
			globalFilterFields
		} = useFilterMatchModes(),
		{ showSuccessToast, showErrorToast, showInfoToast } = useToastNotifications(),
		store = useStore(),
		registersNames = ['Sales', 'Income Account'],
		selectOrgMsgInfo = 'Please, select an organization.',
        timezone = timeZoneOptions.timeZone,
		streamErrorMessage = ref(''),
		cancelCSV = ref(false),
		csvDialogVisible = ref(false)

	let columns = [],
		defaultColumns = [
			{field: 'originated_at', header: 'Date'},
			{field: 'description', header: 'Description'},
			{field: 'unique_key', header: 'Unique Key'},
			{field: 'amount', header: 'Amount'}
		],
		totalsColumns = { amount: 'amount' },
		allRegisters = null,
		filterDate = { end_at: null, start_at: null },
		page = 1, // Default start page is from first,
		storageOrgId = parseInt(localStorage.getItem('orgId')) || null

	const orgId = computed(() => store.getters.getOrgId)
	const queryString = computed(() => updateQueryString())
	const regId = computed(() => store.getters.getRegisterId)
	const register = computed(() => store.getters.getRegister)
	const registersItems = computed(() => registers.value)
	const streamStatus = computed(() => store.getters.getStreamStatus)
	const streamProgress = computed(() => parseInt(Math.floor((streamedLines.value / streamedLinesTotal.value) * 100)))
	const streamedLines = computed(() => store.getters.getStreamedLines)
	const streamedLinesTotal = computed(() => store.getters.getStreamedLinesTotal)
	const streamPending = computed(() => streamStatus.value === 'pending')
	const streamOpen = computed(() => streamStatus.value === 'open')
	const streamClosed = computed(() => streamStatus.value === 'closed')
	const streamFailed = computed(() => streamStatus.value === 'failed')
	//const csvDialogVisible = computed(() => streamPending.value || streamOpen.value || streamFailed.value)

	watch(orgId, async (newVal, oldVal) => {
		if (!newVal) {
			resetColumns()
			resetFilters()
			resetRegisters()
			return
		}
		await getRegisters(newVal)
	})

	onMounted(async () => {
		let organizationId = storageOrgId || orgId.value

		if (organizationId) {
			await getRegisters(orgId.value)
		}

		if (localStorage.getItem('orgId') === 'null') {
			showInfoToast('Info', selectOrgMsgInfo, 3000)
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
	const resetTotalAmount = () => totalAmount.value = null
	const isDisabledTooltip = data => data?.length < 14
	const toggleTotalInfoPopup = event => totalInfoPopup.value[0].toggle(event)
	const setFilterMatchModes = field => field === 'amount' ? numericFilterMatchModes : field === 'originated_at' ? dateFilterMatchModes : textFilterMatchModes
	//const dateToISOString = date => new Date(date).toISOString()
	//const dateSetFullYear = date => new Date().setFullYear(date)
	const cancelStream = () => { 
		store.commit('setStreamStatus', 'cancelling')
		csvExportHide()
		closeCSVDialog()
	}
	const resetStreamInfo = () => store.dispatch('resetStreamInfo')
	const csvExportShow = () => cancelCSV.value = true
	const csvExportHide = () => cancelCSV.value = false
	const openCSVDialog = () => csvDialogVisible.value = true
	const closeCSVDialog = () => csvDialogVisible.value = false

	const getRegisters = async orgId => {
		loading.value = true
		resetColumns()
		resetFilters()

		try {
			setColumns()
			setFilters()

			// If regiester don't exists or don't have sales data for table
			if (!register.value) {
				resetColumns()
				resetFilters()
				resetRegisters()
				resetTotalAmount()
				loading.value = false
				return
			}

			//regId = register.id
			setMetaColumns(register.value.meta)
			setCSSCustomProp()
			await getSearchableCols()

			const { register_items, total_pages } = await getRegistersData()
			registers.value = register_items
			totalRecords.value = totalPaginatorPages(total_pages, rows.value)

			await getTotalAmount()
		} catch (err) {
			console.log(err)
			showErrorToast('Error', 'Failed to fetch data.')
		}

		loading.value = false
	}

	const getRegistersData = async () => {
		try {
			return await store.state.Session.apiCall(
				`/register_items?register_id=${regId.value}&${queryString.value}`
			)
		} catch (err) {
			showErrorToast('Error', 'Failed to fetch data.')
			console.error(err);
		}
	}

	const getTotalAmount = async () => {
		let col = 'amount'
		let total = await store.state.Session.apiCall(
			`/register_items/sum?register_id=${regId.value}&col=${col}&${queryString.value}`
		)
		totalAmount.value = useFormatCurrency(total.sum, 2, 'USD')
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
		let searchableColumns = await store.state.Session.apiCall(`/register_items/columns?register_id=${regId.value}`)

		// Settign filters dynamic fileds for search options
		searchableColumns.forEach(item => {
			globalFilterFields.push(item) // Search dynamic fields
			setDefaultFilters(item)
		})
	}

	// Setting dynamic table columns headers - (register.meta)
	const setMetaColumns = metaCols => {
		for (let property in metaCols) {
			columns.push({field: metaCols[property], header: metaCols[property].replaceAll('_', ' ')})
		}
	}

	const setDefaultFilters = field => {
		if (field !== 'originated_at') {
			filters.value[field] = { constraints: [{ value: null, matchMode: defaultMatchMode }] }
		} else {
			filters.value[field] = defaultFilters.originated_at
		}
	}

	const onPage = async event => {
		loading.value = true

		first.value = event?.first || 0
		rows.value = event?.rows || 10
		page = event?.page + 1

		try {
			const { register_items } = await getRegistersData()
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
			const { register_items } = await getRegistersData()
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
			// Get registers data
			const { register_items, total_pages, current_page } = await getRegistersData()
			
			// Set paggination
			totalRecords.value = totalPaginatorPages(total_pages, rows.value)

			// Set table registers value
			registers.value = register_items
			
			await getTotalAmount()
		} catch (err) {
			loading.value = false
			console.log(err)
		}

		loading.value = false
	}

	const onFilterClear = async field => {
		loading.value = true

		if (filters.value.hasOwnProperty(field)) {
			setDefaultFilters(field)
		}

		try {
			page = 1
			const { register_items } = await getRegistersData()
			registers.value = register_items
			await getTotalAmount()
			loading.value = false
		} catch (err) {
			console.error(err)
		}

		loading.value = false
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

				showSuccessToast('Success', 'Table cell updated.')
				return
			}

			showInfoToast('Info', 'To save data, please hit enter.')

		} catch (err) {
			showErrorToast('Error', 'There was an error.')
			console.log(err)
		}
	}

	const updateQueryString = () => {
		let query = `per_page=${rows.value}&page=${page}`

		if (sortField.value) {
			query += `&order_by=${sortField.value}&ordering_direction=${sortOrder.value}`
		}

		const filtersArray = []
		Object.entries(filters.value).forEach(([column, filter]) => {
			filter.constraints?.forEach(constraint => {
				let value = constraint.value
				if (value) {
					if (column === 'originated_at' && filterMatchModeMapping[constraint.matchMode] === '=') {
						let selectedDate = {
							c: column,
							o: filterMatchModeMapping.gte, // ">=", 
							p: moment(value).tz(timezone).startOf('day').utc().format() // midnight on the specified date
						},
						tomorrowDate = {
							c: column,
							o: filterMatchModeMapping.lt, // "<",
							p: moment(value).tz(timezone).add({ days: 1 }).startOf('day').utc().format() // midnight on the next day
						}

						filtersArray.push(selectedDate, tomorrowDate)
					} else {
						filtersArray.push({
							c: column,
							o: filterMatchModeMapping[constraint.matchMode],
							p: value
						})
					}
				}
			})
		})

		if (filtersArray.length > 0) {
			query += `&search=${encodeURIComponent(JSON.stringify(filtersArray))}`
		}

		return query
	}

	const exportCSV = async () => {
		openCSVDialog()
		store.commit('setStreamStatus', 'pending')

		try {
			let csvData = await store.state.Session.apiCall(
				`/register_items.csv?register_id=${regId.value}&${queryString.value}`,
				'GET',
				undefined,
				'csv',
				true
			)

			if (csvData) {
				forceFileDownload(csvData, register.value.name)
			}

			resetStreamInfo()
		} catch (err) {
			console.log(err)
			streamErrorMessage.value = err.message
			store.commit('setStreamStatus', 'failed')
		}
	}

	const forceFileDownload = (response, title) => {
		const url = window.URL.createObjectURL(
			new Blob([response]),
			{type: 'text/csv;charset=utf-8'}
		),
		link = document.createElement('a')

		link.href = url
		link.setAttribute('download', `${title}.csv`)
		document.body.appendChild(link)
		link.click()
	}
</script>
