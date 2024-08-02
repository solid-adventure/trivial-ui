<template>
	<div class="flex flex-column row-gap-4 dashboard">
		<Actuals />
		<!--<Forecast :selected="selectedForecast" /> -->

		<Divider class="my-1" />

		<GrossRevenue />
		<!--<RevenueWalk :revenueWalk="rwData" />
		<CashImpacts :cashImpacts="ciData" />-->

		<!--<Divider class="my-1" />-->

		<!--<div class="flex flex-wrap gap-3">
			<TheChart :headerTitle="'Revenue Over Time Location (Month)'" :chartDataSet="barChart1" :chartType="'bar'" :max="'200000'" :stepSize="'50000'" :width="'w-50'" />
			<TheChart :headerTitle="'Revenue Over Time Location ($)'" :chartDataSet="lineChart" :chartType="'line'" :max="'10000'" :stepSize="'2000'" :width="'w-50'" />
			<TheChart :headerTitle="'Revenue Over Time Type (Month)'" :chartDataSet="barChart2" :chartType="'bar'" :max="'200000'" :stepSize="'50000'" :width="'w-50'" />
			<TheChart :headerTitle="'Revenue Over Time Location PTC (Month)'" :chartDataSet="barChart3" :chartType="'bar'" :yTicks="'%'" :max="'100'" :stepSize="'20'" :width="'w-50'" />
		</div>

		<div class="flex flex-wrap gap-3">
			<TheDoughnutChart :headerTitle="'Location Contributor Yeat to Date'" :chartDataSet="doughnutChart1" :chartType="'doughnut'" :width="'w-30'" />
			<TheDoughnutChart :headerTitle="'Channel Contributor Yeat to Date'" :chartDataSet="doughnutChart2" :chartType="'doughnut'" :yTicks="'%'" :width="'w-30'" />
		</div>-->

		<!--<Divider class="my-1" />

		<RevenuePerHour />-->
	</div>
</template>

<script setup>
	import { ref, onMounted } from 'vue'
	import { useStore } from 'vuex'
	import Actuals from '@/components/dashboard/Actuals.vue'
	import Forecast from '@/components/dashboard/Forecast.vue'
	import GrossRevenue from '@/components/dashboard/GrossRevenue.vue'
	import RevenueWalk from '@/components/dashboard/RevenueWalk.vue'
	import CashImpacts from '@/components/dashboard/CashImpacts.vue'
	import TheChart from '@/components/dashboard/TheChart.vue'
	import TheDoughnutChart from '@/components/dashboard/TheDoughnutChart.vue'
	import RevenuePerHour from '@/components/dashboard/RevenuePerHour.vue'

	const store = useStore(),
	selectedForecast = ref([
		{name: 'Last 7 Days x 30 x 12 Fcst', value: '$54,903', icon:'prime:arrow-down', class: 'down'},
		{name: 'Last 30 Days x 12 Fcst', value: '$231,947', icon:'prime:arrow-up', class: 'up'},
		{name: 'Last 90 Days x 4 Fcst', value: '$657,295', icon:'prime:arrow-up', class: 'up'},
	]),
	// REVENUE WALK
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
		]),
		// CASH IMPACTS
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
	]),
	// BAR CHART DATA BLUE
	barChart1 = {
		labels: ['January', 'February', 'March', 'April', 'May'],
		datasets: [
			{
				type: 'bar',
				label: 'Location 1',
				backgroundColor: '#0083e0',
				data: [50000, 25000, 44000, 48800, 15500]
			},
			{
				type: 'bar',
				label: 'Location 2',
				backgroundColor: '#0a99ff',
				data: [21789, 44194, 24445, 7500, 33000]
			},
			{
				type: 'bar',
				label: 'Location 3',
				backgroundColor: '#47b3ff',
				data: [41658, 5200, 24754, 7400, 45000]
			},
			{
				type: 'bar',
				label: 'Location 4',
				backgroundColor: '#85ccff',
				data: [11785, 23578, 44879, 25214, 45345]
			},
			{
				type: 'bar',
				label: 'Location 5',
				backgroundColor: '#c2e5ff',
				data: [55358, 41257, 2400, 25874, 41257]
			}
		]
	},
	// LINE CHART DATA 
	lineChart = {
        labels: ['Jan 9', 'Jan 24', 'Feb 8', 'Feb 23', 'Mar 9', 'Mar 24', 'Apr 8', 'Apr 23', 'May 8'],
        datasets: [
            {
                label: 'Retail',
                data: [6500, 9000, 2100, 1700, 4400, 8000, 3500, 7150, 3250],
                fill: false,
                borderColor: '#cc00be',
                pointBackgroundColor: '#cc00be',
                backgroundColor: '#cc00be80',
                tension: 0.4
            },
            {
                label: 'Wholesale',
                data: [2500, 1000, 3600, 3900, 5400, 1700, 6450, 2545, 5789],
                fill: false,
                borderColor: '#d60c0c',
                pointBackgroundColor: '#d60c0c',
                backgroundColor: '#d60c0c80',
                tension: 0.4
            }
        ]
    },
    // BAR CHART DATA BLUE
	barChart2 = {
		labels: ['January', 'February', 'March', 'April', 'May'],
		datasets: [
			{
				type: 'bar',
				label: 'Retail',
				backgroundColor: '#408162',
				data: [50000, 25000, 44000, 48800, 15500]
			},
			{
				type: 'bar',
				label: 'Wholesale',
				backgroundColor: '#51a17a',
				data: [21789, 44194, 24445, 7500, 33000]
			},
			{
				type: 'bar',
				label: 'Services',
				backgroundColor: '#6acb9d',
				data: [41658, 5200, 24754, 7400, 45000]
			}
		]
	},
	// BAR CHART DATA ORANGE
	barChart3 = {
		labels: ['January', 'February', 'March', 'April', 'May'],
		datasets: [
			{
				type: 'bar',
				label: 'Example 1',
				backgroundColor: '#e05200',
				data: [10, 20, 30, 50, 50]
			},
			{
				type: 'bar',
				label: 'Example 2',
				backgroundColor: '#ff711f',
				data: [20, 40, 40, 30, 25]
			},
			{
				type: 'bar',
				label: 'Example 3',
				backgroundColor: '#ff985c',
				data: [20, 15, 10, 20, 10]
			}
		]
	},
	doughnutChart1 = {
        labels: ['Location 1', 'Location 2', 'Location 3', 'Location 4', 'Location 5'],
        datasets: [
            {
                data: [21789, 44194, 24445, 7500, 33000],
                backgroundColor: ['#d40000', '#db4d4d', '#fc8383', '#f2a4a4', '#f2b8b8'],
                hoverBackgroundColor: ['#d40000', '#db4d4d', '#fc8383', '#f2a4a4', '#f2b8b8'],
                strokeStyle: ['#d40000', '#db4d4d', '#fc8383', '#f2a4a4', '#f2b8b8']
            }
        ]
    },
    doughnutChart2 = {
        labels: ['Retail', 'Wholesale', 'Services'],
        datasets: [
            {
                data: [70, 27, 3],
                backgroundColor: ['#8f0085', '#cc29c1', '#f249e7'],
                hoverBackgroundColor: ['#8f0085', '#cc29c1', '#f249e7'],
                strokeStyle: ['#8f0085', '#cc29c1', '#f249e7']
            }
        ]
    }
</script>