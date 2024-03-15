<script>
import { TrivialSchemas } from '../lib/TrivialSchemas.js'
import CodeCompletingInput from './controls/CodeCompletingInput.vue'

export default {

  components: {
    CodeCompletingInput
  },

  inject: ['appId', 'loadDataSamples'],

  props: {
    value: Object,
    topics: Array,
    show: {
      type: Boolean,
      default: true
    },
    isNew: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      message: null,
      dataSamples: [],
      mappingErrors: []
    }
  },

  computed: {
    schemas() {
      return TrivialSchemas
    },

    fromSchema() {
      return this.schemas[this.value.from]
    },

    toSchema() {
      return this.schemas[this.value.to]
    },

    convertibleSchemas() {
      return Object.keys(this.schemas)
    },

    dataSample() {
      if (this.dataSamples) {
        let match = this.dataSamples.find(sample => {
          return this.value.topics.length == 0 || this.value.topics.indexOf(sample.topic) !== -1
        })
        return match ? match.payload : undefined
      }
    }
  },

  async created() {
    this.dataSamples = await this.loadDataSamples()
  },

  methods: {
    isBlank: function(value) {
      return /^\s*$/.test(String(value))
    },

    clickSave: function() {
      this.normalizeTransformations();

      if (! this.isValid())
        return;

      if (! this.isMappingValid() && ! confirm(`The following possible transformation errors were found. Are you sure you want to save?\n\n${this.mappingErrors.join("\n")}`))
        return;

      if (this.isNew)
        this.$emit('addtransform', this.value)
      else
        this.$emit('updatetransform', this.value)

      this.$emit('update:show', false)
    },

    normalizeTransformations: function() {
      this.value.transformations =
        this.value.transformations.filter(t => ! this.isBlank(t[0]) || ! this.isBlank(t[1]))
    },

    isValid: function() {
      if (this.isBlank(this.value.from)) {
        this.message = 'You must select an input type.'
        return false
      } else if (this.isBlank(this.value.to)) {
          this.message = 'You must select an output type.'
          return false
      } else if (this.value.topics.length < 1) {
        this.message = 'You must select at least one topic.'
        return false
      } else {
        this.message = null
        return true
      }
    },

    isMappingValid: function() {
      this.mappingErrors = []

      if (!this.toSchema) {
        return true
      }

      const hasMapping = (field) => {
        return this.value.transformations.find(t => t[1] == field)
      }

      const validateSchema = (schema, prefix) => {
        if (!schema.fields) {
          return
        }

        Object.keys(schema.fields).forEach(field => {
          let def = schema.fields[field]
          let path = `${prefix}${field}`
          if (def.required && !hasMapping(path)) {
            this.mappingErrors.push(`No output was found for required field '${path}'.`)
          } else {
            validateSchema(def.type, `${path}.`)
          }
        })
      }

      validateSchema(this.toSchema, '')

      return this.mappingErrors.length == 0
    },

    clickDelete: function() {
      if (confirm(`Are you sure you want to delete this transform?`)) {
        this.$emit('deletetransform', this.value)
        this.$emit('update:show', false)
      }
    },

    closeModal: function() {
      this.$emit('update:show', false)
    }

  }
}
</script>

<style lang="scss" scoped>
  .edit-filter-list-heading {
    display: flex;
    justify-content: space-around;
    margin-top: 1em;
  }

  .edit-filter-list {
    list-style: none;
    margin: 0 0 1em 0;
    padding: 0;

    .filter-item {
      margin-bottom: .5em;
      display: flex;
      align-items: center;

      input[type=text] {
        flex-grow: 1;
        width: 40%;
      }

      div {
        text-align: center;
      }

      div.left{
        width: 2.4em;
      }

      div.right{
        width: 4.8em;
      }
    }
  }

  .edit-transform-header {
    padding: 0.5em 0 1em 0;
    margin-bottom: 1em;
    flex: 1 1 0px;
  }

  .edit-transform-header.left{
    margin-right: 2.4em;
  }

  .edit-transform-header.right{
    margin-right: 4.8em;
  }

  .edit-transform-header label {
    display: inline-block;
    margin-bottom: 0.3em;
  }

  .edit-transform-header select {
    width: 100%;
  }
</style>

<template>
  <div v-on:click.self="closeModal" class="modal-overlay" :class="{visible: show}">
    <div class="modal modal-medium">
      <h1 class ="modal-title">{{ isNew ? 'New' : 'Edit' }} Transform</h1>
      <span v-on:click="closeModal" class ="close-icon"></span>
      <p v-if="message">{{message}}</p>
      <h4 class = "topic-header">Filters</h4>
      <ul class="topic-selection">
        <li v-for="topic in topics">
          <label>
            <input type="checkbox" :value="topic" v-model="value.topics">
            {{topic}}
          </label>
        </li>
      </ul>

      <div class= "edit-filter-list-heading">
        <div class="edit-transform-header left">
          <label for="tranform_from">From</label>
          <select id="transform_from" v-model="value.from">
            <option v-for="(schema, name) in schemas">{{name}}</option>
          </select>
        </div>
        <div class="edit-transform-header right">
          <label for="tranform_from">To</label>
          <select id="transform_to" v-model="value.to">
            <option v-for="name in convertibleSchemas">{{name}}</option>
          </select>
        </div>
      </div>

      <ul class="edit-filter-list">
        <li class="filter-item" v-for="(assignment, idx) in value.transformations">
          <CodeCompletingInput
            v-model="value.transformations[idx][0]"
            :sample="dataSample"
            :schema="fromSchema"></CodeCompletingInput>
          <div class = "left" >
          <span>=</span>
          </div>
          <CodeCompletingInput
            v-model="value.transformations[idx][1]"
            :schema="toSchema"></CodeCompletingInput>
          <div class = "right">
          <input type="button" class="button-small"  @click="value.transformations.splice(idx,1)" value ="- Remove">
          </div>
        </li>
        <li>
          <input type="button" class="button-small"  @click="value.transformations.push(['',''])" value ="＋ Add Transformation">
        </li>
      </ul>
      <div class="button-row headroom">
        <input type="button" class ="button-small delete" @click="clickDelete" v-if="!isNew" value ="Delete" >
        <input type="button" class ="button-small save" @click="clickSave" value ="Save" >
      </div>
    </div>
  </div>
</template>
