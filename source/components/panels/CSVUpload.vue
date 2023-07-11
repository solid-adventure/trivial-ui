<template>
  <div class="upload-container">
    <h1>{{this.app.descriptive_name}}</h1>
    <a :href="`/apps/${app_id}/settings2`">Edit</a>

    <div>
      <form  enctype="multipart/form-data">
        <div class="drop-area">
          <p v-if="!hasFiles">Drop file here</p>
          <div v-if="hasFiles">
            {{fileName}}
          </div>
          <input
            type="file"
            multiple
            @change="handleFilesChange($event)"
            class="input-file">
          <div v-if="success" class="success"><span class='success-icon'></span>Upload complete!</div>
        </div>
      </form>
      <div v-if="errors" class="error">{{errors}}</div>

      <ActionButton v-if="completed" class="button-medium submit" :action="handleReset" value ="Start Over"></ActionButton>
      <ActionButton v-else class="button-medium submit" :action="handleSubmit" :disabled="!hasFiles" value ="Process" working-value="Updating..."></ActionButton>
    </div>




  </div>
</template>

<script>
  import ActionButton from '../controls/ActionButton.vue'
  import { fetchJSON } from 'trivial-core/lib/component-utils'
  import PanelBase from './PanelBase.vue'
  import { mapState } from 'vuex'


  export default {

    components: {
      ActionButton
    },

    mixins: [PanelBase],

    data() {
      return {
        files: [],
        success: null,
        working: false,
        completed: false
      }
    },

    computed: {

      fileName() {
        try {
          return this.files[0].name
        } catch(e) {
          return ''
        }
      },

      hasFiles() {
        return this.files.length > 0
      },

      first_row_as_column_headers() {
        let out = true
        try {
          out = this.app.panels.options.first_row_as_column_headers
        } catch (e) {
          out = true
        }
        return out
      },

      params() {
        try {
          return this.app.panels.options.params || {}
        } catch(e) {
          return {}
        }
      },

      ...mapState([
        'apps',
        'app'
      ])

    },

    methods: {
      // CSVUpload renders against the apps set in its options, and skips the network call.
      fetchData() {
        return false
      },

      handleFilesChange(event) {
        if (event.target.files && event.target.files.length > 0) {
          this.files = event.target.files
        }
      },

      handleReset() {
        this.files = []
        this.completed = false
        this.working = false
        this.success = null
      },

      async handleSubmit() {
        this.working = true
        this.errors = null
        await this.csvToJSON()
      },

      handleResponse(response) {
        this.working = false
        this.success = true
        this.completed = true
      },

      async sendData(data) {
        console.log(JSON.stringify(data, null, 2))
        try {
          await fetchJSON(`/apps/call?url=${this.appUrl}`, {
            method: 'post',
            body: JSON.stringify(Object.assign({customer_token: this.customerToken}, this.options, data)),
            headers: {'content-type': 'application/json'}
          })
          .then(response => this.handleResponse(response))
        } catch (error) {
          this.errors = error
          console.error('[CSVUpload][sendData] Error:', error)
        }
      },

      async csvToJSON() {
        let formData = new FormData()
        formData.append('file', this.files[0])
        formData.append('first_row_as_column_headers', this.first_row_as_column_headers)
        try {
          await fetchJSON(`/csv-to-json`, {
            method: 'post',
            body: formData
          })
          .then(json => this.sendData(json))
        } catch (error) {
          this.errors = error
          console.error('[CSVUpload][csvToJSON] Error:', error)
        }
      }
    }
  }
</script>

<style lang="scss" scoped>

  .upload-container {

    padding: 1em 3em;
    overflow: auto;

    span.success-icon {
      background-image: var(--success-icon);
      background-repeat: no-repeat;
      background-position: left center;
      height: 1.5em;
      width: 1.5em;
      display: inline-block;
      margin-right: 0.5em;
    }

    .success {
      display: flex;
      align-items: center;
      margin-top: 1em;
    }

   .error {
      min-height: 1em;
      line-height: 1;
      margin-top: .25em;
      color: var(--error);
      margin: 1em 0;
    }
 
    .drop-area {
      width: 600px;
      height: 300px;
      border: 2px dashed var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }

    .drop-area:hover {
      background-color: var(--accent-20);
    }

    .input-file {
      width: 600px;
      height: 300px;
      opacity: 0;
      position: absolute;
    }

    .panels-container {
      display: flex;
      flex-direction: column;

      @media only screen and (min-width: 600px) {
        flex-direction: row;
        justify-content: space-between;
      } 
    }
  }

  .panel {
    border: 1px solid var(--on-background-20);
    border-radius: 12px;
    padding: 2em;

    h1 {
      color: var(--series-1);
      font-size: 5em;
      margin-bottom: 0;
    }

  @media only screen and (min-width: 768px) {
    /* For mobile phones: */

    .panels-container {
      display: flex;
      flex-direction: row;
    }

    .panel {
      width: 320px;
      height: 200px;
    }
  }


  }
</style>