<script>
  import HideableSection from '../../controls/HideableSection.vue'
  import Icon from '../../Icon.vue'
  import ToolTip from '../../controls/ToolTip.vue'
  import transformEditors from '../transform-editors'
  import { optionalFields, defaultValueForField } from 'trivial-core/lib/schema-utils'
  import { TrivialSchemas } from 'trivial-core/lib/TrivialSchemas'
  import { TypeIdentifier } from 'trivial-core/lib/TypeAssigner'
  import { fieldSpecAtPath } from 'trivial-core/lib/code-utils'
  import { mapActions, mapGetters, mapState } from 'vuex'

  export default {
    components: {
      HideableSection,
      Icon,
      ToolTip,
      ...transformEditors
    },

    props: {
      name: String,
      field: Object,
      config: Object,
      credentials: Object,
      context: Object,
      allowFieldCreation: Boolean
    },

    data() {
      return {
        loadingDataSample: true,
        adding: false,
        addName: '',
        addError: null
      }
    },

    created() {
      this.requireDataSample()
      .then(s => this.loadingDataSample = false)
    },

    computed: {

      displayFieldCreation() {
        // Allow field creation unless it is explicitly denied by the action description
        if (typeof(this.allowFieldCreation) == 'undefined')  { return true }
        return this.allowFieldCreation
      },

      transformations() {
        return this.config.transformations
      },

      runtimeDataSample() {
        return {
          initialPayload: (this.dataSample || {}).payload || {},
          [(this.context || {}).inputName || 'payload']: this.interStepDataSample
        }
      },

      interStepDataSample() {
        try {
          let sample = this.dataSample.diagnostics.events.find(e => e.transformId == this.context.identifier)
          return sample.detail.inputValue
        } catch (e) {
          console.log(`Could not determine inputValue from data sample: ${e}`)
          return {}
        }

      },

      customFunctions() {
        return this.$store.state.manifest.content.definitions.filter(d => d.type === 'function')
      },

      schemas() {
        return TrivialSchemas
      },

      fromSchema() {
        return this.schemas[this.config.from]
      },

      toSchema() {
        return this.schemas[this.config.to]
      },

      blankAddName() {
        return /^\s*$/.test(String(this.addName || ''))
      },

      validAddName() {
        return ((! this.blankAddName) && (! this.addError))
      },

      transformationTuples() {
        return (this.transformations || []).map(t => [t.from, t.to])
      },

      optionalFields() {
        return optionalFields(
          this.toSchema,
          this.transformationTuples
        )
      },

      sectionTitle() {
        return this.playgroundMode ? 'Playground' : 'Config'
      },

      ...mapState([
        'dataSample',
        'playgroundMode',
        'tourMode',
        'tourStep'
      ]),

      ...mapGetters([
        'hiddenByTour'
      ]),

    },

    methods: {

      spec(path) {
        return this.toSchema ? new TypeIdentifier(this.toSchema).specAt(path) : undefined
      },

      placeholder(path) {
        let spec = this.spec(path)
        if (spec && 'undefined' !== typeof spec.example) {
          return spec.example
        } else if (spec && 'undefined' !== typeof spec.placeholder) {
          return spec.placeholder
        } else {
          return ''
        }
      },

      toTitleCase(str) {
        if (typeof str !== 'string') { return str }
        return str.replaceAll("_", " ")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      },

      schemaFieldValueWithFallback(param, path, fallback) {
        try {
          let spec = this.spec(path)
          if (spec && 'undefined' !== typeof spec[param]) {
            return spec[param]
          } else {
            return this.toTitleCase(fallback)
          }
        } catch(e) {
          return this.toTitleCase(fallback)
        }
      },

      editorOptions(path) {
       let fallback = null
        try {
          let spec = this.spec(path)
          return spec.editorOptions || fallback
        } catch(e) {
          return fallback
        }
      },

      editorComponentType(path) {
        let fallback = 'CodeCompletingInput'
        try {
          let spec = this.spec(path)
          return spec.editorComponent || fallback       
        } catch(e) {
          return fallback
        }
      },

      possibleValues(toPath) {
        try {
          const spec = fieldSpecAtPath(this.toSchema, toPath)
          return spec ? spec.allowed : undefined
        } catch (e) {
          console.warn(`Invalid path "${toPath}"`, e)
        }
      },

      removeField(transform) {
        if (confirm(`Remove the field "${transform.to}"?`)) {
          const idx = this.transformations.indexOf(transform)
          if (idx !== -1) {
            this.transformations.splice(idx, 1)
          }
        }
      },

      startAdd() {
        this.addName = '';
        this.adding = true;
      },

      addField() {
        if (this.validAddName) {
          this.transformations.push({from: this.exampleValue(this.addName), to: this.addName})
          this.addName = '';
          this.adding = false;
        }
      },

      updateAddError(value) {
        this.addError = value;
      },

      directAdd(fieldName) {
        this.transformations.push({from: this.exampleValue(fieldName), to: fieldName})
      },

      exampleValue(path) {
        try {
          const spec = fieldSpecAtPath(this.toSchema, path)
          return spec ? defaultValueForField(spec) : ''
        } catch (e) {
          console.warn(`Invalid or unknown path "${path}"`, e)
        }
      },

      ...mapActions([
        'requireDataSample'
      ])
    }
  }
