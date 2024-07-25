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
		const textColor = '#495667',
			textColorSecondary = '#69727e',
			surfaceBorder = '#ededed'

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
									label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(context.parsed.y)
								}

								return label
							} else {
								if (context.parsed.y !== null) {
									label += `${context.parsed.y}%`
								}

								return label
							}
						}
					}
				},
				legend: {
					labels: {
						color: textColor
					}
				}
			},
			scales: {
				x: {
					stacked: true,
					ticks: {
						color: textColorSecondary
					},
					grid: {
						color: surfaceBorder
					}
				},
				y: {
					stacked: true,
					beginAtZero: true,
					max: props.max,
					ticks: {
						stepSize: props.stepSize,
						color: textColorSecondary,
						// Customize Y-axis label
						callback: value => {
							if (props.yTicks !== '%') {
								if (value >= 1000000) {
									return (value / 1000000).toFixed(0) + 'M' // Million
								} else if (value >= 1000) {
									return (value / 1000).toFixed(0) + 'K' // Thousand
								}
								return value
							} else {
								return `${value}%`
							}
						}
					},
					grid: {
						color: surfaceBorder
					}
				}
			}
		}
	}
</script>