<template>
  <Panel class="border-round-lg shadow-2">
    <DataTable
      v-model:filters="filters"
      :value="computedContracts" 
      :loading="loading"
      :rows="rows" 
      :first="first"
      :totalRecords="totalRecords"
      :rowsPerPageOptions="rowsPerPageOpt"  
      paginator
      tableStyle="max-width: 100%" 
      dataKey="id"
      filterDisplay="menu"
      scrollable
      :globalFilterFields="globalFilterFields"
    >
      <template #header>
        <div class="flex justify-content-between gap-5 py-5">
          <div class="flex align-content-center gap-5">
            <h2 class="m-0 line-height-3">Contracts</h2>
            <div class="flex justify-content-end">
              <IconField iconPosition="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters['global'].value" placeholder="Search" class="text-base font-normal text-500 contracts__search" />
              </IconField>
            </div>
          </div>
          <div>
            <router-link to="/apps/new?paneltype=contract" rel="noopener">
              <Button label="Add New Contract" icon="pi pi-plus" class="contract__add--btn" />
            </router-link>
          </div>
        </div>
      </template>
      <template #empty>
        <h3 v-if="!orgId">{{ selectOrgMsgInfo }}</h3>
        No contracts found.
      </template>
      <template #loading>
        <div class="flex align-content-center justify-content-center flex-column">
          <Image :src="loadingImg" alt="Loader" width="160" />
        </div>
      </template>

      <Column v-for="(col, index) in columns" :key="col.field" :field="col.field" :header="col.header" :sortable="col.field !== 'stats'" filter :filterMatchModeOptions="setFilterMatchModes(col.field)">
        <template v-if="col.field !== 'stats'" #filter="{ filterModel, filterCallback }">
          <Calendar v-if="col.field === 'created_at'" v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" mask="99/99/9999" />
          <InputText v-else v-model="filterModel.value" type="text" @keydown.enter="filterCallback()" class="p-column-filter" />
        </template>
        <template #filterclear="{ filterCallback }">
          <Button type="button" @click="filterCallback()" label="Clear" outlined class="clear-btn" />
        </template>
        <template #filterapply="{ filterCallback }">
          <Button type="button" @click="filterCallback()" label="Apply" severity="success" class="clear-btn" />
        </template>

        <template #body="{ data, field, index }">
          <span v-if="field === 'descriptive_name'">
              {{ data[field] }}
          </span>
          <span v-else-if="field === 'stats'">
              <!-- CUSTOM HOVER ELEMENT -->
              <!--<div class="contract_tooltip">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="20" width="26" class="chart">
                <g v-for="(item, index) in data.stats" :key="index">
                  <rect
                    :x="index * 4"
                    :y="20 - item.proportionalHeight"
                    width="2"
                    :height="item.proportionalHeight"
                    :class="{ 'error-fill': item.hasErrors, 'success-fill': !item.hasErrors }"
                  />
                </g>
              </svg>

              <div class="flex flex-column justify-content-start align-items-center w-11rem h-9rem p-3 shadow-2 border-round-sm bg-white tooltip_content">
                <p class="w-full mt-1 mb-2 text-base text-500">Last {{ activityPeriod(data.stats) }} days</p>
                <router-link :to="`/apps/${data.name}/activity?search=${activityQueryStrEncoded}`" rel="noopener" class="w-full m-1">
                  <i class="pi mr-2" :class="{ 'pi-times-circle text-red-600': data.totalErrors > 0, 'pi-check-circle text-primary-500': data.totalErrors == 0 }" /> 
                  <span class="text-lg font-semibold" :class="{ 'text-red-600': data.totalErrors > 0, 'text-primary-500': data.totalErrors == 0 }">{{ data.totalErrors }} Errors</span>
                </router-link>

                <Divider />
                <router-link :to="`/apps/${data.name}/activity`" rel="noopener" class="w-full flex justify-content-start align-items-center">
                  <Button label="View Activity" icon="pi pi-external-link" iconPos="right" link class="p-1 text-md font-medium text-blue-500" />
                </router-link>
              </div>
            </div>-->

            <!-- PRIMEVUE CLICK VERSION (DEFAULT - WORKING) -->
            <template v-if="data.stats.loading === true">
              <div class="flex align-content-center justify-content-center flex-column">
                <Image :src="loadingImg" alt="Loader" width="40" />
              </div>
            </template>
            <template v-else-if="(data.totalErrors > 0 || data.totalSuccess > 0) && data.stats && data.stats.length">
              <div>
                <Button type="button" severity="secondary" text @click="togglePopup(data.opIndex, $event)">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="20" width="26" class="chart">
                    <g v-for="(item, idx) in data.stats" :key="idx">
                      <rect
                        :x="idx * 4"
                        :y="20 - item.proportionalHeight"
                        width="2"
                        :height="item.proportionalHeight"
                        :class="{ 'error-fill': item.hasErrors, 'success-fill': !item.hasErrors }"
                      />
                    </g>
                  </svg>
                </Button>
                <OverlayPanel ref="op">
                  <div class="flex flex-column justify-content-start align-items-center">
                    <p class="w-full mt-1 mb-2 text-base text-500">Last {{ activityPeriod(data.stats) }} days</p>
                    <router-link :to="`/apps/${data.name}/activity?search=${activityQueryStr500Encoded}`" rel="noopener" class="w-full m-1">
                      <i class="pi pi-times-circle text-red-600" />
                      <span class="ml-2 text-lg font-semibold text-red-600">{{ data.totalErrors }} Errors</span>
                    </router-link>
                    <router-link :to="`/apps/${data.name}/activity?search=${activityQueryStr200Encoded}`" rel="noopener" class="w-full m-1 activity__success--link">
                      <i class="pi pi-check-circle" />
                      <span class="ml-2 text-lg font-semibold">{{ data.totalSuccess }} Success</span>
                    </router-link>
                    <Divider />
                    <router-link :to="`/apps/${data.name}/activity`" rel="noopener" class="w-full flex justify-content-start align-items-center">
                      <Button label="View Activity" icon="pi pi-external-link" iconPos="right" link class="p-1 text-md font-medium text-blue-500" />
                    </router-link>
                  </div>
                </OverlayPanel>
              </div>
            </template>
            <template v-else>
              <i class="pi pi-minus text-color-secondary ml-3" />
            </template>
          </span>
        </template>
      </Column>

      <Column class="org-settings__table__action text-center">
        <template #body="{ data, field }">
          <router-link v-if="data.canUpdate" :to="`/apps/${data.name}/builder2`" rel="noopener">
            <Button icon="pi pi-pencil" severity="secondary" text rounded aria-label="Edit" />
          </router-link>
        </template>
      </Column>
    </DataTable>
  </Panel>
