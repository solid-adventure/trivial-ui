<template>
	<Panel class="shadow-2">
		<DataTable :value="grossRevenue" :loading="loading" scrollable rowGroupMode="rowspan" :groupRowsBy="groupBy[0]" tableStyle="min-width: 120rem" class="revenue__gross__table">
			<template #header>
				<div class="flex justify-content-between align-items-center">
					<h2 class="font-semibold">Gross Revenue ($)</h2>

					<!-- SELECT QUARTERS-->
					<!--<Dropdown v-model="selectedQuarters" :options="quarters" optionLabel="name" placeholder="Select Quarter(s)" class="w-14rem" />-->
				</div>
			</template>
			<template #empty>
				No revenues found.
			</template>
			<template #loading>
				<Image :src="loadingImg" alt="Loader" width="160" />
				<h3>Loading ...</h3>
			</template>
			<ColumnGroup type="header">
				<Row>
					<Column v-for="col in groupBy" :key="col" :field="col" :header="col" sortable rowspan="3" class="capitalize" />
				</Row>
				<Row>
					<!-- Empty row -->
					<Column :colspan="4" />
					<Column :colspan="4" />
				</Row>
				<Row>
					<Column v-for="col in headerCols" :key="col" :field="col" :header="col" sortable class="month__col capitalize" />
					<Column header="Grand Total" frozen alignFrozen="right" sortable field="grandTotal" class="border-left-1 border-top-1 border-200 month__col" />
				</Row>
			</ColumnGroup>

			<Column :field="groupBy[0]" class="w-12rem revenue__gross__table--rowspan-cell" />
			<Column :field="groupBy[1]" class="w-12rem" />

			<Column v-for="col in headerCols" :key="col" :field="col" class="text-right">
				<template #body="slotProps">
					{{useFormatCurrency(slotProps.data[col], 2)}}
				</template>
			</Column>

			<Column field="grandTotal" frozen alignFrozen="right" class="w-12rem border-left-1 border-200 font-semibold text-right">
				<template #body="slotProps">
					{{useFormatCurrency(slotProps.data.grandTotal, 2)}}
				</template>
			</Column>
			<ColumnGroup type="footer" frozen>
				<Row>
					<Column footer="Grand Total" footerStyle="text-align:left" colspan="2" />
					<Column v-for="(item, index) in grandTotals" :key="index" :footer="useFormatCurrency(item, 2)" alignFrozen="right" :frozen="index === 'grandTotals'" class="text-right" :class="{ 'border-left-1 border-200': index === 'grandTotals' }" />
				</Row>
			</ColumnGroup>
		</DataTable>
	</Panel>
</template>

