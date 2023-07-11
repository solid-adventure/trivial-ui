<template>
  <div class="query-helper-container">
    <div v-if="!schemaLoaded" class="schema-loading-info">
      <p v-if="this.schemaLoading">Loading schema...</p>
      <p v-if="this.schemaLoadFailed" class="error">
        {{ errors }}, schema load failed. <a href="#" @click.prevent="getSchema">Retry connection</a> or <a href="/playground">start over</a>.
        <!-- TODO: Troubleshooting link -->
      </p>
    </div>
    <div v-if="this.suggestionError">
      <p class="error">{{ this.suggestionError }}</p>
    </div>

    <div v-if="this.schemaLoaded">
      <p class="title"><em>Show my</em></p>
      <div class="prompt-form">
        <textarea v-model="prompt" class="prompt" @keypress.enter.prevent="getSuggestion" />
        <button class="button-medium get-suggestion main-btn btn-hover" @click.prevent="getSuggestion">{{ generateButtonText }}</button>


<!--    Providing edit instructions doesn't reliably improve quality.
        Keeping this stub in case we want to try again
        <textarea v-model="editInstruction" class="prompt" />
        <button @click.prevent="getCorrection">Get Edit</button>
 -->
        <div class="settings-settings">
          <a href="#" @click.prevent="openDisplaySettings">Settings</a>
        </div>

        <div v-if="displaySettings" class="modal-overlay visible">
          <div class="modal modal-medium">
            <h1 class="modal-title">Settings</h1>
            <span @click="close" class="close-icon"></span>
            <div class="settings">
              <h3 class="section-title">Display Schema</h3>
              <em class="section-help-text">Displays the database table and column names.</em>
              <ToggleButton :value="displaySchema" @input="handleDisplaySchemaChange" :displayOnOff="true"/>

              <hr class="headroom accent" />

              <h3 class="section-title">Auto Run</h3>
              <em class="section-help-text">Auomatically runs a query after it's been generated.</em>
              <ToggleButton :value="autoRun" @input="handleAutoRunChange" :displayOnOff="true"/>
            </div>

          </div>
        </div>

        <div class="loading-indicator">
          <span v-if="loadingSuggestion">
            <button class="button-xs secondary-button" @click.prevent="cancelCompletion">Cancel</button>
            <span class="loading-status orange">››</span>
          </span>
          <span v-else>
            <span v-if="loadingSuggestionFailed" class="loading-status red">››</span>
            <span v-else class="loading-status green">››</span>
          </span>
        </div>
      </div>


      <div class="prerun-message">
        <p v-if="errors">
          <span class="error-icon">
            <span class="message">Generated query isn't valid: {{ errors }}</span>
          </span>
        </p>
        <p v-if="preRunComplete && !errors">
          <span class="success-icon">
            <span class="message">Valid SQL</span>
          </span>
        </p>
      </div>

      <div v-if="displaySchema" >
        <p v-for="table of tableNames">
          {{ table }}
          <ul>
            <li v-for="column of columnsByTableName[table]">{{ column }}</li>
          </ul>
        </p>
      </div>

    </div>
  </div>
</template>

