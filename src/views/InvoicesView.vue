<template>
  <Panel class="w-full shadow-2">
    <DataTable :value="invoices"
      :scrollable="true"
      :loading="loading"
      scroll-height="500px"
      size="small"
      :filters="filters"
      filterDisplay="menu"
      ref="dataTable"
      stripedRows
      >

      <template #header>
          <div class="flex justify-content-between py-5">
              <h2 class="m-0">Invoices</h2>
              <div class="flex items-center">
                <RouterLink to="/invoices/create">
                  <Button severity="secondary" class="mx-3">Create Invoices</Button>
                </RouterLink >
                <Button label="Export as CSV" aria-label="Download CSV" icon="pi pi-download" class="registers_table--csv-btn" @click="openCSVDialog('invoices')" :disabled="invoices.length === 0" />
              </div>
          </div>
      </template>

      <template #empty>
        <div class="flex justify-content-center align-items-center">
          <h2 class="font-semibold">No invoices to display</h2>
        </div>
      </template>

      <Column v-for="(column, index) in columns"
        :key="index"
        :field="column.field"
        :header="column.header"
        :headerClass="column.headerClass"
        :class="column.class"
        :sortable="column.sortable"
        :showAddButton="column.showAddButton"
        :showFilterOperator="column.showFilterOperator"
        :showFilterMatchModes="column.showFilterMatchModes"
        :filter="column.filter"
        >

        <template #filter="{ filterModel }" v-if="column.field === 'date'">
          <Calendar
              v-model="filters[column.field].constraints[0].value"
              dateFormat="mm/dd/yy"
              placeholder="Select Date"
              @date-select="closeFilter"
          />
        </template>

        <template #body="{ data, field }">
          <template v-if="field == 'total'">
            <RouterLink :to="`/invoices/${data.id}`">
              {{ useFormatCurrency(data[field], 2) }}
            </RouterLink>
          </template>

          <template v-else-if="field == 'date'">
             {{ formatDate(data[field]) }}
          </template>


          <template v-else-if="field =='backup'">

            <Button
              icon="pi pi-download"
              label="Export Backup"
              severity="secondary"
              @click="openCSVDialog('register_items', data.id)">
              Export Backup
            </Button>

          </template>

          <template v-else>
            <RouterLink :to="`/invoices/${data.id}`">
              {{ data[field] }}
            </RouterLink>
          </template>
        </template>

      </Column>
    </DataTable>

     <div class="headroom">
    </div>

  </Panel>

  <CSVExportDialog
    :csvDialogVisible="csvDialogVisible"
    :downloadPath="csvDownloadPath"
    @closeCSVExportDialog="closeCSVDialog"
  />

</template>

<script setup>
  import { ref, onMounted, computed, watch } from 'vue'
  import { useStore } from 'vuex'
  import { useFormatCurrency } from '@/composable/formatCurrency.js'
  import { searchFromFilter } from '@/composable/searchFromFilter'
  import CSVExportDialog from '@/components/sales/CSVExportDialog'
  import Calendar from 'primevue/calendar';
  import { FilterMatchMode, FilterOperator } from 'primevue/api';

  const loading = ref(false)
  const invoices = ref([])
  const orgId = computed(() => store.getters.getOrgId)
  const regId = computed(() => store.getters.getRegisterId)
  const store = useStore()
  const columns = ref([
    { field: 'id', header: 'ID', sortable: true },
    {
      field: 'date',
      header: 'Date',
      defaultFilter: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }]
      },
      showAddButton: false,
      showFilterOperator: false,
      showFilterMatchModes: false,
      sortable: true
    },
    { field: 'payee_name', header: 'Payee', sortable: true },
    { field: 'payor_name', header: 'Payor', sortable: true },
    { field: 'backup', header: 'Backup'},
    { field: 'total', header: 'Total', headerClass: 'header-right',  class: 'text-right font-bold', sortable: true },
  ])

  const filters = ref({})
  const searchParams = ref([])
  const csvDownloadPath = ref('')
  const csvDialogVisible = ref(false)
  const openCSVDialog = (resource, options) => {
    switch (resource) {
    case 'invoices':
      csvDownloadPath.value = `${apiUrl('csv')}`
      break
    case 'register_items':
      csvDownloadPath.value = `/register_items.csv?register_id=${regId.value}&search=[{"c":"invoice_id","o":"=","p":"${options}"}]`
      break
    default:
      throw "Unable to determine CSV path for resource"
    }
    csvDialogVisible.value = true
  }
  const closeCSVDialog = () => csvDialogVisible.value = false
  watch(orgId, async (newVal) => loadInvoices())

  onMounted(async () => {
    initFilters()
    loadInvoices()
  })

  const apiUrl = (format='json') => {
    let url = `/organizations/${orgId.value}/invoices.${format}`

    const searchParams = searchFromFilter(filters.value)
    if (searchParams.length > 0) {
        url += `?search=${[JSON.stringify(searchParams)]}`
    }
    return url
  }

  watch(filters, async (newVal) => {
    loadInvoices()
  }, {deep: true})

  const initFilters = () => {
    columns.value.forEach((column) => {
      if (column.defaultFilter) {
        filters.value[column.field] = column.defaultFilter
      }
    })
  }

  const loadInvoices = async () => {
      if (!orgId.value) {
          invoices.value = []
          return
      }
      loading.value = true
      try {
          const response = await store.state.Session.apiCall(apiUrl())
          invoices.value = response.invoices
          parseDates()

      } catch (err) {
          console.error(err)
      } finally {
          loading.value = false
      }
  }

  const parseDates = () => {
    invoices.value.forEach((invoice) => {
      invoice.date = new Date(invoice.date)
      // TODO Need to apply the TZ it was created in to guarantee the expected date.
      //      This will happen to be correct for EST/PST users but not for others.
    })
  }

  const formatDate = (value) => {
      return value.toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
      });
  };

  const closeFilter = () => {
    // The timeout lets us break out of the reactivity flow, and prevent it from immediately re-opening
    setTimeout(() => {
      document.body.click()
    }, 0)
  }

</script>

<style scoped>

.legroom {
  margin-bottom: 1rem
}

</style>