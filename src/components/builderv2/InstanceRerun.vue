<script>
  import { mapState, mapGetters } from 'vuex'

  export default {
    computed: {
      ...mapState(['app']),
      ...mapGetters(['appLoaded'])
    },
    data() {
      return {
        rerun_start_at: '',
        streamedResponse: []
      }
    },
    methods: {
      handleReRun() {
        if (!this.rerun_start_at) {
          alert('Please provide a date')
          return
        }

        if (confirm(`Are you sure you want to re-run all ${this.app.descriptive_name} activity after ${this.rerun_start_at}?`)) {
          this.$store.state.Session.apiCall(`/activity_entries/rerun`, 'PUT', {
            app_id: this.app.name,
            start_at: this.rerun_start_at
          }, 'json', true, this.streamedResponse)
          .catch((err) => {
            console.error(err)
          })
        }
      }
    }

  }

</script>

<template>
  <div class="InstanceRerun">
    <h1 v-if = "appLoaded"><RouterLink :to="`/apps/${this.app.name}/builder2`">{{this.app.descriptive_name}}</RouterLink></h1>
  </div>

  <h2 class="danger-zone">Danger zone</h2>

  <div>
    <h3>Refresh Sales</h3>
    <p>Re-calculate all sales for this contract. This will: </p>
    <ol>
      <!-- TODO Since we could span across multiple contracts, this should be ~ app.tags.filter(tag => tag.name === 'customer').map(tag => tag.content) -->
      <li>Delete all <strong>{{ app.descriptive_name }}</strong> sales after the cutoff that haven't been invoiced yet.</li>
      <li>Calculate sales using the <strong>current version</strong>(s) of the {{ app.descriptive_name }} contract.</li>
    </ol>
    <p>Why version(s)?</p>
    <p>
      This re-runs the activity stream, which selects the contract in effect for when work was performed.
      If the activity now spans across when multiple versions of the contract are in effect, which contract version is used may change.
    </p>

    <p>
      <input v-model="rerun_start_at" type="date" name="date" id="date">
      <button @click="handleReRun">Re-run</button>
    </p>

    <pre><span v-for="line of streamedResponse">Rerun {{ line.run_id }}, {{ line.message }}<br /></span> </pre>

  </div>



</template>

<style lang="scss" scoped>
  .InstanceRerun {
    display: flex;
  }
  .danger-zone {
    color: red;
    text-transform: uppercase;
    text-decoration: underline;

  }

  pre {
    white-space: pre-wrap;
    background: black;
    color: white;
    padding: 1em;
    min-height: 40em;
  }


</style>