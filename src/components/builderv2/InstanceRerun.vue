<template>
  <Panel >

    <div class="InstanceRerun">
      <h1 v-if = "appLoaded"><RouterLink :to="`/apps/${app.name}/builder2`">{{app.descriptive_name}}</RouterLink></h1>
    </div>

    <h3>Refresh Sales</h3>

    <template v-if="run_id">
      <p>Rerun started. This may take a while, you can follow progress by searching application logs for Rerun ID {{ run_id }} </p>
    </template>

    <template v-else>
      <h2 class="danger-zone">Danger zone</h2>
      <div>
        <p>Re-calculate all sales for this contract. This will: </p>
        <ol>
          <!-- TODO Since we could span across multiple contracts, this should be ~ app.tags.filter(tag => tag.name === 'customer').map(tag => tag.content) -->
          <li>Delete all <strong>{{ app.descriptive_name }}</strong> sales in the date range haven't been invoiced yet.</li>
          <li>Calculate sales using the <strong>current version</strong>(s) of the {{ app.descriptive_name }} contract.</li>
        </ol>
        <p>Why version(s)?</p>
        <p>
          This re-runs the activity stream, which selects the contract in effect for when work was performed.
          If the activity now spans across when multiple versions of the contract are in effect, which contract version is used may change.
        </p>
        <Calendar
          v-model="dateRange"
          selectionMode="range"
          dateFormat="mm/dd/yy"
          placeholder="Select Date Range"
        />
        <p>
          <Button @click="handleReRun">Re-run</Button>
        </p>
      </div>
    </template>

  </Panel>

</template>

<script setup>
  import { computed, ref } from 'vue';
  import Calendar from 'primevue/calendar';
  import { useStore } from 'vuex'

  const store = useStore()
  const app = computed(() => store.state.app)
  const appLoaded = computed(() => store.getters.appLoaded)

  const dateRange = ref([]);
  const rerun_start_at = computed(() => dateRange.value?.[0]);
  const rerun_end_at = computed(() => dateRange.value?.[1]);
  const run_id = ref(null);

  const handleReRun = () => {
    if (!validate()) return
    store.state.Session.apiCall(`/activity_entries/rerun`, 'PUT', {
      app_id: app.value.name,
      start_at: rerun_start_at.value,
      end_at: rerun_end_at.value
    })
    .then(data => {
      run_id.value = data.run_id
    })
    .catch((err) => {
      console.error(err)
    })
  }

  const validate = () => {
    if (!rerun_start_at.value) {
      alert('Please provide a start date')
      return false
    }

    if (!rerun_end_at.value) {
      alert('Please provide an end date')
      return false
    }

    return true
  }

</script>


<style lang="scss" scoped>

  .danger-zone {
    color: red;
    text-transform: uppercase;
    text-decoration: underline;
  }

</style>