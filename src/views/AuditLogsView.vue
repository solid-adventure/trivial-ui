<template>
    <DataTable
        v-model:filters="filters"
        :globalFilterFields="globalFilterFields"
        :value="auditRows"
        :loading="loading" 
        paginator
        lazy
        :rows="rows" 
        :rowsPerPageOptions="rowsPerPageOpt"
        :totalRecords="totalRecords"
        :first="first"
        @page="onPage"
        @filter="onFilter"
        dataKey="id"
        filterDisplay="menu"
        tableStyle="max-width: 100%"
        class="border-round-sm page_table"
        :pt="ptOptions"
    >
        <template #header>
            <div class="flex justify-content-between py-5">
                <h2 class="m-0">User Activites and System Changes</h2>

                <Button label="Export as CSV" aria-label="Download CSV" icon="pi pi-download" class="registers_table--csv-btn" @click="openCSVDialog" :disabled="auditRows.length === 0" />
            </div>
        </template>
        <template #empty>
            <h3 v-if="!orgId">{{ selectOrgMsgInfo }}</h3>
            No audits found.
        </template>
        <template #loading>
            <div class="flex flex-column gap-1 justify-content-center text-center">
                <Image :src="loadingImg" alt="Loader" width="160" />
                <h3>Loading ...</h3>
            </div>
        </template>

        <Column v-for="col of columns" :key="col.field" :field="col.field" :filterField="col.field" filter :filterMatchModeOptions="setFilterMatchModes(col.field)" sortable>
            <template #header>
                <span class="whitespace-nowrap">
                    {{ col.header }}
                </span>
            </template>
            
            <template #filter="{ filterModel, filterCallback }" v-if="filters.hasOwnProperty(col.field)">
                <Calendar v-if="col.field === 'created_at'" v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" mask="99/99/9999" />
                <InputText v-else v-model="filterModel.value" type="text" @keydown.enter="filterCallback()" class="p-column-filter" />
            </template>
            <template #filterclear="{ filterCallback }">
                <Button type="button" @click="() => { filterCallback(); onFilterClear(col.field); }" label="Clear" outlined class="clear-btn" />
            </template>

            <!--<template #filterapply="{ filterCallback }">
                <Button type="button" label="Apply" @click="() => { filterCallback(); onFilter($event) }" severity="success" />
            </template>-->

            <template #body="{ data }">
                <template v-if="col.field === 'audited_changes'">
                    <template v-for="(item, index) in data[col.field]" :key="index">
                        <template v-if="item.patch">
                            <!-- Iterate over the lines in the patch so we can apply styles -->
                            <div class="patch-diff">
                                <template v-for="(line, index) in item?.patch.split('\n')" :key="index">
                                    <div v-if="isAddition(line)" class="text-added">{{ line }}</div>
                                    <div v-else-if="isRemoval(line)" class="text-removed">{{ line }}</div>
                                    <div v-else>{{ line }}</div>
                                </template>
                            </div>
                        </template>
                        <template v-else>
                            Patch not found
                        </template>
                    </template>
                </template>
                <template v-else>
                    <div class="whitespace-nowrap">{{ formattedValue(data[col.field], col.field) }}</div>
                </template>
            </template>
        </Column>
    </DataTable>

    <CSVExportDialog :csvDialogVisible="csvDialogVisible" :downloadPath="csvDownloadPath" @closeCSVExportDialog="closeCSVDialog" />

</template>

