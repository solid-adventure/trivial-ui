<script>
  import ConfigResolver from 'trivial-core/lib/ConfigResolver'



  export default {
    components: {
      editor: require('vue3-ace-editor')
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
          require('ace-builds/src-noconflict/theme-monokai')
          this.aceTheme = 'monokai'
        } else {
          require('ace-builds/src-noconflict/theme-chrome')
          this.aceTheme = 'chrome'
        }

      },


      editorInit(editor) {
            require('ace-builds/src-noconflict/ext-language_tools') //language extension prerequsite...
            require('ace-builds/src-noconflict/mode-javascript')    //language
            require('ace-builds/src-noconflict/snippets/javascript') //snippet
            this.requireForTheme()
        }
    }
  }
</script>

<template>
  <div :key="name" class="field" :class="{required: field.required}">
    <editor v-model="content" @init="editorInit" @input="aceInput" lang="javascript" :theme="aceTheme" width="100%" height="500" :options="{useWorker: false, showPrintMargin: false}"></editor>
  </div>
</template>

<style lang="scss" scoped>


</style>
