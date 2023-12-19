<template>
  <div class="query-helper-container">
    <p v-if="errors" class="errors">
      {{ errors }}
    </p>
    <TableView v-if="runQueryResults" :previewColumnNames="previewParser.names" :previewRows="previewParser.rows" :inheritedLoadingState="queryLoading"/>

  </div>
</template>

<script>
  import ActionButton from '../../controls/ActionButton.vue'
  import TableView from '../../panels/TableView.vue'
  import { mapActions, mapState } from 'vuex'

  export default {
    components: {
      ActionButton,
      TableView
    },

    props: {
      query: {
        type: String,
        default: "",
        required: true
      }
    },

    data() {
      return {
        runQueryResults: null,
        queryLoading: false,
        errors: '',
        schema: null
      }
    },

    mounted() {
      this.$root.$refs.QueryHelper = this;
    },

    computed: {

      previewParser() {
        try {
          if (!this.runQueryResults) {
            return {names: [], rows: []}
          }

          if (this.runQueryResults.length == 0) {
            return {names: ["No results"], rows: []}
          }

          let sample = this.runQueryResults[0]
          let names = Object.keys(sample)
          let rows = []

          for (let row of this.runQueryResults) {
            let cols = names.map(name => row[name]);
            rows.push(cols)
          }

          return {names, rows}
        } catch(e) {
          console.error(e)
          return {names: [], rows: []}
        }

       },

      ...mapState([
        'currentCredentialSet'
      ]),

    },

    methods: {
      async runQuery() {
        this.queryLoading = true
        this.errors = ''
        if (!this.currentCredentialSet) { return }
        const configData = await this.loadCredentialSetAndSecret({id: this.currentCredentialSet})
        let config = {'PostgreSQL': configData.credentials}
        await fetch(`/actions/PostgreSQL/Query/perform`, {
          method: 'post',
          body: JSON.stringify({
            config: config,
            payload: {
              query: this.query
            }
          }),
          headers: {'content-type': 'application/json'}
        })
        .then(response => response.json())
        .then(response => this.handleRunQueryResponse(response))
        .catch(e => console.error(e))
      },

      handleRunQueryResponse(response) {
        if (response.statusCode == 422 || response.status == 422) {
          this.handleMalformedQueryResponse(response)
          this.queryLoading = false
          return
        }
        try {
          this.runQueryResults = response.body.results
        } catch (e) {
          console.error(e)
        }
        this.queryLoading = false
      },

      handleMalformedQueryResponse(response) {
        try {
          this.debugData = response.body.results.data
          console.log(`Failed query debug data: ${JSON.stringify(this.debugData)}`)
        } catch (e) {}
        this.runQueryResults = null
         try {
           let message = response.body.results.message
           this.errors = message
         } catch(e) {
           this.errors = e
         }
       },

       ...mapActions([
          'loadCredentialSetAndSecret'
        ])

    }
  }
</script>

<style lang="scss" scoped>

  .query-helper-container {
    padding-top: 1em;

    p.errors {
      padding: 0.5em;
      background-color: var(--error);
      color: var(--on-error);
    }

  }

 </style>