<template>
	<DataTable v-model:filters="filters" :value="registers" paginator :rows="rows" :rowsPerPageOptions="rowsPerPageOpt" tableStyle="min-width: 50rem" dataKey="id" filterDisplay="row" :loading="loading" :globalFilterFields="globalFilterFields" class="border-round-sm registers_table">
	    <template #header>
	        <div class="flex justify-content-between py-5">
	        	<h2 class="m-0">Revenue Detail</h2>
	            <IconField iconPosition="right">
	            	<Calendar v-model="filters['global'].value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" mask="99/99/9999" class="calendar__search" />
	                <InputIcon>
	                    <i class="pi pi-calendar" />
	                </InputIcon>
	                <!--<InputText v-model="filters['global'].value" placeholder="Keyword Search" />-->
	            </IconField>
	        </div>
	    </template>
	    <template #empty>No revenues found.</template>
	    <template #loading>Loading revenues data. Please wait.</template>

        <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header" sortable />

        <template #footer>
        	<div class="flex justify-content-start">
        		<h4 class="m-0">Totals</h4>
        	</div>
        </template>
    </DataTable>
</template>

<script setup>
	import { FilterMatchMode } from 'primevue/api'
	import { ref, onMounted, computed, watch } from 'vue'
	import { useStore } from 'vuex'

	const loading = ref(false),
			filters = ref({
				global: { value: null, matchMode: FilterMatchMode.DATE_IS }
			}),
			store = useStore(),
			registers = ref([]),
			rowsPerPageOpt = [5, 10, 20, 50],
			rows = 10,
			dateOptions = {
				dateStyle: 'short',
				timeStyle: 'short',
				timeZone: 'America/New_York'
			},
			intlDateTime = new Intl.DateTimeFormat('en-US', dateOptions)

	let columns = [{field: 'formatted_date', header: 'Date'}],
		globalFilterFields = [],
		allRegisters = null

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
			// Setting dynamic table columns headers
			for (const property in register.meta) {
				columns.push({field: register.meta[property], header: register.meta[property].replace('_', ' ')})
				globalFilterFields.push(register.meta[property])
			}
			columns.push({field: 'description', header: 'Description'})
			columns.push({field: 'originated_at', header: 'Original Date'})
			columns.push({field: 'unique_key', header: 'Unique Key'})
			columns.push({field: 'units', header: 'Units'})
			columns.push({field: 'amount', header: 'Amount'})

			// Settign filters dynamic fileds for search options
			//globalFilterFields.forEach(item => filters.value[item] = {value: null, matchMode: FilterMatchMode.CONTAINS})

			// Get registers item 
			let regArr = await store.state.Session.apiCall(`/register_items?register_id=${register.id}`)

			// Format the date (created_at property) and add new property to the register item
			registers.value = regArr.map(item => Object.assign(item, { formatted_date: intlDateTime.format(new Date(item.created_at)) }))

			loading.value = false
		} catch (err) {
			console.log(err)
			loading.value = false
		}
	}
</script>