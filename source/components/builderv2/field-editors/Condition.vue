<script>
  import ConfigResolver from 'trivial-core/lib/ConfigResolver'
  import CodeCompletingInput from '../transform-editors/CodeCompletingInput.vue'
  import { mapActions, mapState } from 'vuex'


  export default {
    components: {
      CodeCompletingInput
    },

    props: {
      name: String,
      field: Object,
      config: Object,
      credentials: Object,
      context: Object
    },

    data() {
      return {
        reveal: false,
        content: '',
        loadingDataSample: false
      }
    },

    watch: {
      content: {
        handler(val) {
          this.setValue(this.name, val)
        }
      }
    },

    computed: {

      configResolver() {
        return new ConfigResolver(this.credentials)
      },

      runtimeDataSample() {
        return {
          initialPayload: (this.dataSample || {}).payload
        }
      },

      customFunctions() {
        return this.$store.state.manifest.content.definitions.filter(d => d.type === 'function')
      },

      ...mapState([
        'dataSample'
      ])

    },

   mounted() {
      this.content = this.valueOf(this.config[this.name])
      this.requireDataSample()
      .then(s => this.loadingDataSample = false)
    },

    methods: {
      valueOf(val) {
        return this.configResolver.valueOf(val)
      },

      setCredentialValue(ref, value) {
        return this.configResolver.setCredentialValue(ref, value)
      },

      setValue(name, val) {
        return this.configResolver.setValue(this.config, name, val)
      },

      editorOptions(field) {
        return {
          name: this.name,
          field: field,
          config: this.config,
          credentials: this.credentials,
          context: this.context
        }
      },

      placeholder(field) {
        return field.placeholder
      },

      help(field) {
        return field.help
      },


      ...mapActions([
        'requireDataSample'
      ])


    }
  }
</script>

<template>
  <div :key="name" class="field" :class="{required: field.required}">
    <h3 class="label">When</h3>
    <em class="help">{{ help(field) }}</em>
    <CodeCompletingInput v-if="!loadingDataSample"
      v-model="content"
      :options="editorOptions(field)"
      :sample="runtimeDataSample"
      :placeholder="placeholder(field)"
      :blocks="customFunctions"
      :expand-errors="true"
      :show-reference-errors="true"></CodeCompletingInput>
  </div>
</template>

<style lang="scss" scoped>

h3.label {
  margin-bottom: 0;
}

em.help {
  color: var(--on-background-40);
  margin-bottom: 1em;
}

</style>
