<template>
	<Panel v-if="chartData !== undefined" class="shadow-2 w-50"> <!-- :class="`${chartData?.chartType === 'doughnut' ? 'w-30' : 'w-50'}`" -->
		<template #header>
			<div class="flex flex-column">
				<h2 class="mt-0 mb-1">{{ chartData?.name }}</h2>
				<h4 class="mt-1 mb-3 text-sm text-500">{{ chartData?.title }}</h4>
			</div>
		</template>
		<h2 v-if="(!chartData?.chart?.labels.length || !chartData?.chart?.datasets.length) && !loading" class="mt-0 mb-1">No data</h2>
		<Skeleton v-if="loading" height="24.5rem" width="100%" borderRadius=".25rem" />
		<Chart v-else :type="chartData?.title" :data="chartData?.chart" :options="chartOptions" responsive class="h-20rem" />
	</Panel>
</template>

<script setup>
	import { ref, onMounted, toRaw, watch } from "vue"
	import { useFormatCurrency } from '@/composable/formatCurrency.js'
	import { useColorScheme } from '@/composable/colorScheme'
	import { useStore } from 'vuex'

	const props = defineProps({
		chart: {
			type: Object,
			required: true,
			default: {}
		}
	})

	const chartData = ref([]),
		chartOptions = ref(),
		{ themes } = useColorScheme(),
		store = useStore(),
		loading = ref(false)

	onMounted(() => chartInit())

	const chartInit = async () => {
		loading.value = true

		chartOptions.value = props?.chart?.chart_type !== 'doughnut' ? setChartOptions() : setDoughnutChartOptions()
		chartData.value = await formatChartData(props?.chart)

		loading.value = false
	}

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
					//max: props.max,
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

	const setDoughnutChartOptions = () =>  {
		
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
							console.log('context  - ', context)
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
						padding: 12,
						color: textColor,
						generateLabels: chart => {
							const dataset = chart?.data.datasets[0],
								total = dataset?.data.reduce((accumulator, value) => accumulator + value, 0)

							return chart?.data?.labels.map((label, i) => {
								const value = dataset?.data[i],
									percentage = ((value / total) * 100).toFixed(0) + '%'
								
								return {
									text: `${label} (${percentage})`,
									fillStyle: dataset?.backgroundColor ? dataset.backgroundColor[i] : '',
									strokeStyle: dataset?.strokeStyle ? dataset.strokeStyle[i] : '',
									lineWidth: dataset?.borderWidth ? dataset?.borderWidth : '',
									hidden: isNaN(dataset.data[i]) || dataset?.data[i] === null,
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

	// Format props data and prepere for fetching chart data
	const formatChartData = async data => {
		let chartTypeAbbr = data?.chart_type.split('_')[0] || '',
			chartOrderIndex = data?.chart_type !== 'doughnut' ? 1 : 0,
			colorScheme = data?.color_scheme || 'default',
			chartObj = {
				name: data?.name || '',
				chartType: data?.chart_type || '',
				chartTypeAbbr: chartTypeAbbr || '',
				chartOrderIndex: chartOrderIndex,
				count: [],
				title: '',
				group: '',
				chart: {}
			}

		try {
			if (data?.chart_data) {
				chartObj.title = data?.chart_data?.title || ''
				chartObj.group = data?.chart_data?.group_by || []
				const chartCount = data?.chart_data?.count || []

				chartObj.chart = formatBLPChartsData(chartTypeAbbr, colorScheme, chartCount)

				return chartObj // Return the formatted chart object
			}
		} catch (err) {
			console.error(err)
			return null // Return null if something fails
		}
	}

	// Format data for Bar, Line, Pie, Doughnut Charts
	const formatBLPChartsData = (type, colorScheme = 'default', data) => {
		let chart = {}

		const groupedData = {}, // Create a map to group data by the first element in `group`
			months = [] // Define the months in the correct order

		data.forEach(item => {
			let label = typeof item.group === 'string' ? item.group : item.group[0], // Use the first element in `group` as the label
				month = item.period.split(' ')[0];

			if (!months.includes(month)) months.push(month);

			if (!groupedData[label]) {
				let bgColors = type === 'doughnut' ? themes[colorScheme]['color'] : themes[colorScheme]['color'][Object.keys(groupedData).length % themes[colorScheme]['color'].length],
					hoverColor = type === 'doughnut' ? themes[colorScheme]['hover'] : themes[colorScheme]['hover'][Object.keys(groupedData).length % themes[colorScheme]['hover'].length],
					strokeColor = type === 'doughnut' ? themes[colorScheme]['stroke'] : themes[colorScheme]['stroke'][Object.keys(groupedData).length % themes[colorScheme]['stroke'].length],
					borderBgColor = type === 'doughnut' ? '#FFF' : bgColors

				groupedData[label] = {
					type: type,
					label: label.replaceAll('_', ' '),
					backgroundColor: bgColors,
					hoverBackgroundColor: hoverColor,
					strokeStyle: strokeColor,
					hoverOffset: 4,
					fill: false,
					borderWidth: 1,
					borderColor: borderBgColor,
					pointBackgroundColor: bgColors,
					tension: 0.4,
					data: new Array(months.length).fill(0) // Initialize data array with zeros for each month
				}
			}

			const monthIndex = months.indexOf(month)

			if (monthIndex !== -1) groupedData[label].data[monthIndex] = Math.round(parseFloat(item.value)) || 0
		});

		chart.labels = months
		chart.datasets = Object.values(groupedData) // Convert grouped data to array
		return chart
	}
</script>