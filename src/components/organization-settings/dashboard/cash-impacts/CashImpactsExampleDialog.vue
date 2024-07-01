<template>
	<Dialog v-model:visible="visible" :draggable="false" modal @hide="closeModal" header="Example of Other Cash Impacts" class="org-settings__dialog revenue__gross w-10">
		<CashImpacts :cashImpacts="ciData" />
	</Dialog>
</template>

<script setup>
	import { ref, watch } from "vue"
	import CashImpacts from '@/components/dashboard/CashImpacts.vue'

	const props = defineProps(['visible'])
	const emit = defineEmits(['closeExampleModal'])

	const visible = ref(false),
			ciData = ref([{
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
		        revenueType: 'Sales Tax',
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
		        revenueType: 'Sales Tax',
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
		        revenueType: 'Tip Wage',
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