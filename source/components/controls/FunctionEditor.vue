<template>
  <div class="function-editor">
    <!-- NOTE: this does not emit changes to the parent; the parent watches via @input -->
    <!--       If we wanted to turn on automcompletions from Ace, this would need to emit it's changes -->

    <!-- NOTE: this is largely similar to field-editors/JavascriptEditor.vue, and suggests a refactor is possible -->

    <v-ace-editor
      v-model:value="content"
      @init="editorInit"
      :lang="optionsWithDefaults.lang"
      :theme="aceTheme"
      useWorker="false"
      showPrintMargin="false"
      :style="{height: optionsWithDefaults.height}"
    />
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

<script>

  import { VAceEditor } from 'vue3-ace-editor'
  import 'ace-builds/src-noconflict/mode-json'
  import 'ace-builds/src-noconflict/mode-javascript'     // language
  import 'ace-builds/src-noconflict/mode-sql'            // language
  import 'ace-builds/src-noconflict/theme-chrome';       // light theme
  import 'ace-builds/src-noconflict/theme-monokai'       // dark theme
  import 'ace-builds/src-noconflict/ext-language_tools'  // language extension prerequsite...
  import 'ace-builds/src-noconflict/snippets/javascript' // snippet

  export default {
    props: {
      modelValue: {
        type: String,
        default: '',
      },
      options: {
        type: Object,
        required: false,
        default: {}
      }

    },

    data() {
      return {
        aceTheme: '',
        content: this.modelValue
      }
    },

    components: {
      VAceEditor
    },

    computed: {

      optionsWithDefaults() {
        let defaults = {
          width: "100%",
          height: "400px",
          lang: "javascript"
        }
        return Object.assign(defaults, this.options)
      }
    },

    methods: {

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
      }

    }
  }
</script>
