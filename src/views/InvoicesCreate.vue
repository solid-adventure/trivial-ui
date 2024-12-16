<template>
  <Panel class="w-full shadow-2">


    <Steps :model="steps" v-model:activeStep="active" />


    <!-- Step 1 -->
    <div v-if="active==0">
      <p>Step 1, select dates and charge  groups</p>
      <ChartControls
        v-model="masterChartSettings"
      />
      <div class="action-bar">
        <Button @click="handleProceed()">Next</Button>
      </div>
    </div>


    <!-- Step 2 -->
    <div v-if="active==1">
      <p>Step 2,review charges and filter as necessary</p>
      <div class="action-bar">
        <Button @click="handleProceed()">Create Invoices</Button>
      </div>
    </div>


    <!-- Step 3 -->
    <div v-if="active==2">
      <p>Step 3,create invoices and download</p>

      <div class="action-bar space-between">
        <Button @click="handleProceed()" class="secondary">Done</Button>
        <Button @click="handleReset">+ Create more invoices</Button>
      </div>
    </div>

  </Panel>

</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { useStore } from 'vuex'
  import Steps from 'primevue/steps';
  import ChartControls from '@/components/dashboard/ChartControls.vue'
  import table from '@/components/dashboard/table.vue'

  const masterChartSettings = ref({})

  const steps = ref([
      {
          label: 'Select items'
      },
      {
          label: 'Review charges'
      },
      {
          label: 'Download invoices'
      }
  ]);

  const active = ref(0);

  const handleProceed = () => {

    if (active.value <= steps.value.length) {
      active.value++
    }

    switch (active.value) {
      case 1:
        console.log("TODO Review charges")
        break;
      case 2:
        console.log("TODO Create Invoices")
        break;
      default:
        alert('Nice job!')
        setTimeout(() => {
          active.value = 0 // TEMP Redirect home
        }, 2000)
        break;
    }
  }

  onMounted(async () => {
  })


</script>

<style scoped>
  div.action-bar {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin-top: 1rem;
    align-items: center;
  }

  div.action-bar.space-between {
    justify-content: space-between;
  }


</style>