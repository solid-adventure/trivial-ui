<template>
	<DataTable 
		v-model:filters="filters" 
		:value="registers" 
		:loading="loading" 
		:globalFilterFields="globalFilterFields" 
		:rows="rows" 
		:rowsPerPageOptions="rowsPerPageOpt"
		paginator
		tableStyle="min-width: 50rem" 
		dataKey="id"
		filterDisplay="menu"
		scrollable
		v-model:editingRows="editingRows"
		editMode="row"
		@row-edit-save="onRowEditSave"

		class="border-round-sm registers_table"
		>

	    <template #header>
	        <div class="flex justify-content-between py-5">
	        	<h2 class="m-0">Revenue Detail</h2>
	            <IconField iconPosition="right">
	                <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
					<InputIcon>
						<i class="pi pi-search" />
					</InputIcon>
	            </IconField>
	        </div>
	    </template>
	    <template #empty>No revenues found.</template>
	    <template #loading>
	    	<Image :src="loadingImg" alt="Loader" width="160" />
	    	<h3>Loading revenues data. Please wait.</h3>
	    </template>

		<Column header="Date" filterField="date" dataType="date" key="date">
			<template #body="{ data }">
				<div class="date">{{ useFormatDate(data.created_at, dateOptions) }}</div>
				<div class="time">{{ useFormatDate(data.created_at, timeOptions) }} {{ useFormatDate(data.created_at, timeZoneOptions).split(' ')[1] }}</div>
			</template>
			<template #filter="{ filterModel }">
				<Calendar v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" mask="99/99/9999" @blur=" getDateFilter(filterModel)" />
			</template>
			<template #filterclear="{ filterCallback }">
				<Button type="button" @click="filterCallback(), getTotalAmountCol()" label="Clear" outlined class="date__clear-btn" />
			</template>
			<template #filterapply="{ filterCallback }">
				<Button type="button" @click="filterCallback(), getTotalAmountCol()" label="Apply" class="date__apply-btn" />
			</template>
		</Column>

        <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header" sortable>
			<template #body="{ data }">
				<div class="flex align-items-center" v-tooltip="{ content: `${data[col.field]}`, disabled: isDisabledTooltip(data[col.field]) }">
					<span v-if="col.field == 'amount'">{{ Format.money(data[col.field], 2, data['units']) }}</span>
					<span v-else>{{ data[col.field] }}</span>
				</div>
			</template>
			<template #editor="{ data, field }" v-if = "col.canEdit">
            	<InputText class = "editInput" v-model="data[field]" />
            </template>
        </Column>

		<Column key = "edit" :rowEditor="true" bodyStyle="text-align:center"></Column>
		
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
					<!--<span v-if="col.field === totalsColumns[col.field]">{{ setTotalColValue(totalsColumns[col.field]) }}</span>-->
					<span v-if="col.field === totalsColumns[col.field]">{{ totalAmount }}</span>
				</div>
			</div>
        </template>
    </DataTable>
</template>

<script setup>
	import { FilterMatchMode, FilterOperator } from 'primevue/api'
	import { ref, onMounted, computed, watch } from 'vue'
	import { useStore } from 'vuex'
	import notifications from '@/components/notifications'
	import Format from '@/lib/Format'
	import { useFormatDate } from '@/composable/formatDate.js'
	import loadingImg from '@/assets/images/trivial-loading.gif'

	const editingRows = ref([]);
	const onRowEditSave = async (event) => {
		let { newData, index } = event;
		try {
			let results = await store.state.Session.apiCall(`/register_items/${newData.id}`, 'PUT', newData)
			registers.value[index] = results
		} catch (error){
			notifications.error(error)
		}
	};

	const loading = ref(false),
			filters = ref({
				global: { value: null, matchMode: FilterMatchMode.CONTAINS },
				date: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
			}),
			store = useStore(),
			registers = ref([]),
			totalAmount = ref(null),
			totalInfoPopup = ref(),
			rowsPerPageOpt = [5, 10, 20, 50],
			rows = 10,
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
			}

	let columns = [
			{field: 'description', header: 'Description', canEdit: true},
			{field: 'originated_at', header: 'Originated', canEdit: false},
			{field: 'unique_key', header: 'Unique Key', canEdit: false},
			{field: 'amount', header: 'Amount', canEdit: true}
		],
		totalsColumns = {
			amount: 'amount'
		},
		globalFilterFields = [],
		allRegisters = null,
		localStorageOrgId = null,
		regId = null,
		filterDate = {
			end_at: null,
			start_at: null
		}

	const orgId = computed(() => store.getters.getOrgId)
	watch(orgId, async (newVal, oldVal) => await getRegisters(newVal))

	onMounted(async () => {
		orgId.value ? await getRegisters(orgId.value) : false
	})

	const getRegisters = async orgId => {
		loading.value = true

		try {
			//registers.value = await store.state.Session.apiCall(`/registers?search={"owner_type: "Organization", "owner_id": ${orgId}`)
			allRegisters = await store.state.Session.apiCall(`/registers`)
			let register = allRegisters.find(r => r.owner_type == 'Organization' && r.owner_id == orgId && r.name == 'Sales')

			regId = register.id

			// Setting dynamic table columns headers
			for (const property in register.meta) {
				columns.push({field: register.meta[property], header: register.meta[property].replace('_', ' '), canEdit: true})
				globalFilterFields.push(register.meta[property])
			}

			setCssPropColsLength()

			// Settign filters dynamic fileds for search options
			//globalFilterFields.forEach(item => filters.value[item] = {value: null, matchMode: FilterMatchMode.CONTAINS})

			// Get registers item 
			registers.value = await store.state.Session.apiCall(`/register_items?register_id=${register.id}`)

			await getTotalAmountCol()

			loading.value = false
		} catch (err) {
			console.log(err)
			notifications.error(`Failed to fetch data: ${err}`)
			loading.value = false
		}
	}

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

		return
	}

	const clearFilterDate = () => filterDate = {end_at: null, start_at: null}

	const isDisabledTooltip = data => data?.length < 14

	const toggleTotalInfoPopup = event => totalInfoPopup.value.toggle(event)
</script>