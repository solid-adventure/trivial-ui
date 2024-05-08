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
		class="border-round-sm registers_table"
		ref="dt">

	    <template #header>
			<h2 class="m-0">Revenue Detail</h2>
	        <div class="flex justify-content-between py-5">
				<div style="text-align: left">
            		<Button icon="pi pi-external-link" label="Export" @click="exportCSV($event)" />
        		</div>
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

		<Column header="Date" filterField="date" dataType="date">
			<template #body="{ data }">
				{{ useFormatDate(data.created_at, dateOptions) }}
			</template>
			<template #filter="{ filterModel }">
				<Calendar v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" mask="99/99/9999" />
			</template>
		</Column>

        <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header" sortable />

        <template #footer>
			<div class="flex justify-content-start">
        		<h4 class="m-0">Totals {{ Format.money(totalAmount) }}</h4>
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

	const dt = ref();
	const exportCSV = () => {
		dt.value.exportCSV();
	};

	const loading = ref(false),
			filters = ref({
				global: { value: null, matchMode: FilterMatchMode.CONTAINS },
				date: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
			}),
			store = useStore(),
			registers = ref([]),
			totalAmount = ref(null),
			rowsPerPageOpt = [5, 10, 20, 50],
			rows = 10,
			dateOptions = {
				dateStyle: 'short',
				timeStyle: 'short',
				timeZone: 'America/New_York'
			}

	let columns = [
			{field: 'description', header: 'Description'},
			{field: 'originated_at', header: 'Original Date'},
			{field: 'unique_key', header: 'Unique Key'},
			{field: 'units', header: 'Units'},
			{field: 'amount', header: 'Amount'}
		],
		globalFilterFields = [],
		allRegisters = null,
		localStorageOrgId = null

	const orgId = computed(() => store.getters.getOrgId)
	watch(orgId, async (newVal, oldVal) => await getRegisters(newVal))

	onMounted(async () => {
		orgId.value ? await getRegisters(orgId.value) : false

		totalAmount.value = setTotalColValue(registers.value, 'amount')
	})

	const getRegisters = async orgId => {
		loading.value = true

		try {
			//registers.value = await store.state.Session.apiCall(`/registers?search={"owner_type: "Organization", "owner_id": ${orgId}`)
			allRegisters = await store.state.Session.apiCall(`/registers`)
			let register = allRegisters.find(r => r.owner_type == 'Organization' && r.owner_id == orgId && r.name == 'Sales')

			// Setting dynamic table columns headers
			for (const property in register.meta) {
				columns.push({field: register.meta[property], header: register.meta[property].replace('_', ' ')})
				globalFilterFields.push(register.meta[property])
			}

			// Settign filters dynamic fileds for search options
			//globalFilterFields.forEach(item => filters.value[item] = {value: null, matchMode: FilterMatchMode.CONTAINS})

			// Get registers item 
			registers.value = await store.state.Session.apiCall(`/register_items?register_id=${register.id}`)
			loading.value = false
		} catch (err) {
			console.log(err)
			notifications.error(`Failed to fetch data: ${err}`)
			loading.value = false
		}
	}

	const setTotalColValue = (data, searchProp) => {
		let total = null

		data.forEach(item => total += parseInt(item[searchProp]))

		return total
	}
</script>