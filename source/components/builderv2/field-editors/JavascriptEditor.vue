<script>
  import ConfigResolver from 'trivial-core/lib/ConfigResolver'
  import { VAceEditor } from 'vue3-ace-editor'
  import 'ace-builds/src-noconflict/mode-javascript'     // language
  import 'ace-builds/src-noconflict/theme-chrome';       // light theme
  import 'ace-builds/src-noconflict/theme-monokai'       // dark theme
  import 'ace-builds/src-noconflict/ext-language_tools'  // language extension prerequsite...
  import 'ace-builds/src-noconflict/snippets/javascript' // snippet
  export default {
    components: {
      VAceEditor
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

      setTheme() {
        let userTheme
        try {
          userTheme = this.$store.state.user.color_theme
        } catch (e) { }
        if (!userTheme || userTheme == 'Dark') {
          this.aceTheme = 'monokai'
        } else {
          this.aceTheme = 'chrome'
        }
      },

      editorInit(editor) {
        this.setTheme()
      },

    }
  }
</script>

<template>
  <div :key="name" class="field function-editor" :class="{required: field.required}">
    <!-- NOTE: this does not emit changes to the parent; the parent watches via @input -->
    <!--       If we wanted to turn on automcompletions from Ace, this would need to emit it's changes -->

    <!-- NOTE: this is largely similar to controls/FunctionEditor.vue, and suggests a refactor is possible -->

    <v-ace-editor
      v-model:value="content"
      @init="editorInit"
      lang="javascript"
      :theme="aceTheme"
      :useWorker="false"
      :showPrintMargin="false"
      style="height: 500px;"
    />
    <!-- <editor v-model="content" @init="editorInit" @input="aceInput" lang="javascript" :theme="aceTheme" width="100%" height="500" :options="{useWorker: false, showPrintMargin: false}"></editor> -->
  </div>
</template>

<style lang="scss" scoped>
  .function-editor {
    position: relative;
    border: 1px solid var(--input-border-color);
    background-color: var(--background-high-contrast);
    border-radius: 0px;
    box-shadow: 6px 6px 0px 0px var(--surface);

    textarea {
      width: 100%;
      height: 100%;
      border: 0px none;
      background: transparent;
      position: absolute;
      top: 0px;
      left: 0px;
      font-size: inherit;
      padding: 2px 2px 2px 3em;
      box-sizing: border-box;
      color: var(--on-surface);
      resize: none;
    }

  }
</style>