<script>
  import ToggleButton from '../../controls/ToggleButton.vue'
  import { format } from 'sql-formatter'
  import { mapActions, mapState } from 'vuex'
  import Modal from '../../Modal.vue'
  import { track } from '../../../../lib/TrackingService'

  export default {

    components: {
      ToggleButton
    },

    data() {
      return {
        autoRun: false,
        displaySchema: false,
        displaySettings: false,
        editInstruction: 'Fix this error',
        errors: '',
        eventSource: null,
        loadingSuggestion: false,
        loadingSuggestionFailed: false,
        manuallyCancelled: false,
        preRunComplete: false,
        prompt: "top customers",
        query: 'default query',
        schema: null,
        schemaLoading: false,
        schemaLoaded: false,
        schemaLoadFailed: false,
        suggestionTimer: null,
        suggestionsReceived: 0,
        selectedTables: null,
        rankTables: null,
        suggestionError: null,
        promptTraceId: null,
      }
    },

    mounted() {
        this.getSchema()
    },

    mixins: [
      Modal
    ],

    watch: {
      query(val) {
        this.$emit('handleSuggestion', this.cleanedQuery)
      },

      currentCredentialSet() {
        this.getSchema()
      },

      loadingSuggestion(val) {

        if (this.manuallyCancelled) { return }
        if (!val) {
          // TODO: make this optional
          this.query = format(this.cleanedQuery, { language: 'postgresql'} )

          if (this.autoRun) {
            this.$emit('handleRunQuery')
          } else {
            this.preRun()
          }
        }
      }

    },

    computed: {

      interpretedPrompt() {
         return `Assume the date is ${new Date()}.
### Postgres SQL tables, columns, and data types:
### Schema format: # <Table Name>(<Column Name 1>::<Column Name 1 Data Type>, ...)
#
${this.formattedSchema}
#
Generate a query with the following prompt "${this.prompt}". Do not include date filters unless 
instructed by the prompt. The generated query should only include tables and columns included in
schema above.

SELECT`
       },

      tableRankPrompt() {
        return `Please rank the following SQL tables from 0-100 by how likely 
                they are needed to generate SQL for the given prompt.

                Prompt:
                ${this.prompt}
                
                Tables:
                ${this.formattedRankTables}
                
                Please answer in this format: "table_name: 0-100"`
      },
      
      formattedRankTables(){
        return `${this.rankTables.join('\n')}`
      },

      generateButtonText() {
        return this.loadingSuggestion ? "Generating..." : "Generate Query"
      },

       tableNames() {
         if (!this.schema) { return [] }
         if (this.selectedTables) { return this.selectedTables }
         return new Array(...new Set(this.schema.map(a => a.table_name)))
       },

       tableWithColumnsLines() {
         let out = []
         for (let table of this.tableNames) {
           let columns = this.schema.filter(a => a.table_name == table)
           out.push(`# ${table}(${columns.map(c => `${c.column_name}::${c.udt_name}`).join(', ')})`)
         }
         return out
       },

       columnsByTableName() {
        let out = {}
         for (let table of this.tableNames) {
           let columns = this.schema.filter(a => a.table_name == table)
           out[table] = columns.map(c => c.column_name)
         }
         return out
       },

       formattedSchema() {
         let out = `${this.tableWithColumnsLines.join('\n')}`
         return out
       },

       cleanedQuery() {
        let out = this.query.replace(/# | #|\n#|\n#|###/g, '')
        if (out != this.query) {
          console.log(`[cleanedQuery] scrubbing babble`)
        }
        return out
       },

      ...mapState([
        'currentCredentialSet'
      ])
    },

    methods: {

      handleDisplaySchemaChange(event) {
        this.displaySchema = event
      },

      handleAutoRunChange() {
        this.autoRun = !this.autoRun
      },

      openDisplaySettings() {
        this.displaySettings = true
      },

      close() {
        this.displaySettings = false
      },

      cancelCompletion() {
        this.manuallyCancelled = true
        this.loadingSuggestion = false
      },

      chunk (arr, len) {
        var chunks = [],
            i = 0,
            n = arr.length;
        while (i < n) {
          chunks.push(arr.slice(i, i += len));
        }
        return chunks;
      },

      async getSchema() {
        this.schemaLoadFailed = false
        if (!this.currentCredentialSet) { return }
        this.schemaLoading = true
        this.errors = ''
        const configData = await this.loadCredentialSetAndSecret({id: this.currentCredentialSet})
        let config = {'PostgreSQL': configData.credentials}
        let schemaQuery = `SELECT "table_name", "column_name", "udt_name" from INFORMATION_SCHEMA."columns" WHERE table_schema = 'public';`
        fetch(`/actions/PostgreSQL/Query/perform`, {
          method: 'post',
          body: JSON.stringify({
            config: config,
            payload: {
              query: schemaQuery
            }
          }),
          headers: {'content-type': 'application/json'}
        })
        .then(response => response.json())
        .then(response => this.handleGetSchemaResponse(response))
        .catch(e => this.handleGetSchemaResponse(e))
      },

      handleGetSchemaResponse(response) {
        if (response.status != 200) {
          this.schemaLoadFailed = true
          this.schemaLoading = false
          try {
            this.errors = response.body.results.message
          } catch (e) {
            this.errors = e
            console.error(e)
          }
          return
        }

        try {
          this.schema = response.body.results
          this.schemaLoaded = true
          this.schemaLoading = false
          track('Loaded Schema', {})
          if (!this.schema || this.schema.length === 0) {
            track('Loaded Empty Schema', {})
            this.errors = 'Schema loaded with no tables'
            this.schemaLoadFailed = true
            this.schemaLoaded = false
          }
        } catch (e) {
          this.schemaLoadFailed = true
          this.errors = e
          console.error(e)
        }
      },

      async rankTablesForPrompt() {
        track('Ranking Tables', {
          type: 'table_rank', 
          prompt: this.prompt, 
          prompt_id: this.promptTraceId
        })
        const chunks = this.chunk(this.tableWithColumnsLines, 15)
        var fullTableRanks = []
        var promises = []
        for (let chunk of chunks) {
          this.rankTables = chunk
          var response = fetch('/suggestionChat', {
            method: 'POST',
            body: JSON.stringify({
               model: "gpt-3.5-turbo",
               messages: [{role: 'user', content: this.tableRankPrompt}],
               temperature: 0,
               max_tokens: 512,
               top_p: 1,
               frequency_penalty: 0,
               presence_penalty: 0,
             }),
             headers: {'content-type': 'application/json'}
          })
          promises.push(response)
        }
        const responses = await Promise.all(promises)
        const jsonPromises = responses.map(r => r.json())
        const jsonResponses = await Promise.all(jsonPromises)
        if (this.manuallyCancelled) return
        for (let response of jsonResponses) {
          if (response.statusCode !== 200 && response.body.error) {
            this.suggestionError = response.body.error.message
            this.manuallyCancelled = true
            this.loadingSuggestion = false
            break
          }
          const tableRanks = response.body.choices[0].message.content.split('\n')
            .filter(r => r !== '')
            .map(r => r.split(':'))
            .map(r => {
              return {rank: parseInt(r[1]), table: r[0]} 
            })
          fullTableRanks = [...fullTableRanks, ...tableRanks]
        }
        
        // Sort by returned rank
        fullTableRanks.sort((a,b) => b.rank - a.rank)
        // Include Top 15 ranked tables in selected tables
        // Rank is based on how likely the table is needed to generate SQL for the given prompt
        this.selectedTables = fullTableRanks.map(r => r.table).slice(0, 15)
      },

      async checkPromptForMaxTokens() {
        const queryRes = await fetch('/suggestionTokens', {
          method: 'POST',
          body: JSON.stringify({
             model: "gpt-3.5-turbo",
             prompt: this.interpretedPrompt,
           }),
           headers: {'content-type': 'application/json'}
        })
        const queryResJson = await queryRes.json()
        return queryResJson.tokens > 4096
      },

      async getSuggestion() {
        this.manuallyCancelled = false
        this.loadingSuggestion = true
        this.query = 'SELECT'
        this.preRunComplete = false
        this.errors = ''
        this.suggestionError = null
        this.promptTraceId = this.generateUUID()
        // track prompt for analytics
        track('Prompt', {
          prompt: this.prompt,
          type: 'prompt', 
          prompt_id: this.promptTraceId
        })
        // Check if prompt is too long and rank tables if so
        const maxTokensExceeded = await this.checkPromptForMaxTokens()
        if (maxTokensExceeded) {
          await this.rankTablesForPrompt()
        }
        if (this.manuallyCancelled) return  
        const controller = new AbortController()
        const queryRes = await fetch('/suggestionStream', {
          method: 'POST',
          body: JSON.stringify({
             model: 'gpt-3.5-turbo',
             // model: "text-davinci-003",
             // model: "code-davinci-002",
             prompt: this.interpretedPrompt,
             temperature: 0,
             max_tokens: 512,
             top_p: 1,
             best_of: 1,
             frequency_penalty: 0,
             presence_penalty: 0,
             stop: [";", "A query with", "###", "\n#"],
             stream: true
           }),
           headers: {'content-type': 'application/json'},
           signal: controller.signal,
        })
        // Set selected tables back to null so it can be selected per prompt
        this.selectedTables = null
        const reader = queryRes.body.pipeThrough(new TextDecoderStream()).getReader()
        // Get SSE events from server 1 by 1
        while (true) {
          if (this.manuallyCancelled) {
            controller.abort()
            break
          }
          const {value, done} = await reader.read();
          if (done) {
            this.query += ';'
            track('Suggestion', {
              type: 'suggestion', 
              prompt: this.prompt, 
              query: this.query, 
              prompt_id: this.promptTraceId
            })
            break;
          }
          var error = false
          for (let line of value.split('\n')) {
            if (line === '') { continue }
            let event = {}
            try {
              event = JSON.parse(line)
            } catch (e) {
              console.log(`[getSuggestion] Could not parse response line: ${e}`)
            }
            if (event.error) {
              track('Suggestion Error', {
                type: 'suggestion_error', 
                prompt: this.prompt, 
                prompt_id: this.promptTraceId,
                error: event.error
              })
              console.error(event)
              this.manuallyCancelled = true
              this.suggestionError = 'Error: ' + event.error
              error = true
              break
            }
            if (event.text) {
              this.query += event.text
            }
          }
          if (error) break
        }
        this.loadingSuggestion = false
       },

      // Pre-run the query and get a correction if it errors
      async preRun() {
        this.errors = ''
        this.preRunComplete = false
        const configData = await this.loadCredentialSetAndSecret({id: this.currentCredentialSet})
        let config = {'PostgreSQL': configData.credentials}
        let query = `EXPLAIN ${this.query}`
        fetch(`/actions/PostgreSQL/Query/perform`, {
          method: 'post',
          body: JSON.stringify({
            config: config,
            payload: {
              query: query
            }
          }),
          headers: {'content-type': 'application/json'}
        })
        .then(response => response.json())
        .then(response => this.handlePreRunResponse(response))

      },

      handlePreRunResponse(response) {
        this.preRunComplete = true
        if (response.status != 200) {
          try {
            let error = response.body.results.message
            // TEMP disable the auto correction until it works better
            // this.getCorrection(error)
            this.errors = error
          } catch (e) {
            this.errors = e
          }
          track('Invalid SQL', {
            type: 'sql_check', 
            valid: false, 
            error: this.errors, 
            prompt: this.prompt, 
            query: this.query, 
            prompt_id: this.promptTraceId
          })
        } else {
          console.log(`PreRun Succeeded: ${JSON.stringify(response.body.results)}`)
          track('Valid SQL', {
            type: 'sql_check', 
            valid: true, 
            prompt: this.prompt, 
            query: this.query, 
            prompt_id: this.promptTraceId
          })
        }

        return
      },

      async getCorrection(error) {
        console.log(`[getCorrection] error: ${error}`)

        this.logCorrection('before', this.query)

        fetch(`/correction`, {
          method: 'post',
          body: JSON.stringify({
            model: 'code-davinci-edit-001',
            input: this.query,
            instruction: this.editInstruction
          }),
          headers: {'content-type': 'application/json'}
        })
        .then(response => response.json())
        .then(response => this.handleGetCorrection(response))
      },

      logCorrection(state, query) {
        fetch('/correction-log', {
          method: 'post',
          body: JSON.stringify({
            state: state,
            query: query
          }),
          headers: {'content-type': 'application/json'}
        })
      },

      handleGetCorrection(response) {
        try {
          this.query = response.body.choices[0].text
          this.logCorrection('after', this.query)
        } catch(e) {
          console.log(`[handleGetCorrection] ${e}`)
        }
      },

      // https://stackoverflow.com/a/8809472/834094
      generateUUID() { // Public Domain/MIT
        var d = new Date().getTime();//Timestamp
        var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16;//random number between 0 and 16
            if(d > 0){//Use timestamp until depleted
                r = (d + r)%16 | 0;
                d = Math.floor(d/16);
            } else {//Use microseconds since page-load if supported
                r = (d2 + r)%16 | 0;
                d2 = Math.floor(d2/16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
      },

      ...mapActions([
        'loadCredentialSetAndSecret'
        ])

    }
  }
</script>

<style lang="scss" scoped>
.query-helper-container {

  .schema-loading-info {
    min-height: 4em;

    .error {
      border-left: 4px solid var(--error);
      padding-left: 1em;
      line-height: 3em;
    }

  }

  div.settings {

    h3.section-title {
      margin-bottom: 0;
    }

    p.section-help-text {
      margin-top: 0;
    }

    em.section-help-text {
      margin-bottom: 0.25em;
      display: block;
      color: var(--on-background-60);
    }

  }

}

.title {
  margin-bottom: 0.5em;
  margin-top: 0;
}

.prompt-form {
  display: flex;
  flex-direction: row;
  align-items: center;
  // max-width: 50%;
  margin-bottom: 1em;
  column-gap: 2em;
}

.get-suggestion {
  flex-shrink: 0;
}

.loading-indicator.loading-status {
  font-size: 1.5em;
}

.loading-indicator button {
  height: 100%;
}

.prompt {
  flex-grow: 1;
  font-weight: 100;
  font-size: 1em;
  border: 1px solid var(--accent);
  height: calc(100% - 2px);
}

div.prerun-message {
  min-height: 2em;
}

span.success-icon {
  background-image: var(--success-icon);
}

span.error-icon {
  background-image: var(--error-icon);
}

span.success-icon, span.error-icon {

  background-repeat: no-repeat;
  background-position: left center;

  span.message {
    margin-left: 1.5em;
  }
}

.loading-status {
  font-size: 1em;
}

.orange {
  color: orange;
}

.red {
  color: red;
}

.green {
  color: var(--on-background-40);
}

 </style>