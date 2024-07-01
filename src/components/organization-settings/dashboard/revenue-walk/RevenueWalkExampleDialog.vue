<template>
	<Dialog v-model:visible="visible" :draggable="false" modal @hide="closeModal" header="Example of Revenue Walk" class="org-settings__dialog revenue__gross w-10">
		<!--<Panel class="shadow-2">
			<DataTable :value="data" scrollable rowGroupMode="rowspan" groupRowsBy="revenueType" tableStyle="min-width: 120rem" class="revenue__gross__table">
				<template #header>
					<div class="flex justify-content-between align-items-center">
						<h2 class="font-semibold">Revenue Walk($)</h2>

						<!-- SELECT QUARTERS--
						<!--<Dropdown v-model="selectedQuarters" :options="quarters" optionLabel="name" placeholder="Select Quarter(s)" class="w-14rem" />--
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
		</Panel>-->

		<RevenueWalk :revenueWalk="rwData" />
	</Dialog>
</template>

<script setup>
	import { ref, watch } from "vue"
	import RevenueWalk from '@/components/dashboard/RevenueWalk.vue'

	const props = defineProps(['visible'])
	const emit = defineEmits(['closeExampleModal'])

	const visible = ref(false),
			rwData = ref([{
		        revenueType: 'Gross Revenue',
		        q1: {
		            january: 67491,
		            february: 72907,
		            march: 79511,
		            total: 2199009
		        },
		        q2: {
		            april: 81930,
		            may: 6220,
		            june: 5578,
		            total: 87527
		        },
		       	q3: {
		            july: 4420,
		            august: 1178,
		            september: 7324,
		            total: 88527
		        },
		        q4: {
		            october: 8930,
		            november: 9641,
		            december: 7824,
		            total: 75427
		        },
		        grandTotal: 307435
		    },
		    {
		        revenueType: 'Gross Revenue',
		        q1: {
		            january: 52932,
		            february: 54138,
		            march: 59138,
		            total: 166257
		        },
		        q2: {
		            april: 63330,
		            may: 5049,
		            june: 7578,
		            total: 68379
		        },
		       	q3: {
		            july: 2024,
		            august: 3678,
		            september: 8650,
		            total: 87427
		        },
		        q4: {
		            october: 8630,
		            november: 9871,
		            december: 6324,
		            total: 65427
		        },
		        grandTotal: 234637
		    },
		    {
		        revenueType: 'Refunds',
		        q1: {
		            january: 35134,
		            february: 34736,
		            march: 38518,
		            total: 108028
		        },
		        q2: {
		            april: 40682,
		            may: 3827,
		            june: 5876,
		            total: 44509
		        },
		       	q3: {
		            september: 7524,
		            july: 9687,
		            august: 3547,
		            total: 87427
		        },
		        q4: {
		            october: 9867,
		            november: 4541,
		            december: 6874,
		            total: 86747
		        },
		        grandTotal: 152537
		    },
		    {
		        revenueType: 'Refunds',
		        q1: {
		            january: 20873,
		            february: 17705,
		            march: 21927,
		            total: 60505
		        },
		        q2: {
		            april: 20526,
		            may: 8963,
		            june: 2356,
		            total: 29489
		        },
		        q3: {
		            september: 8754,
		            july: 9654,
		            august: 4723,
		            total: 87427
		        },
		        q4: {
		            october: 8657,
		            november: 7851,
		            december: 9657,
		            total: 86757
		        },
		        grandTotal: 89994
		    },
		    {
		        revenueType: 'Discounts & Credits',
		        q1: {
		            january: 35134,
		            february: 5965,
		            march: 5930,
		            total: 21493
		        },
		        q2: {
		            april: 2560,
		            may: 3122,
		            june: 9687,
		            total: 9185
		        },
		        q3: {
		            september: 7864,
		            july: 3574,
		            august: 3954,
		            total: 87427
		        },
		        q4: {
		            october: 8670,
		            november: 6851,
		            december: 7852,
		            total: 68727
		        },
		        grandTotal: 20035
		    },
		    {
		       	revenueType: 'Shipping',
		        q1: {
		            january: 35134,
		            february: 5965,
		            march: 5930,
		            total: 21493
		        },
		        q2: {
		            april: 2560,
		            may: 3122,
		            june: 9687,
		            total: 9185
		        },
		        q3: {
		            september: 7864,
		            july: 3574,
		            august: 3954,
		            total: 87427
		        },
		        q4: {
		            october: 8670,
		            november: 6851,
		            december: 7852,
		            total: 68727
		        },
		        grandTotal: 20035
		    }
		])

	watch(props, newVal => visible.value = newVal.visible)

	const closeModal = () => {
		visible.value = false
		emit('closeExampleModal')
	}
</script>