</script>

<template>
  <div class='transform-fields'>
      <div v-for="(xform, idx) in transformations">
        <div class="field" ref="fields">
          <label>
            <span>{{schemaFieldValueWithFallback('label', xform.to, xform.to)}}</span>
            <ToolTip
              v-if="possibleValues(xform.to)"
              sizeToAncestor="label"
              :value="`Possible values: ${possibleValues(xform.to).map(v => JSON.stringify(v)).join(', ')}`">ⓘ</ToolTip>
          </label>

          <Component v-if="!loadingDataSample"
            :is="editorComponentType(xform.to)"
            v-model="xform.from"
            :options="editorOptions(xform.to)"
            :sample="runtimeDataSample"
            :schema="fromSchema"
            :placeholder="placeholder(xform.to)"
            :blocks="customFunctions"
            :expand-errors="true"
            :show-reference-errors="true"></Component>
          <button v-if="schemaFieldValueWithFallback('deletable', xform.to, true)" class="remove-field" @click="removeField(xform)" aria-label="remove field"><Icon icon="times-circle"></Icon></button>
        </div>
      </div>
      <div v-if="optionalFields.length > 0" class="optional-fields">
        Optional fields:
        <span v-for="(fieldName, idx) in optionalFields" :key="fieldName">
          <button @click="directAdd(fieldName)" class="link">{{fieldName}}</button><span v-if="idx < optionalFields.length - 1">, </span>
        </span>
      </div>

      <span v-if="displayFieldCreation">
        <button v-if="!adding" class="button-small" @click="startAdd">Add a Custom Field</button>
        <div v-if="adding">
          <div class="field new-section">
            <label>New field name:</label>
            <CodeCompletingInput
              v-model="addName"
              :schema="toSchema"
              :blocks="customFunctions"
              @update:error="updateAddError"
              @submit="addField"></CodeCompletingInput>
          </div>
          <button class="button-small" @click="addField" :disabled="!validAddName">Add</button>
        </div>
      </span>
  </div>
</template>

<style lang="scss" scoped>

  .field {
    position: relative;
    box-sizing: border-box;
    padding-right: 1.5em;
    margin-bottom: 1em;

    &.new-section {
      margin-top: 1em;
      padding-top: 1em;
      border-top: 1px solid var(--on-surface);

      > label {
        font-weight: 400;
      }
    }

    .remove-field {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translate(0, -50%);
      background-color: transparent;
      color: inherit;
      cursor: pointer;
      clip: rect(1px, 1px, 1px, 1px);

      &:focus {
        clip: unset;
      }
    }

    &:hover .remove-field {
      clip: unset;
    }

    label {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      column-gap: .25em;
    }
  }

  button[disabled] {
    opacity: .6;
  }

  .optional-fields {
    margin-bottom: 1em;

    button {
      background: transparent;
      color: var(--link);
      font-size: inherit;
      cursor: pointer;
      margin: 0;
      padding: 0;

      &:hover, &:active {
        background-color: var(--background-high-contrast);
        border-radius: 6px;
      }
    }
  }
</style>
