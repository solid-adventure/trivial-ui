<template>
    <div v-if="loading">
      loading...
    </div>
    <div v-else>
      <RouterLink v-for="(invoice, index) in invoices" :key="index" :to="`/invoices/${invoice.id}`">
        <pre>{{ invoice }}</pre>
      </RouterLink>
    </div>

</template>

<script setup>
  import { ref, onMounted, computed, watch, toRaw } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useStore } from 'vuex'

  const loading = ref(false)
  const invoices = ref([])
  const orgId = computed(() => store.getters.getOrgId)
  const store = useStore()
    // router = useRouter(),
    // route = useRoute(),
    // { dateOptions, timeOptions, timeZoneOptions } = useDateTimeZoneOptions(),
    // timezone = timeZoneOptions.timeZone,
    // { dateFilterMatchModes, textFilterMatchModes, filterMatchModeMapping, globalFilterFields } = useFilterMatchModes()



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
          // invoices.value = response.audits.map(audit => ({
          //     ...audit,
          //     created_at: new Date(audit.created_at),
          // }))
      } catch (err) {
          console.error(err)
      } finally {
          loading.value = false
      }
  }



</script>