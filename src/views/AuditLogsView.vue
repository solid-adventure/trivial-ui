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
                    <p v-for="(item, index) in data[col.field]" :key="index" class="flex flex-column max-w-24rem m-0" :class="{'text-hidden': index > 9}">
                        <template v-if="item.patch">
                            <!-- Iterate over the lines in the patch so we can apply styles -->
                            <div class="patch-diff" :class="{'text-ellipsis': item?.patch.split('\n').length > 10}">
                                <template v-for="(line, index) in item?.patch.split('\n')" :key="index">
                                    <div v-if="line.startsWith('+')" class="text-added">{{ line }}</div>
                                    <div v-else-if="line.startsWith('-')" class="text-removed">{{ line }}</div>
                                    <div v-else>{{ line }}</div>
                                </template>
                            </div>
                        </template>
                        <template v-else>
                            Patch not found
                        </template>

                        <router-link v-if="index === 9 || item?.patch.split('\n').length > 10" :to="`/audits/${data.id}`" rel="noopener" class="w-5 inline-block details__link">
                            <Button label="View Details" link class="text-sm" icon="pi pi-link" iconPos="right" />
                        </router-link>
                    </p>
                </template>
                <template v-else>
                    <div class="whitespace-nowrap">{{ formattedValue(data[col.field], col.field) }}</div>
                </template>
            </template>
        </Column>
    </DataTable>

    <CSVExportDialog :csvDialogVisible="csvDialogVisible" :regId="register?.id" :queryString="queryString" :registerName="register?.name" @closeCSVExportDialog="closeCSVDialog" />
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
        filters = ref({
          id: { constraints: [{ value: null, matchMode: 'equals' }] },
          user_id: { constraints: [{ value: null, matchMode: 'equals' }] },
          created_at: { operator: 'and', constraints: [{ value: null, matchMode: 'dateIs' }] }
        }),
        columns = [
            { field: 'id', header: 'Audit ID' },
            { field: 'user_id', header: 'User ID' },
            { field: 'user_name', header: 'User' },
            { field: 'reference_type', header: 'Object' },
            { field: 'reference_id', header: 'ID' },
            { field: 'reference_name', header: 'Name' },
            { field: 'audited_changes', header: 'Description' },
            { field: 'created_at', header: 'Timestamp' }
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

    watch(orgId, async newVal => newVal ? await loadAuditData() : auditRows.value = [])

    onMounted(async () => {
        if (Object.keys(route.query).length) {
            getQueryFilters(route.query)
            setQueryFilters()
        }
        await loadAuditData()
    })

    const loadAuditData = async () => {
        if (!orgId.value) return
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
    const clearQueryParams = () => router.replace({ path: route.path, query: {} })

    const resetQueryFilters = () => {
        queryFilters.value = []
        filters.value = {
            id: { constraints: [{ value: null, matchMode: 'equals' }] },
            user_id: { constraints: [{ value: null, matchMode: 'equals' }] },
            created_at: { operator: 'and', constraints: [{ value: null, matchMode: 'dateIs' }] }
        }
    }

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

    const queryString = computed(() => {
        let query = `per_page=${rows.value}&page=${page.value}`;
        const filtersArray = [];

        if (sortField.value) query += `&order_by=${sortField.value}&ordering_direction=${sortOrder.value}`

        Object.entries(filters.value).forEach(([key, { constraints }]) => {
            constraints?.forEach(({ value, matchMode }) => {
                if (value) {
                    const filterItem = { c: key, o: filterMatchModeMapping[matchMode], p: key === 'created_at' ? moment(value).tz(timezone).format() : value }
                    filtersArray.push(filterItem)
                }
            })
        })

        return filtersArray.length ? `${query}&search=${encodeURIComponent(JSON.stringify(filtersArray))}` : query
    })

    const getQueryFilters = async query => {
        // Set pagination and sorting parameters
        rows.value = parseInt(query?.per_page) || 10
        page.value = parseInt(query?.page) || 1
        sortField.value = query?.order_by || null
        sortOrder.value = query?.ordering_direction || null

        // Handle 'search' query parameter
        if (query?.search) {
            try {
                const filtersArray = JSON.parse(query.search) // Parse the search query array

                // Clear existing query filters
                queryFilters.value = []

                // Map each filter item to the appropriate format
                filtersArray.forEach(({ c: column, o: operator, p: value }) => {
                    let filterObj = { key: column, value, matchMode: null }

                    // Determine match mode based on the column and operator
                    if (column === 'created_at' && moment(value).isValid()) {
                        switch (operator) {
                            case '>=':
                                filterObj.matchMode = 'dateAfter'
                                filterObj.value = moment(value).tz(timezone).format('L')
                                break
                            case '<':
                                filterObj.matchMode = 'dateBefore'
                                filterObj.value = moment(value).tz(timezone).format('L')
                                break
                            case '=':
                                filterObj.matchMode = 'dateIs'
                                filterObj.value = moment(value).tz(timezone).format('L')
                                break
                        }
                    } else {
                        // Set match mode for other columns
                        switch (operator) {
                            case '=':
                                filterObj.matchMode = 'equals'
                                filterObj.value = value
                                break
                            case '!=':
                                filterObj.matchMode = 'notEquals'
                                filterObj.value = value
                                break
                        }
                    }

                    // Push configured filter if match mode is set
                    if (filterObj.matchMode) {
                        queryFilters.value.push(filterObj)
                    }
                });
            } catch (error) {
                console.error('Error parsing search parameter:', error)
            }
        }
    }

    const onFilter = async event => {
        filters.value = event.filters // Update the filters with the new values

        // Reset pagination when filters are applied
        page.value = 1
        first.value = 1

        try {
            // Reload data with the new filters
            await loadAuditData()
        } catch (err) {
            console.error('Error during filtering:', err)
        }
    }

    const onFilterClear = async field => {
        // Reset filters and query parameters specific to 'created_at' or other fields
        if (field === 'created_at') {
            resetQueryFilters()
            clearQueryParams()
        }

        // Reset the filter for the specific field to its default state
        setDefaultFilters(field)

        try {
            // Reset pagination and load the data with cleared filters
            page.value = 1
            await loadAuditData();
        } catch (err) {
            console.error('Error clearing filter:', err);
        }
    }

    const onPage = async event => {
        first.value = event.first || 0
        rows.value = event.rows || 10
        page.value = event.page + 1
        await loadAuditData()
    }

    const onSort = async event => {
        sortField.value = event.sortField
        sortOrder.value = event.sortOrder === 1 ? 'ASC' : 'DESC'
        await loadAuditData()
    }
</script>
