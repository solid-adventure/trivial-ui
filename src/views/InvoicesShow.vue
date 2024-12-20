<template>
  <div>
    <div v-if="loading">
      loading...
    </div>
    <!-- Letter sets an 8.5x11 proportion to look like a PDF / piece of paper-->
    <div class="letter shadow-2" v-else>

      <!-- Body gives us a vertical division into a footer and everything else-->
      <div class="body">

        <!-- Invoice Identity -->
        <div class="section">
          <h1>Invoice</h1>
          <table>
            <tbody>
              <tr>
                <td><span class="label">Invoice Date</span> </td>
                <td>{{ invoiceDate }}</td>
              </tr>
              <tr>
                <td><span class="label">Invoice Number</span> </td>
                <td>{{ invoice.id }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Addresses -->
        <div class="section addresses">
          <div class="address-block">
            <span class="address-title"></span>
            <div class="payee">
              {{ invoice.payee_name }}
            </div>
          </div>
          <div class="address-block">
            <span class="address-title">Bill to</span>
            <div class="payor">
              {{ invoice.payor_name }}
            </div>
          </div>
        </div>

        <!-- List of items & total -->
        <div class="section">
          <table class="invoice-items">
            <thead>
              <th class="income_account">Product/service</th>
              <th class="income_account_group">Group</th>
              <th class="quantity">Qty</th>
              <th class="unit_price">Rate</th>
              <th class="extended_amount">Amount</th>
            </thead>
            <tbody>
              <tr v-for="item of invoice.invoice_items">
                <td class="income_account">{{ item.income_account }}</td>
                <td class="income_account_group">{{ item.income_account_group }}</td>
                <td class="quantity">{{ item.quantity }}</td>
                <td class="unit_price">{{ useFormatCurrency(item.unit_price, 2, invoice.currency) }}</td>
                <td class="extended_amount">{{ useFormatCurrency(item.extended_amount, 2, invoice.currency) }}</td>
              </tr>
              <tr class="total">
                <td colspan="5" class="total"><span class="total-block">Total {{ useFormatCurrency(invoice.total, 2, invoice.currency) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div> <!-- end body-->

      <!-- Footer section flexed to the bottom -->
      <div>
        <div class="section footer">
          <span class="label">Notes</span><br />
          {{ invoice.notes }}
        </div>
      </div>

    </div>

    <div v-if="!loading"class="action-bar">
      <Button @click="deleteInvoice" severity="danger" >Delete Invoice</Button>
    </div>

  </div>


</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useStore } from 'vuex'
  import { useDateTimeZoneOptions } from '@/composable/dateTimeZoneOptions.js'
  import { useFormatCurrency } from '@/composable/formatCurrency.js'
  import { useFormatDate } from '@/composable/formatDate.js'
  import { useToastNotifications } from '@/composable/toastNotification'

  const loading = ref(false)
  const invoice = ref({
    payor: {},
    payee: {},
    invoice_items: []
  })
  const store = useStore()
  const route = useRoute()
  const router = useRouter()
  const {dateOptions, timeOptions, timeZoneOptions} = useDateTimeZoneOptions()
  const { showSuccessToast, showErrorToast, showInfoToast } = useToastNotifications()

  onMounted(async () => {
      loadInvoice()
  })

  const invoiceDate = computed(() => {

    const options = {
      dateStyle: 'long',
      timeZone: timeOptions.timeZone
    }
    return invoice.value.date ? useFormatDate(invoice.value.date, options) : ''
  })

  const loadInvoice = async () => {
    loading.value = true
    try {
        const response = await store.state.Session.apiCall(`/invoices/${route.params.id}`)
        invoice.value = response.invoice
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
  }

  const deleteInvoice = () => {
    store.state.Session.apiCall(`/invoices/${route.params.id}`, 'DELETE')
      .then(() => {
        showSuccessToast('Success', 'Invoice deleted successfully, redirecting...')
        setTimeout(() => {
          router.push('/invoices')
        }, 2000)
      })
      .catch((e) => showErrorToast('Error', `${e}`))
  }



</script>

<style scoped>
  div.letter {
    margin: 1em;
    padding: 4em;
    border-radius: 3px;
    width: 850px;
    height: 1100px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: var(--surface);

    div.body {
      width: 100%;
    }

  }

  span.label {
    font-weight: 600;
  }

  div.section {
    width: 100%;
    margin-top: 3em;
  }

  div.addresses {
    display: flex;

    div.address-block {
      width: 33%;
    }

    div.address-block:last-child {
      padding-left: 2em;
    }

    span.address-title {
      min-height: 2em;
      display: block;
      font-weight: 600;
    }
  }

  table.invoice-items {
    width: 100%;
    border-spacing: 0;

    th.income_account, th.income_account_group {
      text-align: left;
    }

    td.income_account, td.income_account_group {
      text-align: left;
    }

    th.quantity, th.unit_price, th.extended_amount {
      text-align: right;
    }

    td.quantity, td.unit_price, td.extended_amount {
      text-align: right;
    }

    tr.total {
      td.total {
        font-weight: 800;
        text-align: right;
      }

      .total-block {
        margin-top: 0.5em;
        border-top: 1px solid;
        display: inline-block;
        padding-top: 0.5em;
        padding-bottom: 0.5em;
      }

    }

  }

  div.action-bar {
    margin-top: 3em;
    margin-left: 1em;
  }

</style>