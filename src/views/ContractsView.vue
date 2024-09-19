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
          <h3 class="text-center">Loading ...</h3>
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
            <template v-if="(data.totalErrors > 0 || data.totalSuccess > 0) && data.stats && data.stats.length">
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
  import { ref, computed, watch, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import loadingImg from '@/assets/images/trivial-loading-optimized.webp'
  import { useFilterMatchModes } from '@/composable/filterMatchModes.js'

  const store = useStore(),
    selectedContract = ref(null),
    selectOrgMsgInfo = 'Please, select an organization.',
    columns = [
      { field: 'descriptive_name', header: 'Contract Name' },
      { field: 'stats', header: 'Activity' },
    ],
    loading = ref(false),
    rows = ref(50),
    rowsPerPageOpt = [10, 20, 50],
    first = ref(0),
    totalRecords = ref(0),
    { dateFilterMatchModes, textFilterMatchModes, defaultMatchMode, globalFilter } = useFilterMatchModes(),
    filters = ref({
      global: { value: null, matchMode: globalFilter },
      descriptive_name: { value: null, matchMode: defaultMatchMode },
    }),
    globalFilterFields = ['descriptive_name'],
    activityPopup = ref([]),
    activityQueryStr500 = "[{'name':'status','operator':'=','value':'500'}]",
    activityQueryStr200 = "[{'name':'status','operator':'=','value':'200'}]",
    activityQueryStr500Encoded = ref(''),
    activityQueryStr200Encoded = ref(''),
    op = ref([])

  let contracts = ref([])

  const orgId = computed(() => store.getters.getOrgId)
  const currentUser = computed(() => store.state.user)
  const computedContracts = computed(() => contracts.value)

  watch(currentUser, async newVal => {
    if (newVal) {
      await initContracts(newVal.id)
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
        const appsPermissions = await setAppPermits(apps, userId)
        const orgContracts = getOrgContracts(appsPermissions)
        contracts.value = await getAppActivity(orgContracts)
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

  const getOrgContracts = appsPerm => appsPerm.filter(item => item.owner_id === orgId.value && item.owner_type === 'Organization' && item.panels.component === 'Contract')

  const setAppPermits = async (apps, id) => {
    try {
      const appsPermissions = await store.state.Session.apiCall(`/users/${id}/permissions`)

      return apps.map(app => ({ ...app, ...appsPermissions?.update?.app_names.find(item => app.name === item.app) }))
    } catch (err) {
      console.log(err)
    }
  }

  const getAppActivity = async contracts => {
    try {
      const appActivity = await Promise.all(
        contracts.map(async (app, index) => {
          // Initialize error count and flag for updating
          let totalErrors = 0,
            totalSuccess = 0
          app.canUpdate = true

          // Fetch app stats
          app.stats = await store.state.Session.apiCall(`/activity_entries/stats?app_id=${app.name}`)

          // Calculate maximum total count from stats
          const maxTotal = app?.stats.reduce((max, item) => {
            const total = Object.values(item?.count).reduce((sum, value) => sum + value, 0)
            return Math.max(max, total)
          }, 0)

          // Process each stat entry
          app.stats.forEach(item => {
            const hasError = item?.count?.['500'] ?? false,
              hasSuccess = item?.count?.['200'] ?? false,
              total = Object.values(item?.count).reduce((sum, value) => sum + value, 0)

            item.hasErrors = !!hasError // Check if there are errors
            item.hasSuccess = !!hasSuccess
            totalErrors += hasError ? item?.count['500'] : 0 // Accumulate errors
            totalSuccess += item?.count.hasOwnProperty('200') ? item?.count['200'] : 0 // Accumulate success
            item.total = total // Total count for the item
            item.proportionalHeight = Math.round((item.total / maxTotal) * 20) || 1 // Proportional height for the item
          })

          // Set index only if there are errors
          app.opIndex = (totalErrors || !!totalSuccess) ? index : false
          app.totalErrors = totalErrors
          app.totalSuccess = totalSuccess > 1000 ? (totalSuccess / 1000) + 'k' : totalSuccess

          return app
        })
      )

      return appActivity
    } catch (error) {
      console.error('Error fetching app activity:', error)
    }
  }
</script>