<script setup>
	import { ref, onMounted, computed, watch } from "vue"
	import { useStore } from 'vuex'
	import { Icon } from '@iconify/vue'
	import { useFormatCurrency } from '@/composable/formatCurrency.js'
	import loadingImg from '@/assets/images/trivial-loading-optimized.webp'
	import moment from 'moment-timezone'
	import { useToastNotifications } from '@/composable/toastNotification'

	const selectedQuarters = ref(),
			/*quarters = ref([
				//{name: 'Quarter Q1', item: 'q1'},
				//{name: 'Quarter Q2', item: 'q2'},
				{name: 'Quarter Q3', item: 'q3'},
				{name: 'Quarter Q4', item: 'q4'}
			]),*/
			loading = ref(false),
			store = useStore(),
			grossRevenue = ref([]),
			registersNames = ['Sales', 'Income Account'],
			selectOrgMsgInfo = 'Please, select an organization.',
			{ showSuccessToast, showErrorToast, showInfoToast } = useToastNotifications(),
			headerCols = ref([])

	let regId = null,
		columns = ref([]),
		groupBy = ref([]),
		grandTotals = ref()

	const orgId = computed(() => store.getters.getOrgId)
	watch(orgId, async (newVal, oldVal) => {
		await getRegisters(newVal)
		let grossRevenueRes = await getGrossRevenue()
		formatGrossRevenueData(grossRevenueRes)
	})

	onMounted(async () => {
		loading.value = true

		if (orgId.value) {
			await getRegisters(orgId.value)
			let grossRevenueRes = await getGrossRevenue()
			formatGrossRevenueData(grossRevenueRes)
			loading.value = false
		}
	})

	const getGrossRevenue = async () => {
		loading.value = true

		let total = null
		const timezone = 'Etc/GMT+5', // Etc/GMT+5 -> Not support DST | 'America/Detroit' -> support DST | More info at https://appler.dev/time-zone-table
			end_at = moment.tz(timezone).format(),
			start_at = moment.tz(timezone).startOf('year').startOf('day').format(),
			group_by_period = 'month'

		try {
			total = await store.state.Session.apiCall('/reports/item_sum', 'POST', { register_id: regId, start_at, end_at, group_by_period, timezone, group_by: groupBy.value })
			return total
		} catch (err) {
			console.log(err)
		} finally {
			loading.value = false
		}
	}

    const getRegisters = async orgId => {
		try {
			let allRegisters = await store.state.Session.apiCall('/registers'),
				register = allRegisters.find(r => r.owner_type === 'Organization' && r.owner_id === orgId && registersNames.includes(r.name))

			regId = register.id
			setMetaColumns(register.meta)
		} catch (err) {
			console.log(err)
			showErrorToast('Error', 'Failed to fetch data.')
		}
	}

    // Setting dynamic table columns headers - (register.meta)
	const setMetaColumns = metaCols => {
		for (let property in metaCols) {
			columns.value.push({field: metaCols[property], header: metaCols[property].replaceAll('_', ' ')})
		}

		groupBy.value = [columns.value[0].field, columns.value[1].field] // 1 and 2 dynamic col
	}

    const abbreviateMonth = month => {
        const months = {
            "Jan": "jan", "Feb": "feb", "Mar": "mar", "Apr": "apr", 
            "May": "may", "Jun": "jun", "Jul": "jul", "Aug": "aug", 
            "Sep": "sep", "Oct": "oct", "Nov": "nov", "Dec": "dec"
        }
        return months[month]
    }

	const formatGrossRevenueData = data => {
	    let formattedData = [],
	    	groupedData = {}

	    data?.count.forEach(item => {
	        const dynamicColOne = item.group[0], // dynamic col first
	        	dynamicColTwo = item.group[1], // dynamic col second
	        	month = item.period.split(" ")[0],
	        	value = parseFloat(item.value)

	        if (!groupedData[dynamicColOne]) {
	            groupedData[dynamicColOne] = {}
	        }

	        if (!groupedData[dynamicColOne][dynamicColTwo]) {
	            groupedData[dynamicColOne][dynamicColTwo] = {
	                grandTotal: 0,
	                headers: []
	            }

	            groupedData[dynamicColOne][dynamicColTwo][groupBy.value[0]] = dynamicColOne
	            groupedData[dynamicColOne][dynamicColTwo][groupBy.value[1]] = dynamicColTwo
	        }

	        groupedData[dynamicColOne][dynamicColTwo].headers.push(abbreviateMonth(month))

	        groupedData[dynamicColOne][dynamicColTwo][abbreviateMonth(month)] = value
	        groupedData[dynamicColOne][dynamicColTwo].grandTotal += value
	    })

	    Object.keys(groupedData).forEach(dynColOneItem => {
	        Object.keys(groupedData[dynColOneItem]).forEach(dynColTwoItem => {
	            formattedData.push(groupedData[dynColOneItem][dynColTwoItem])
	        })
	    })

	    headerCols.value = formattedData[0].headers
	    calculateColumnTotals(formattedData)

	    grossRevenue.value = formattedData
	}

	const calculateColumnTotals = formattedDataArray =>{
		let columnTotals = {},
			total = null

		formattedDataArray.forEach(data => {
		    data.headers.forEach(month => {
		        if (!columnTotals[month]) {
		            columnTotals[month] = 0
		        }

		        columnTotals[month] += data[month]
		    })

		  	total += data.grandTotal
		})

		columnTotals.grandTotals = total
		grandTotals.value = columnTotals
	}
</script>