<script>
  import ConfigResolver from 'trivial-core/lib/ConfigResolver'



  export default {
    components: {
      editor: require('vue2-ace-editor')
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
        aceTheme: ''
      }
    },

    computed: {

      configResolver() {
        return new ConfigResolver(this.credentials)
      }

    },

   mounted() {
      this.content = this.valueOf(this.config[this.name])
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

      humanize(value) {
        return String(value).replaceAll('_', ' ')
      },

      input(event) {
        this.setValue(this.name, event.target.value)
      },

      aceInput(event) {
        this.setValue(this.name, event)
      },

      requireForTheme() {
        let userTheme
        try {
          userTheme = this.$store.state.user.color_theme
        } catch (e) { }
        if (!userTheme || userTheme == 'Dark' ) {
          require('brace/theme/monokai')
          this.aceTheme = 'monokai'
        } else {
          require('brace/theme/chrome')
          this.aceTheme = 'chrome'
        }

      },


      editorInit(editor) {
            require('brace/ext/language_tools') //language extension prerequsite...
            require('brace/mode/javascript')    //language
            require('brace/snippets/javascript') //snippet
            this.requireForTheme()
        }
    }
  }
</script>

<template>
  <div :key="name" class="field" :class="{required: field.required}">
    <h3>If</h3>
    <editor v-model="content" @init="editorInit" @input="aceInput" lang="javascript" :theme="aceTheme" width="100%" height="80" :options="{useWorker: false, showPrintMargin: false}"></editor>
  </div>
</template>

<style lang="scss" scoped>


</style>