<script setup>
    import { ref, onMounted, computed, watch, toRaw } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    import moment from 'moment-timezone'
    import { useStore } from 'vuex'
    import { useFormatDate } from '@/composable/formatDate.js'
    import { useDateTimeZoneOptions } from '@/composable/dateTimeZoneOptions.js'
    import { useFilterMatchModes } from '@/composable/filterMatchModes.js'
    import loadingImg from '@/assets/images/trivial-loading-optimized.webp'
    import CSVExportDialog from '@/components/sales/CSVExportDialog'

    const auditRows = ref([]),
        loading = ref(false),
        rows = ref(50),
        first = ref(0),
        totalRecords = ref(0),
        rowsPerPageOpt = [10, 20, 50],
        csvDialogVisible = ref(false),
        sortField = ref(null),
        sortOrder = ref(null),
        queryFilters = ref([]),
        filters = ref({}),
        columns = [
            { field: 'created_at', header: 'Timestamp' },
            { field: 'user_id', header: 'User ID' },
            { field: 'user_name', header: 'User' },
            { field: 'reference_type', header: 'Object' },
            { field: 'reference_id', header: 'ID' },
            { field: 'reference_name', header: 'Name' },
            { field: 'audited_changes', header: 'Description' },
        ],
        selectOrgMsgInfo = 'Please, select an organization.'

    const store = useStore(),
        router = useRouter(),
        route = useRoute(),
        { dateOptions, timeOptions, timeZoneOptions } = useDateTimeZoneOptions(),
        timezone = timeZoneOptions.timeZone,
        { dateFilterMatchModes, textFilterMatchModes, filterMatchModeMapping, globalFilterFields } = useFilterMatchModes()

    let page = ref(1) // Default start page is from first,

    const orgId = computed(() => store.getters.getOrgId)
    const register = computed(() => store.getters.getRegister)
    const ptOptions = computed(() => ({
        column: {
            bodycell: ({ state }) => ({ class: [{ 'pt-0 pb-0': state['d_editing'] }] }),
            columnFilter: ({ props }) => ({ class: [{ 'active__col--filter': filters.value[props.field]?.constraints[0].value }] })
        }
    }))

    const defaultFilters = ref({
        user_id: { constraints: [{ value: null, matchMode: 'equals' }] },
        created_at: { operator: 'and', constraints: [{ value: null, matchMode: 'dateIs' }]
        }
    })


    watch(orgId, async (newVal) => loadAuditData())

    onMounted(async () => {
        if (Object.keys(route.query).length) {
            getQueryFilters(route.query)
            setQueryFilters()
        }
        filters.value = toRaw(defaultFilters.value)
        loadAuditData()
    })

    const isAddition = line => line.startsWith('+') || line.startsWith('[created]')
    const isRemoval = line => line.startsWith('-') || line.startsWith('[destroyed]')

    const loadAuditData = async () => {
        if (!orgId.value) {
            auditRows.value = []
            return
        }
        loading.value = true
        try {
            const response = await store.state.Session.apiCall(`/organizations/${orgId.value}/audits?${queryString.value}`)
            auditRows.value = response.audits.map(audit => ({
                ...audit,
                created_at: new Date(audit.created_at),
            }))
            totalRecords.value = (response?.total_pages || 0) * parseInt(rows.value)
        } catch (err) {
            console.error(err)
        } finally {
            loading.value = false
        }
    }

    const openCSVDialog = () => csvDialogVisible.value = true
    const closeCSVDialog = () => csvDialogVisible.value = false
    const setFilterMatchModes = field => field === 'created_at' ? dateFilterMatchModes : textFilterMatchModes

    const setQueryFilters = () => {
        let dateMatchModes = ['dateIs', 'dateAfter', 'dateBefore']
        filters.value.created_at.constraints.pop()
        queryFilters.value.forEach(({ key, value, matchMode }) => {
            key === 'created_at' ? filters.value[key].constraints.push({value: new Date(value), matchMode}) : filters.value[key] = {constraints: [{ value, matchMode}]}
        })
    }

    const formattedValue = (value, column) => {
        return column === 'created_at' ? useFormatDate(value, dateOptions) + ' at ' + useFormatDate(value, timeOptions) : value
    }

    const csvDownloadPath = computed(() => {
        return `/organizations/${orgId.value}/audits.csv?${queryString.value}`
    })

    const queryString = computed(() => {
        let query = `per_page=${rows.value}&page=${page.value}`;
        const filtersArray = [];

        if (sortField.value) query += `&order_by=${sortField.value}&ordering_direction=${sortOrder.value}`

        // NOTE This is duplicated in SalesView.vue, and should be turned into a class specific to
        //      mapping the filters we get from the UI to the filters the API expects for dates
        Object.entries(filters.value).forEach(([column, filter]) => {
            filter.constraints?.forEach(constraint => {
                let value = constraint.value
                if (value) {
                    if (column === 'created_at' && filterMatchModeMapping[constraint.matchMode] === '=') {
                        // Date filter 'Date is'
                        let selectedDate = {
                            c: column,
                            o: filterMatchModeMapping.gte, // ">=",
                            p: moment(value).tz(timezone).startOf('day').utc().format() // midnight on the specified date
                        },
                        tomorrowDate = {
                            c: column,
                            o: filterMatchModeMapping.lt, // "<",
                            p: moment(value).tz(timezone).add({ days: 1 }).startOf('day').utc().format() // midnight on the next day
                        }

                        filtersArray.push(selectedDate, tomorrowDate)
                    } else if (column === 'created_at' && filterMatchModeMapping[constraint.matchMode] === '>') {
                        // Date filter 'Date is on or after'
                        filtersArray.push({
                            c: column,
                            o: filterMatchModeMapping[constraint.matchMode],
                            p: moment(value).tz(timezone).startOf('day').utc().format()
                        })
                    } else if (column === 'created_at' && filterMatchModeMapping[constraint.matchMode] === '<') {
                        // Date filter 'Date is on or before'
                        filtersArray.push({
                            c: column,
                            o: filterMatchModeMapping[constraint.matchMode],
                            p: moment(value).tz(timezone).endOf('day').utc().format()
                        })
                    } else {
                        filtersArray.push({
                            c: column,
                            o: filterMatchModeMapping[constraint.matchMode],
                            p: value
                        })
                    }
                }


            })
        })

        return filtersArray.length ? `${query}&search=${encodeURIComponent(JSON.stringify(filtersArray))}` : query
    })

    const onFilter = async event => {
        // Reset pagination when filters are applied
        page.value = 1
        first.value = 1
        loadAuditData()
    }

    const onFilterClear = async field => {
        // Reset the value of the filter field without losing reactivity
        filters.value[field].constraints.forEach(constraint => {
            constraint.value = null
        })
        page.value = 1
        first.value = 1
        loadAuditData()
    }

    const onPage = async event => {
        first.value = event.first || 0
        rows.value = event.rows || 10
        page.value = event.page + 1
        loadAuditData()
    }

    const onSort = async event => {
        sortField.value = event.sortField
        sortOrder.value = event.sortOrder === 1 ? 'ASC' : 'DESC'
        loadAuditData()
    }
</script>
