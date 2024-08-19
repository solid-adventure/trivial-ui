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
				<h4 class="font-medium">No Gross Revenue data found.</h4>
			</template>
			<template #loading>
				<Image :src="loadingImg" alt="Loader" width="160" />
				<h3>Loading ...</h3>
			</template>
			<ColumnGroup type="header" v-if="grossRevenue.length">
				<Row>
					<template v-if="groupBy.length">
						<Column v-for="col in groupBy" :key="col" :field="col" :header="col.replaceAll('_', ' ')" sortable rowspan="3" class="capitalize" />
					</template>
					<template v-else>
						<Column header="All" rowspan="3" />
					</template>
				</Row>
				<Row>
					<!-- Empty row -->
					<Column :colspan="4" />
					<Column :colspan="4" />
				</Row>
				<Row>
					<Column v-for="col in headerCols" :key="col" :field="col" :header="col" sortable class="month__col capitalize" />
					<Column v-if="grossRevenue.length" header="Grand Total" frozen alignFrozen="right" sortable field="grandTotal" class="border-left-1 border-top-1 border-200 month__col" />
				</Row>
			</ColumnGroup>

			<template v-if="groupBy.length">
				<Column v-for="col in groupBy" :key="col" :field="col" />
			</template>
			<template v-else>
				<Column field="All" />
			</template>

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
			<ColumnGroup v-if="grossRevenue.length" type="footer" frozen>
				<Row>
					<Column footer="Grand Total" footerStyle="text-align:left" :colspan="groupBy.length" />
					<Column v-for="(item, index) in grandTotals" :key="index" :footer="useFormatCurrency(item, 2)" alignFrozen="right" :frozen="index === 'grandTotals'" class="text-right" :class="{ 'border-left-1 border-200': index === 'grandTotals' }" />
				</Row>
			</ColumnGroup>
		</DataTable>
	</Panel>
</template>

<script setup>
	import { ref, onMounted } from "vue"
	import { useFormatCurrency } from '@/composable/formatCurrency.js'
	import loadingImg from '@/assets/images/trivial-loading-optimized.webp'

	const props = defineProps({
		grData: {
			type: Object,
			required: true,
			default: () => {}
		}
	})

	const selectedQuarters = ref(),
			/*quarters = ref([
				//{name: 'Quarter Q1', item: 'q1'},
				//{name: 'Quarter Q2', item: 'q2'},
				{name: 'Quarter Q3', item: 'q3'},
				{name: 'Quarter Q4', item: 'q4'}
			]),*/
			loading = ref(false),
			headerCols = ref([])

	let groupBy = ref([]),
		grandTotals = ref(),
		grossRevenue = ref([])

	onMounted(() => {
		formatGrossRevenueData(props.grData)
	})

	const abbreviateMonth = month => {
		const months = {
			"Jan": "jan", "Feb": "feb", "Mar": "mar", "Apr": "apr", 
			"May": "may", "Jun": "jun", "Jul": "jul", "Aug": "aug", 
			"Sep": "sep", "Oct": "oct", "Nov": "nov", "Dec": "dec"
		}
		return months[month]
	}

	const formatGrossRevenueData = data => {
		loading.value = true
		groupBy.value = data.group // Set group by for table grouping

		let formattedData = [],
			groupedData = {},
			headers = []

		data?.count.forEach(item => {
			let dynamicColOne = null, // dynamic col first
				dynamicColTwo = null, // dynamic col second
				dynamicColTree = null, // dynamic col tree
				month = item?.period.split(" ")[0],
				value = parseFloat(item?.value)

			if (typeof item?.group !== 'string') {
				dynamicColOne = item?.group[0]
				dynamicColTwo = item?.group[1]
				dynamicColTree = item?.group[2]
			} else {
				dynamicColOne = item?.group
			}

			if (!headers.includes(abbreviateMonth(month))) headers.push(abbreviateMonth(month))

			if (!groupedData[dynamicColOne]) groupedData[dynamicColOne] = {}

			if (!groupedData[dynamicColOne][dynamicColTwo]) {
				groupedData[dynamicColOne][dynamicColTwo] = {
					grandTotal: 0,
					headers: []
				}

				groupedData[dynamicColOne][dynamicColTwo][groupBy?.value[0]] = dynamicColOne
				groupedData[dynamicColOne][dynamicColTwo][groupBy?.value[1]] = dynamicColTwo
				groupedData[dynamicColOne][dynamicColTwo][groupBy?.value[2]] = dynamicColTree
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

		//headerCols.value = [... new Set(formattedData[0].headers)]
		headerCols.value = headers
		calculateColumnTotals(formattedData)

		grossRevenue.value = formattedData
		loading.value = false
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