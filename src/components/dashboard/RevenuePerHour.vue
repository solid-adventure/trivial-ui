<template>
    <Panel header="Revenue Per Hour" class="shadow-2">
        <DataTable :value="revenuePerHourPercentData" scrollable tableStyle="min-width: 50rem" class="revenue__per__hour__table border-top-1 border-top-1 border-200" :pt="{
                column: {
                    bodycell: data => {
                        return {
                            class: data.instance.rowData[`${data.instance.field}PercentageClass`]
                        }
                    }
                }
            }">

            <template #empty>
                No revenues found.
            </template>
            <template #loading>
                <Image :src="loadingImg" alt="Loader" width="160" />
                <h3>Loading ...</h3>
            </template>
            
            <Column header="Hours of Psmth" field="hoursPsmth">
                <template #body="slotProps">
                    {{ slotProps.data.hoursPsmth }}
                </template>
            </Column>

            <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header" sortable class="border-none">
                <template #body="slotProps">
                    {{ useFormatCurrency(slotProps.data[col.field]) }}
                </template>
            </Column>
            
            <Column header="Grand Total" field="grandTotalCol" frozen alignFrozen="right" sortable>
                <template #body="slotProps">
                    {{ useFormatCurrency(slotProps.data.grandTotalCol ) }}
                </template>
            </Column>

            <ColumnGroup type="footer">
                <Row>
                    <Column>
                        <template #footer>
                            <div class="flex align-items-center footer__col">
                                <h4 class="m-0">Grand Totals</h4>
                                <Button type="button" icon="pi pi-info-circle" severity="secondary" size="small" text rounded outlined aria-label="Info" @click="toggleTotalInfoPopup" class="info__btn ml-2 p-0" />
                                <OverlayPanel ref="totalInfoPopup">
                                    <p class="m-0">Grand Totals include results for every column.</p>
                                </OverlayPanel>
                            </div>
                        </template>
                    </Column>
                    <template v-for="(value, index) in grandTotalsCols" :key="index">
                        <Column :footer="useFormatCurrency(value)" footerStyle="text-align:right" />
                    </template>
                </Row>
            </ColumnGroup>

            <template #footer>
                <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                    <span class="font-medium">Table Legend</span>
                    <div class="flex w-4 revenue__per__hour__table__footer--percentage">
                        <div v-for="(value, index) in tableLegend" :key="index" class="col" :class="`percentage-${value}`">
                            <div class="text-center text-xs" >{{ value }}%</div>
                        </div>
                    </div>
                </div>
            </template>
        </DataTable>
    </Panel>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useFormatCurrency } from '@/composable/formatCurrency.js'
    import loadingImg from '@/assets/images/trivial-loading-optimized.webp'

    const revenuePerHour = ref([]),
        revenuePerHourPercentData = ref([]),
        totalInfoPopup = ref(),
        columns = [
            //{ field: 'hoursPsmth', header: 'Hours of Psmth' },
            { field: 'sunday', header: 'Sunday' },
            { field: 'monday', header: 'Monday' },
            { field: 'tuesday', header: 'Tuesday' },
            { field: 'wednesday', header: 'Wednesday' },
            { field: 'thursday', header: 'Thursday' },
            { field: 'friday', header: 'Friday' },
            { field: 'sutarday', header: 'Sutarday' },
            //{ field: 'grandTotal', header: 'Grand Total' }
        ],
        grandTotalsCols = ref([5580, 5517, 5930, 8339, 2940, 3015, 3240, 4240]),
        tableLegend = ref([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])

    revenuePerHour.value = [
        {
            hoursPsmth: 10,
            sunday: 0,
            monday: 11,
            tuesday: 0,
            wednesday: 5,
            thursday: 11,
            friday: 0,
            sutarday: 0,
            grandTotalRow: 57,
            grandTotalCol: 27
        },
        {
            hoursPsmth: 11,
            sunday: 730,
            monday: 1157,
            tuesday: 1254,
            wednesday: 1087,
            thursday: 1190,
            friday: 1688,
            sutarday: 850,
            grandTotalRow: 4785,
            grandTotalCol: 7911
        },
        {
            hoursPsmth: 11,
            sunday: 1651,
            monday: 2136,
            tuesday: 2027,
            wednesday: 2346,
            thursday: 1190,
            friday: 3262,
            sutarday: 2478,
            grandTotalRow: 21347,
            grandTotalCol: 16351
        },
        {
            hoursPsmth: 12,
            sunday: 3197,
            monday: 2535,
            tuesday: 2254,
            wednesday: 2539,
            thursday: 1190,
            friday: 3544,
            sutarday: 3705,
            grandTotalRow: 21475,
            grandTotalCol: 20206
        },
        {
            hoursPsmth: 13,
            sunday: 4422,
            monday: 1924,
            tuesday: 1740,
            wednesday: 1776,
            thursday: 1190,
            friday: 2255,
            sutarday: 4835,
            grandTotalRow: 10247,
            grandTotalCol: 20365
        },
        {
            hoursPsmth: 14,
            sunday: 3792,
            monday: 2375,
            tuesday: 1484,
            wednesday: 2041,
            thursday: 1190,
            friday: 2255,
            sutarday: 4835,
            grandTotalRow: 25147,
            grandTotalCol: 18326
        },
        {
            hoursPsmth: 15,
            sunday: 3520,
            monday: 1740,
            tuesday: 1826,
            wednesday: 1813,
            thursday: 1190,
            friday: 3233,
            sutarday: 3526,
            grandTotalRow: 21547,
            grandTotalCol: 17749
        },
        {
            hoursPsmth: 16,
            sunday: 3028,
            monday: 1878,
            tuesday: 1632,
            wednesday: 2123,
            thursday: 1190,
            friday: 2163,
            sutarday: 3019,
            grandTotalRow: 32578,
            grandTotalCol: 15591
        },
        {
            hoursPsmth: 17,
            sunday: 2529,
            monday: 1372,
            tuesday: 1670,
            wednesday: 1667,
            thursday: 1190,
            friday: 2342,
            sutarday: 2779,
            grandTotalRow: 54784,
            grandTotalCol: 13700
        },
        {
            hoursPsmth: 18,
            sunday: 2601,
            monday: 1584,
            tuesday: 1415,
            wednesday: 1178,
            thursday: 1190,
            friday: 1728,
            sutarday: 2262,
            grandTotalRow: 87541,
            grandTotalCol: 12146
        },
        {
            hoursPsmth: 19,
            sunday: 2145,
            monday: 1162,
            tuesday: 1159,
            wednesday: 1095,
            thursday: 1190,
            friday: 1311,
            sutarday: 1686,
            grandTotalRow: 2578,
            grandTotalCol: 9472
        },
        {
            hoursPsmth: 20,
            sunday: 1504,
            monday: 1461,
            tuesday: 1071,
            wednesday: 1283,
            thursday: 1190,
            friday: 1311,
            sutarday: 1686,
            grandTotalRow: 1547,
            grandTotalCol: 9472
        },
        {
            hoursPsmth: 21,
            sunday: 108,
            monday: 184,
            tuesday: 181,
            wednesday: 97,
            thursday: 1190,
            friday: 178,
            sutarday: 231,
            grandTotalRow: 1154,
            grandTotalCol: 1254
        }
    ]

    const toggleTotalInfoPopup = event => totalInfoPopup.value.toggle(event)

    const findGreatestAndSmallest = arr => {
        let greatest = -Infinity,
        smallest = Infinity

        for (let obj of arr) {
            for (let key in obj) {
                if (key !== 'hoursPsmth' && key !== 'grandTotalRow' && key !== 'grandTotalCol') {
                    if (obj[key] > greatest) {
                        greatest = obj[key]
                    }
                    if (obj[key] < smallest) {
                        smallest = obj[key]
                    }
                }
            }
        }

        return { greatest, smallest }
    }

    const calculatePercentages = data => {
        const arrGreatestAndSmallestVal = findGreatestAndSmallest(data)
        return data.map(row => {
            const total = arrGreatestAndSmallestVal.greatest,
                percentages = {}

            for (const key in row) {
                if (key !== 'hoursPsmth' && key !== 'grandTotalRow' && key !== 'grandTotalCol') {
                    percentages[key + 'Percentage'] = Math.round((row[key] / total) * 100)
                    percentages[key] = row[key]
                } else {
                    percentages[key] = row[key]
                }
            }

            return percentages
        })
    }

    const getClass = percentage => {
        if (percentage <= 10) return 'percentage-10'
        if (percentage <= 20) return 'percentage-20'
        if (percentage <= 30) return 'percentage-30'
        if (percentage <= 40) return 'percentage-40'
        if (percentage <= 50) return 'percentage-50'
        if (percentage <= 60) return 'percentage-60'
        if (percentage <= 70) return 'percentage-70'
        if (percentage <= 80) return 'percentage-80'
        if (percentage <= 90) return 'percentage-90'
        return 'percentage-100'
    }

    const setClass = () => {
        revenuePerHourPercentData.value.forEach(row => {
            for (const key in row) {
                if (key.includes('Percentage')) {
                    row[key + 'Class'] = getClass(row[key])
                }
            }
        })
    }

    onMounted(() => {
        revenuePerHourPercentData.value = calculatePercentages(revenuePerHour.value)
        setClass()
    })
</script>
