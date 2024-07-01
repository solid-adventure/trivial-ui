<template>
	<Panel class="shadow-2">
		<DataTable :value="cashImpacts" scrollable rowGroupMode="rowspan" groupRowsBy="revenueType" tableStyle="min-width: 120rem" class="revenue__gross__table">
			<template #header>
				<div class="flex justify-content-between align-items-center">
					<h2 class="font-semibold">Other Cash Impacts ($)</h2>

					<!-- SELECT QUARTERS-->
					<!--<Dropdown v-model="selectedQuarters" :options="quarters" optionLabel="name" placeholder="Select Quarter(s)" class="w-14rem" /> -->
				</div>
			</template>
			<ColumnGroup type="header">
				<Row>
					<Column header="Revenue Type" :rowspan="3" headerStyle="vertical-align:top" />
				</Row>
				<Row>
					<Column header="Q1 2024" :colspan="4" />
					<Column header="Q2 2024" :colspan="4" />
					<Column v-if="selectedQuarters?.item === 'q3'" header="Q3 2024" :colspan="4" />
					<Column v-if="selectedQuarters?.item === 'q4'" header="Q4 2024" :colspan="4" />
				</Row>
				<Row>
					<Column header="January" sortable field="q1.january" />
					<Column header="February" sortable field="q1.february" />
					<Column header="March" sortable field="q1.march" />
					<Column header="Q1 Total" sortable field="q1.total" />
					<Column header="April" sortable field="q2.april" />
					<Column header="May" sortable field="q2.may" />
					<Column header="June" sortable field="q2.june" />
					<Column header="Q2 Total" sortable field="q2.total" />
					<template v-if="selectedQuarters?.item === 'q3'">
						<Column header="July" sortable field="q3.july" />
						<Column header="August" sortable field="q3.august" />
						<Column header="September" sortable field="q3.september" />
						<Column header="Q3 Total" sortable field="q3.total" />
					</template>
					<template v-if="selectedQuarters?.item === 'q4'">
						<Column header="October" sortable field="q4.october" />
						<Column header="November" sortable field="q4.november" />
						<Column header="December" sortable field="q4.december" />
						<Column header="Q4 Total" sortable field="q4.total" />
					</template>
					<Column header="Grand Total" frozen alignFrozen="right" sortable field="grandTotal" class="border-left-1 border-top-1 border-200" />
				</Row>
			</ColumnGroup>

			<Column field="revenueType" class="revenue__gross__table--rowspan-cell" />
			<Column field="q1.january">
				<template #body="slotProps">
					{{useFormatCurrency(slotProps.data.q1.january)}} {{quarters.item}}
				</template>
			</Column>
			<Column field="q1.february">
				<template #body="slotProps">
					{{useFormatCurrency(slotProps.data.q1.february)}}
				</template>
			</Column>
			<Column field="q1.march">
				<template #body="slotProps">
					{{useFormatCurrency(slotProps.data.q1.march)}}
				</template>
			</Column>
			<Column field="q1.total" class="font-semibold">
				<template #body="slotProps">
					{{useFormatCurrency(slotProps.data.q1.total)}}
				</template>
			</Column>
			<Column field="q2.april">
				<template #body="slotProps">
					{{useFormatCurrency(slotProps.data.q2.april)}}
				</template>
			</Column>
			<Column field="q2.may">
				<template #body="slotProps">
					{{useFormatCurrency(slotProps.data.q2.may)}}
				</template>
			</Column>
			<Column field="q2.june">
				<template #body="slotProps">
					{{useFormatCurrency(slotProps.data.q2.june)}}
				</template>
			</Column>
			<Column field="q2.total" class="font-semibold">
				<template #body="slotProps">
					{{useFormatCurrency(slotProps.data.q2.total)}}
				</template>
			</Column>

			<template v-if="selectedQuarters?.item === 'q3'">
				<Column field="q3.july">
					<template #body="slotProps">
						{{useFormatCurrency(slotProps.data.q3.july)}}
					</template>
				</Column>
				<Column field="q3.august">
					<template #body="slotProps">
						{{useFormatCurrency(slotProps.data.q3.august)}}
					</template>
				</Column>
				<Column field="q3.september">
					<template #body="slotProps">
						{{useFormatCurrency(slotProps.data.q3.september)}}
					</template>
				</Column>
				<Column field="q3.total" class="font-semibold">
					<template #body="slotProps">
						{{useFormatCurrency(slotProps.data.q3.total)}}
					</template>
				</Column>
			</template>
			
			<template v-if="selectedQuarters?.item === 'q4'">
				<Column field="q4.october">
					<template #body="slotProps">
						{{useFormatCurrency(slotProps.data.q4.october)}}
					</template>
				</Column>
				<Column field="q4.november">
					<template #body="slotProps">
						{{useFormatCurrency(slotProps.data.q4.november)}}
					</template>
				</Column>
				<Column field="q4.december">
					<template #body="slotProps">
						{{useFormatCurrency(slotProps.data.q4.december)}}
					</template>
				</Column>
				<Column field="q4.total" class="font-semibold">
					<template #body="slotProps">
						{{useFormatCurrency(slotProps.data.q4.total)}}
					</template>
				</Column>
			</template>

			<Column field="grandTotal" frozen alignFrozen="right" class="border-left-1 border-200 font-semibold">
				<template #body="slotProps">
					{{useFormatCurrency(slotProps.data.grandTotal)}}
				</template>
			</Column>
			<ColumnGroup type="footer" frozen>
				<Row>
					<Column footer="Grand Total" footerStyle="text-align:left"/>
					<Column footer="$5,580" />
					<Column footer="$5,517" />
					<Column footer="$5,930" />
					<Column footer="$8,339" />
					<Column footer="$2,940" />
					<Column footer="$300,00" />
					<Column footer="$3,240" />
					<Column footer="$4,240" />
					<template v-if="selectedQuarters?.item === 'q3'">
						<Column footer="$2,339" />
						<Column footer="$5,940" />
						<Column footer="$550,00" />
						<Column footer="$9,240" />
					</template>
					<template v-if="selectedQuarters?.item === 'q4'">
						<Column footer="$1,239" />
						<Column footer="$9,940" />
						<Column footer="$110,00" />
						<Column footer="$3,240" />
					</template>
					<Column footer="$11,579" alignFrozen="right" frozen class="border-left-1 border-200" />
				</Row>
			</ColumnGroup>
		</DataTable>
	</Panel>
</template>

<script setup>
	import { ref, watch, computed, onMounted } from "vue"
	import { Icon } from '@iconify/vue'
	import { useFormatCurrency } from '@/composable/formatCurrency.js'

	const props = defineProps(['cashImpacts'])

	const selectedQuarters = ref(),
			quarters = ref([
				//{name: 'Quarter Q1', item: 'q1'},
				//{name: 'Quarter Q2', item: 'q2'},
				{name: 'Quarter Q3', item: 'q3'},
				{name: 'Quarter Q4', item: 'q4'}
			])
</script>