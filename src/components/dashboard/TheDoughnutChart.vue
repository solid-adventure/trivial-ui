<template>
	<Panel :header="headerTitle" class="shadow-2" :class="width">
		<Chart :type="chartType" :data="chartData" :options="chartOptions" responsive class="h-20rem" />
	</Panel>
</template>

<script setup>
	import { ref, onMounted } from "vue"
	import { useFormatCurrency } from '@/composable/formatCurrency.js'

	const props = defineProps(['chartDataSet', 'headerTitle', 'chartType', 'yTicks', 'width'])

	const chartData = ref(),
		chartOptions = ref()

	onMounted(() => {
		chartData.value = props.chartDataSet
		chartOptions.value = setChartOptions()
	});

	const setChartOptions = () =>  {
		
		const textColor = '#495667'

		return {
			maintainAspectRatio: false,
			aspectRatio: 0.8,
			plugins: {
				tooltip: {
					mode: 'point',
					intersect: false,
					callbacks: {
						label: context => {
							let label = context.dataset.label || ''

							if (label) label += ': '

							if (props.yTicks !== '%') {
								if (context.parsed.y !== null) {
									label += ' ' + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(context.parsed)
								}

								return label
							} else {
								if (context.parsed.y !== null) {
									label += ` ${context.parsed}%`
								}

								return label
							}
						}
					}
				},
				legend: {
					labels: {
						padding: 40,
						color: textColor,
						generateLabels: chart => {
							const dataset = chart.data.datasets[0],
								total = dataset.data.reduce((accumulator, value) => accumulator + value, 0)

							return chart.data.labels.map((label, i) => {
								const value = dataset.data[i],
									percentage = ((value / total) * 100).toFixed(0) + '%'
								
								return {
									text: `${label} (${percentage})`,
									fillStyle: dataset.backgroundColor[i],
									strokeStyle: dataset.strokeStyle[i],
									lineWidth: dataset.borderWidth,
									hidden: isNaN(dataset.data[i]) || dataset.data[i] === null,
									index: i
								}
							})
						}
					},
					position: 'right'
				}
			},
			scales: {}
		}
	}
</script>