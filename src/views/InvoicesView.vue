<template>

  <Panel class="w-full shadow-2">
    <DataTable :value="tableData"
      :scrollable="true"
      :loading="loading"
      scroll-height="500px"
      size="small"
      >

      <template #header>
          <div class="flex justify-content-between py-5">
              <h2 class="m-0">Invoices</h2>
              <div class="flex items-center">
                <RouterLink to="/invoices/create">
                  <Button severity="secondary" class="mx-3">Create Invoices</Button>
                </RouterLink >
                <Button label="Export as CSV" aria-label="Download CSV" icon="pi pi-download" class="registers_table--csv-btn" @click="openCSVDialog" :disabled="tableData.length === 0" />
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
        :sortable="true">
          <template #body="{ data, field }">
            <RouterLink :to="`/invoices/${data.id}`">
              <template v-if="field == 'total'">
                {{ useFormatCurrency(data[field], 2) }}
              </template>
              <template v-else>
                {{ data[field] }}
              </template>
            </RouterLink>
          </template>
      </Column>
    </DataTable>

     <div class="headroom">
    </div>

  </Panel>


  <CSVExportDialog :csvDialogVisible="csvDialogVisible" :downloadPath="csvDownloadPath" @closeCSVExportDialog="closeCSVDialog" />
</template>

<script setup>
  import { ref, onMounted, computed, watch, toRaw } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useStore } from 'vuex'
  import { useFormatCurrency } from '@/composable/formatCurrency.js'
  import CSVExportDialog from '@/components/sales/CSVExportDialog'

  const loading = ref(false)
  const invoices = ref([])
  const orgId = computed(() => store.getters.getOrgId)
  const store = useStore()
  const tableData = ref([])
  const columns = ref([
    { field: 'id', header: 'ID' },
    { field: 'date', header: 'Date' },
    { field: 'payee_name', header: 'Payee' },
    { field: 'payor_name', header: 'Payor' },
    { field: 'total', header: 'Total', headerClass: 'header-right',  class: 'text-right font-bold' },
    ])
  const csvDialogVisible = ref(false)
  const openCSVDialog = () => csvDialogVisible.value = true
  const closeCSVDialog = () => csvDialogVisible.value = false
  const csvDownloadPath = computed(() => {
      return `/organizations/${orgId.value}/invoices.csv` // TODO add filters as search
  })
  watch(orgId, async (newVal) => loadInvoices())

  onMounted(async () => {
      loadInvoices()
  })

  const loadInvoices = async () => {
      if (!orgId.value) {
          invoices.value = []
          return
      }
      loading.value = true
      try {
          const response = await store.state.Session.apiCall(`/organizations/${orgId.value}/invoices`)
          invoices.value = response
          tableData.value = response.invoices


      } catch (err) {
          console.error(err)
      } finally {
          loading.value = false
      }
  }



</script>

<style scoped>

.legroom {
  margin-bottom: 1rem
}

</style>