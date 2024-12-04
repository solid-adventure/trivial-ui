<template>
    <div v-if="loading">
      loading...
    </div>
    <div v-else>
      <pre>{{ invoice }}</pre>
    </div>

</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { useStore } from 'vuex'

  const loading = ref(false)
  const invoice = ref({})
  const store = useStore()
  const route = useRoute()

  onMounted(async () => {
      loadInvoice()
  })

  const loadInvoice = async () => {
    loading.value = true
    try {
        const response = await store.state.Session.apiCall(`/invoices/${route.params.id}`)
        invoice.value = response
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
  }


</script>