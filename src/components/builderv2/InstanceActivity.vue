<script>
  import FilterEditor from './FilterEditor.vue'
  //import NavTree from './NavTree.vue'
  import Notices from '../Notices.vue'
  import WebhooksTable from '../activityLog/WebhooksTable.vue'
  import { mapState, mapGetters } from 'vuex'

  export default {
    components: {
      FilterEditor,
      //NavTree,
      Notices,
      WebhooksTable,
    },
    computed: {
      ...mapState(['app']),
      ...mapGetters(['appLoaded'])
    },
    data() {
      return {
        reprocess_start_at: '2024-10-01',
      }
    },
    methods: {
      handleReRun() {
        if (!this.reprocess_start_at) {
          alert('Please provide a date')
          return
        }

        // if (confirm(`Are you sure you want to re-run all activity after ${this.reprocess_start_at}?`)) {
          this.$store.state.Session.apiCall(`/apps/${this.app.name}/reprocess_activity`, 'PUT', {
            start_at: this.reprocess_start_at
          })
          .then(() => {
            alert('Activity re-run successfully')
          })
          .catch((err) => {
            console.error(err)
          })
        // }
      }
    }

  }

</script>

<template>
  <div class="InstanceActivity">
    <!-- <super-bar></super-bar> -->
    <Notices></Notices>
    <!--<nav-tree :selected-title="'activity'"></nav-tree>-->
    <div class="instance-activity-items">
      <div class='app-name-container'>
        <h1 v-if = "appLoaded"><RouterLink :to="`/apps/${this.app.name}/builder2`">{{this.app.descriptive_name}}</RouterLink></h1>
        <h1 v-else>Loading...</h1>
      </div>
      <FilterEditor></FilterEditor>
      <WebhooksTable></WebhooksTable>
    </div>

  </div>

  <!-- Danger zone– re-run all activity after the date provided -->
  <div class="danger-zone">
    <h3>Refresh Sales</h3>
    <p>Re-calculate all sales for this contract. This will: </p>
    <ol>
      <!-- TODO Since we could span across multiple contracts, this should be ~ app.tags.filter(tag => tag.name === 'customer').map(tag => tag.content) -->
      <li>Delete all <strong>{{ app.descriptive_name }}</strong> sales after the cutoff that haven't been invoiced yet.</li>
      <li>Calculate sales using the <strong>current version</strong>(s) of the {{ app.descriptive_name }} contract.</li>
    </ol>

    <!-- Why version(s)?

      This reprocesses the activity stream, which selects the contract in effect for when work was performed.
      If the activity spans across when one version of the contract was in effect and another, we will choose the correct contract version.

     -->

    <p>
      <input v-model="reprocess_start_at" type="date" name="date" id="date">
      <button @click="handleReRun">Re-run</button>
    </p>
  </div>



</template>

<style lang="scss" scoped>
  .InstanceActivity {
  	/*margin: 2em;
    left: 23em;
    top: 120px;
    position: relative;
    width: calc(100% - 27em);*/

    display: flex;

    & .instance-activity-items {
      display: flex;
      flex-direction: column;
      width: 100%;

      & a {
        color: var(--clr-text-primary);
      }
    }
  }

</style>