</template>

<script setup>
  import { ref, reactive, computed, watch, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import loadingImg from '@/assets/images/trivial-loading-optimized.webp'
  import { useFilterMatchModes } from '@/composable/filterMatchModes.js'

  const store = useStore(),
    { dateFilterMatchModes, textFilterMatchModes, defaultMatchMode, globalFilter } = useFilterMatchModes(),
    activityPopup = ref([]),
    activityQueryStr200 = "[{'name':'status','operator':'=','value':'200'}]",
    activityQueryStr200Encoded = ref(''),
    activityQueryStr500 = "[{'name':'status','operator':'=','value':'500'}]",
    activityQueryStr500Encoded = ref(''),
    columns = [
      { field: 'descriptive_name', header: 'Contract Name' },
      { field: 'stats', header: 'Activity' },
    ],
    contracts = ref([]),
    filters = ref({
      global: { value: null, matchMode: globalFilter },
      descriptive_name: { value: null, matchMode: defaultMatchMode },
    }),
    first = ref(0),
    globalFilterFields = ['descriptive_name'],
    loading = ref(false),
    op = ref([]),
    rows = ref(50),
    rowsPerPageOpt = [10, 20, 50],
    selectedContract = ref(null),
    selectOrgMsgInfo = 'Please, select an organization.',
    totalRecords = ref(0)

  const orgId = computed(() => store.getters.getOrgId)
  const currentUser = computed(() => store.state.user)
  const computedContracts = computed(() => contracts.value)

  watch(currentUser, async newVal => {
    if (newVal) {
      await initContracts(newVal.id)
    }
  })

  watch(contracts, async (newContracts) => {
    if(newContracts.length > 0) {
      getActivity()
    }
  })

  onMounted(async () => {
    if (currentUser.value?.id) {
      await initContracts(currentUser.value.id)
    }
    activityQueryStr500Encoded.value = encodeURIComponentStr(activityQueryStr500)
    activityQueryStr200Encoded.value = encodeURIComponentStr(activityQueryStr200)
  })

  const togglePopup = (index, event) => op.value[index]?.toggle(event)
  const activityPeriod = item => item.length
  const setFilterMatchModes = field => field === 'created_at' ? dateFilterMatchModes : textFilterMatchModes
  const encodeURIComponentStr = str => encodeURIComponent(JSON.stringify(JSON.parse(str.replace(/'/g, '"'))))

  const initContracts = async (userId) => {
    loading.value = true
    try {
      const apps = await getApps()
      if (apps) {
        contracts.value = filterAndInitContracts(apps)
        totalRecords.value = Math.ceil(contracts.value.length / rows.value)
      }
    } catch (err) {
      console.log('Error fetching contracts:', err)
    } finally {
      loading.value = false
    }
  }

  const getApps = async () => {
    try {
      return await store.state.Session.apiCall('/apps')
    } catch (err) {
      console.log(err)
    }
  }

  const filterAndInitContracts = (apps) => {
    return apps.reduce((contracts, app) => {
      if (app.owner_id === orgId.value && app.owner_type === 'Organization' && app.panels.component === 'Contract') {
        contracts.push({ ...app, canUpdate: true, stats: reactive({ loading: true }) })
      }
      return contracts
    }, [])
  }

  const getActivity = async () => {
    try {
      contracts.value.forEach(async (app, index) => {
        // Fetch app stats
        let stats = await store.state.Session.apiCall(`/activity_entries/stats?app_id=${app.name}`)

        // Process each stat entry
        let maxTotal = 1
        let totalSuccess = 0
        let totalErrors = 0
        stats.forEach(item => {
          const successes = item.count['200'] ?? 0
          const errors = item.count['500'] ?? 0

          item.hasSuccess = successes > 0
          item.hasErrors = errors > 0
          item.total = successes + errors
          maxTotal = Math.max(maxTotal, item.total)

          totalErrors += errors
          totalSuccess += successes
        })
        stats.forEach(item => item.proportionalHeight = Math.round((item.total / maxTotal) * 20) || 1)

        // Set index only if there are errors
        app.opIndex = index
        app.totalErrors = totalErrors
        app.totalSuccess = totalSuccess > 1000 ? (totalSuccess / 1000).floor + 'k' : totalSuccess
        app.stats = { ...stats, loading: false }
      })
    } catch (error) {
      console.error('Error fetching app activity:', error)
    }
  }
</script>
