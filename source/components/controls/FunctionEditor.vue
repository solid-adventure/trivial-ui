<template>
  <div class="function-editor">
    <editor :value="value" @init="editorInit" @input="aceInput" :lang="optionsWithDefaults.lang" :theme="aceTheme" :width="optionsWithDefaults.width" :height="optionsWithDefaults.height" :options="{useWorker: false, showPrintMargin: false}"></editor>
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
  export default {
    props: {
      value: String,
      options: {
        type: Object,
        required: false,
        default: {}
      }

    },

    data() {
      return {
        aceTheme: ''
      }
    },

    components: {
      editor: require('vue2-ace-editor')
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

      aceInput(event) {
        this.$emit('input', event)
      },

      requireForTheme() {
        let userTheme
        try {
          userTheme = this.$store.state.user.color_theme
        } catch (e) { }
        if (!userTheme || userTheme == 'Dark') {
          require('brace/theme/monokai')
          this.aceTheme = 'monokai'
        } else {
          this.aceTheme = 'chrome'
        }

      },

      editorInit(editor) {
        require('brace/theme/chrome') // theme boilerplate
        require('brace/ext/language_tools') //language extension prerequsite...
        require('brace/mode/javascript')    //language
        require('brace/mode/sql')    //language
        require('brace/snippets/javascript') //snippet
        this.requireForTheme()
      }

    }
  }
</script>
