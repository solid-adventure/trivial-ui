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
        <div class="flex justify-content-between py-5">
          <div class="flex align-content-center gap-5">
            <h2 class="m-0 line-height-3">Customer Contracts</h2>
            <Dropdown v-model="selectedContract" :options="dropdownContracts" optionLabel="name" placeholder="Select a Contract" class="w-14rem" />
          </div>
          <div>
            <router-link to="/apps/new?paneltype=contract" rel="noopener">
              <Button label="Add New Contract" icon="pi pi-plus" />
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
          <Button type="button" @click="() => { filterCallback(); onFilterClear(col.field); }" label="Clear" outlined class="clear-btn" />
        </template>
        <template #filterapply="{ filterCallback }">
          <Button type="button" @click="filterCallback()" label="Apply" severity="success" class="clear-btn" />
        </template>

        <template #body="{ data, field, index }">
          <span v-if="field === 'descriptive_name'">
            <router-link :to="`/apps/${data.name}`" rel="noopener">
              {{ data[field] }}
            </router-link>
          </span>
          <!--<span v-else-if="field === 'created_at'">{{ useFormatDate(data[field]) }}</span>-->
          <span v-else-if="field === 'stats'">
            <Button type="button" link size="large" text aria-label="Chart Info" @click="toggleActivityPopup(index, $event)" class="p-2">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="20" width="26" class="chart">
                  <!--<g class="bar" :class="{ 'error-fill': false, 'success-fill': true }" transform="translate(0,0)">
                    <rect height="10" y="10" width="2"></rect>
                  </g>
                  <g class="bar" :class="{ 'error-fill': true, 'success-fill': false }" transform="translate(3,0)">
                    <rect height="6" y="14" width="2"></rect>
                  </g>
                  <g class="bar" :class="{ 'error-fill': false, 'success-fill': true }" transform="translate(6,0)">
                    <rect height="20" y="4" width="2"></rect>
                  </g>
                  <g class="bar" :class="{ 'error-fill': false, 'success-fill': true }"transform="translate(9,0)">
                    <rect height="10" y="10" width="2"></rect>
                  </g>
                  <g class="bar" :class="{ 'error-fill': false, 'success-fill': true }" transform="translate(12,0)">
                    <rect height="9" y="11" width="2"></rect>
                  </g>
                  <g class="bar" :class="{ 'error-fill': false, 'success-fill': true }" transform="translate(15,0)">
                    <rect height="10" y="10" width="2"></rect>
                  </g>
                  <g class="bar" :class="{ 'error-fill': true, 'success-fill': false }" transform="translate(18,0)">
                    <rect height="17" y="6" width="2"></rect>
                    
                  </g>-->

                  <g v-for="(item, index) in data.stats" :key="index" class="bar mr-1" :class="{ 'error-fill': item.hasErrors, 'success-fill': !item.hasErrors }" :transform="`translate(${index * 3}, 0)`">
                    <rect :height="barHeight[index]" width="2" :y="`${20 - barHeight[index]}`" />
                  </g>
              </svg>
            </Button>

            <OverlayPanel ref="activityPopup">
              <div class="flex flex-column justify-content-start align-items-center w-10rem h-8rem">
                <p class="w-full mt-1 mb-2 text-base text-500">Last {{ activityPeriod(data.stats) }} days</p>
                <p class="w-full m-1">
                  <i class="pi mr-2" :class="{ 'pi-times-circle text-red-600': data.totalErrors > 0, 'pi-check-circle text-primary-500': data.totalErrors == 0 }" /> 
                  <span class="text-lg font-semibold" :class="{ 'text-red-600': data.totalErrors > 0, 'text-primary-500': data.totalErrors == 0 }">{{ data.totalErrors }} Errors</span>
                </p>

                <Divider />
                <router-link :to="`/apps/${data.name}/activity?search=${activityQueryStrEncoded}`" rel="noopener" class="w-full flex justify-content-start align-items-center">
                  <Button label="View Activity" icon="pi pi-external-link" iconPos="right" link class="p-1 text-md font-medium text-blue-500" />
                </router-link>
              </div>
            </OverlayPanel>
          </span>
          <span v-else>{{ data[field] }}</span>
        </template>
      </Column>
      <Column class="org-settings__table__action">
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
  import { ref, computed, watch, onMounted, toRaw } from 'vue'
  import { useStore } from 'vuex'
  import { useFormatCurrency } from '@/composable/formatCurrency.js'
  import { useFormatDate } from '@/composable/formatDate.js'
  import { useFilterMatchModes } from '@/composable/filterMatchModes.js'
  import loadingImg from '@/assets/images/trivial-loading-optimized.webp'
  
  const store = useStore(),
    selectedContract = ref(),
    dropdownContracts = ref([
      { name: 'All Contract' },
      { name: 'Active' },
      { name: 'Archived' }
    ]),
    selectOrgMsgInfo = 'Please, select an organization.',
    columns = [
      { field: 'descriptive_name', header: 'Customer' },
      //{ field: 'created_at', header: 'Start Date' },
      { field: 'stats', header: 'Errors' },
    ],
    loading = ref(false),
    rows = ref(10),
    rowsPerPageOpt = [10, 20, 50],
    first = ref(0),
    totalRecords = ref(0),
    barHeight = ref([10, 6, 16, 10, 8, 12, 18]),
    filters = ref({
      "created_at": {"operator": "and", "constraints": [{"value": null, "matchMode": "dateIs"}]},
      "descriptive_name": {"constraints": [{"value": null, "matchMode": "equals"}]}
    }),
    { dateFilterMatchModes, textFilterMatchModes } = useFilterMatchModes(),
    globalFilterFields = ['descriptive_name', 'created_at'],
    activityPopup = ref([]),
    activityQueryStr = "[{'c':'status','o':'=','p':'500'}]",
    activityQueryStrEncoded = encodeURIComponent(JSON.stringify(JSON.parse(activityQueryStr.replace(/'/g, '"'))))

  let contracts = ref([]),
    stats = ref([]),
    apps = [],
    appsPermissions = [],
    orgContracts = []

  const orgId = computed(() => store.getters.getOrgId)
  const currentUser = computed(() => store.getters.getUser)
  const computedContracts = computed(() => contracts.value)

  onMounted(async () => {
    await initContracts()
  })

  const initContracts = async () => {
    loading.value = true
    apps = await getApps()
    appsPermissions = await setAppPermits(apps)
    orgContracts = await getOrgContracts(appsPermissions)
    await getAppActivity(orgContracts)
    totalRecords.value = totalPaginatorPages(contracts.value.length, rows.value)
    loading.value = false
  }

  const getApps = async () => {
    try {
      return await store.state.Session.apiCall('/apps')
    } catch (err) {
      console.log(err)
    }
  }

  const getOrgContracts = appsPerm => {
    return appsPerm.filter(item => item.owner_id === orgId.value && item.owner_type === 'Organization' && item.panels.component === 'Contract')
  }

  const setAppPermits = async apps => {
    let tempArr = [],
      appsPermissions = null

    try {
      appsPermissions = await store.state.Permissions.load()
    } catch (err) {
      console.log(err)
    }

    tempArr = apps.map(app => {
      if(appsPermissions?.update?.app_names.includes(app?.name)) {
        app.canUpdate = true
        return app
      }
    })

    return tempArr
  }

  const getAppActivity = apps => {
    apps.forEach(async app => {
      let totalErrors = 0

      try {
        app.stats = await store.state.Session.apiCall(`/activity_entries/stats?app_id=${app.name}`)

        app.stats.forEach(item => {
          item.hasErrors = item?.count.hasOwnProperty('500') ? true : false
          totalErrors += item?.count['500'] || 0
        })

        app.totalErrors = totalErrors

        contracts.value.push(app)
      } catch (err) {
        console.log(err)
      }
    })

    //return apps
  }

  const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
  const activityPeriod = item => item.length
  const getTotalErrors = item => item.totalErrors
  const toggleActivityPopup = (index, event) => activityPopup.value[index].toggle(event)
  const totalPaginatorPages = (totalItems, itemsPerPage) => totalItems / itemsPerPage
  const setFilterMatchModes = field => field === 'created_at' ? dateFilterMatchModes : textFilterMatchModes
  const onFilterClear = async field => {
    /*loading.value = true

    if (filters.value.hasOwnProperty(field)) {
      setDefaultFilters(field)
    }

    try {
      page = 1
      const queryString = updateQueryString()
      const { register_items } = await getRegistersData(queryString)
      registers.value = register_items
      // await getTotalAmount()
      loading.value = false
    } catch (err) {
      console.error(err)
    }

    loading.value = false*/
  }

  //const getContracts = async type => await store.state.Session.apiCall(`apps/stats/${type}`)

  //{"created_at":{"operator":"and","constraints":[{"value":null,"matchMode":"dateIs"}]},"descriptive_name":{"constraints":[{"value":null,"matchMode":"equals"}]}}
</script>
