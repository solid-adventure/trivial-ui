<template>
  <div class="autocomplete-input" :class="{expanded: showList}">
    <div class="autocomplete-container">
      <Component v-if="suggestionHelperType" :is="suggestionHelperType" @handleSuggestion="handleSuggestion" @handleRunQuery="syntheticRunQueryClick" />
      <FunctionEditor :value="valueWithoutBackticks" @input="handleInput" :options="options" />
      <ActionButton v-if="previewHelperType" ref="runQueryButton" value='Preview<span class="shortcut"> ⌘ + return</span>' :action="runQuery" class="button button-small preview-button" workingValue="Running..." />
      <ul ref="list" class="completions" v-if="showList">
        <li v-for="(str, idx) in matchingCompletions"
            @mousedown="complete(str)"
            :class="{highlighted: idx === highlightedIndex}">{{str}}</li>
      </ul>
      <ToolTip
        class="info"
        v-if="possibleValues && !hasResolvedValue"
        :size-to="toolTipSize"
        :value="`Possible values: ${possibleValues.map(v => JSON.stringify(v)).join(', ')}`">ⓘ</ToolTip>
    </div>
    <div v-if="hasResolvedValue && !playgroundMode" class="resolved-display">
      <pre>{{resolvedValue}}</pre>
    </div>
    <Component v-if="previewHelperType" :is="previewHelperType" :query="resolvedValue" />
    <CodeErrorDetail
      v-if="displayError && hasError && expandErrors"
      class="error-detail"
      :value="currentError"></CodeErrorDetail>
  </div>
</template>

<style lang="scss" scoped>
  @import "../../../assets/stylesheets/includes/variables";

  .autocomplete-input {
    flex-grow: 1;

    .autocomplete-container {
      display: flex;
      flex-direction: column;
      position: relative;

      > .code-entry.error {
        border-color: var(--error);
        outline: none;
      }
    }

    &.expanded {
      z-index: 100;
    }
  }

   div::-webkit-scrollbar { /* Safari, Chrome*/
   display: none;
  }

   div {
     scrollbar-width: none;  /* Firefox */
  }


  .resolved-display {
    padding: 0 1em;
    background-color: var(--accent-20);
    color: var(--on-accent-20);
    border-radius: 0px;
    max-height: 10em;
    overflow: scroll;
    margin-left: 8px;

  }

  .completions {
    position: absolute;
    top: 1em;
    left: 41px; // width of the ace editor gutter
    width: 100%;
    box-sizing: border-box;
    padding: .5em 0;
    margin: 0;
    list-style: none;
    max-height: 5em;
    overflow: auto;
    background-color: var(--surface);
    color: var(--on-surface);
    box-shadow: 2px 2px 4px 1px rgba(0, 0, 0, .2);

    > li {
      text-align: left;
      cursor: pointer;
      padding: 0 .5em;

      &.highlighted {
        background-color: var(--primary);
        color: var(--on-primary);
      }
    }
  }

  .info {
    position: absolute;
    top: .5em;
    right: .75em;
    cursor: default;
    color: var(--on-background-20);
    font-size: .75rem;
  }

  .error-detail {
  }

  .preview-button {
    width: fit-content;
    position: absolute;
    bottom: 1em;
    right: 1em;
    background: var(--secondary);
    z-index: 10;
    color: var(--on-primary);
  }


</style>

<script>
  import ActionButton from '../../controls/ActionButton.vue'
  import CodeCompletionGenerator from 'trivial-core/lib/CodeCompletionGenerator'
  import CodeErrorDetail from '../../controls/CodeErrorDetail.vue'
  import FunctionEditor from '../../controls/FunctionEditor.vue'
  import ToolTip from '../../controls/ToolTip.vue'
  import QueryHelper from '../preview-helpers/QueryHelper.vue'
  import QuerySuggestionManager from '../suggestion-managers/QuerySuggestionManager.vue'
  import { mapMutations, mapState } from 'vuex'

  export default {
    components: {
      ActionButton,
      CodeErrorDetail,
      FunctionEditor,
      ToolTip,
      QueryHelper,
      QuerySuggestionManager
    },

    props: {
      options: {
        type: Object,
        default: {},
        required: false
      },
      value: String,
      sample: Object,
      schema: [Object, Function],
      variable: String,
      showResolvedValue: {
        type: Boolean,
        default: true
      },
      blocks: Array,
      placeholder: {
        type: String,
        default: ''
      },
      expandErrors: {
        type: Boolean,
        default: false
      },
      showReferenceErrors: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        samples: [],
        open: false,
        highlighted: null,
        toolTipSize: null,
        backticksRemoved: false,
        errorTimer: null,
        displayError: false
      }
    },

    computed: {

      previewHelperType() {
        return this.options.previewHelper
      },

      suggestionHelperType() {
        return this.options.suggestionManager
      },

      valueWithoutBackticks() {
        let out = this.value.trim()
        if (out[0] == '`' && out[out.length -1] == '`') {
          out = out.slice(1)
          out = out.slice(0, out.length - 1)
          this.backticksRemoved = true
        }
        return out
      },

      completionGenerator: function() {
        const gen = new CodeCompletionGenerator(this.value, {
          insertionCol: this.$refs.input ? this.$refs.input.selectionEnd : -1,
          schema: this.schema,
          dataSample: this.sample,
          variable: this.variable,
          blocks: this.blocks
        })

        if (gen.parseError) {
          this.$emit('update:error', gen.parseError)
        } else {
          this.$emit('update:error', null)
        }

        return gen
      },



      matchingCompletions: function() {
        let matching = this.completionGenerator.completions()
        this.updateHighlightingForCompletions(matching)
        return matching
      },

      showList: function() {
        return false // TODO: Ace has its own completions engine that should be levereged
        // return this.open && this.matchingCompletions.length > 0
      },

      highlightedIndex() {
        return this.matchingCompletions.findIndex(c => this.highlighted === c)
      },

      resolvedValue: function() {
        return this.completionGenerator.evaluatesAs()
      },

      hasResolvedValue: function() {
        return this.showResolvedValue && this.sample && this.resolvedValue !== undefined
      },

      possibleValues: function() {
        return this.completionGenerator.allowedValues()
      },

      hasError: function() {
        if (this.value && this.completionGenerator.parseError) {
          return true
        } else if (this.showReferenceErrors) {
          return this.resolvedValue === undefined && this.completionGenerator.referenceError
        } else {
          return false
        }
      },

      currentError: function() {
        if (this.completionGenerator.parseError) {
          return this.completionGenerator.parseError
        } else if (this.showReferenceErrors && this.resolvedValue === undefined) {
          return this.completionGenerator.referenceError
        }
      },

      ...mapState([
        'playgroundMode'
      ]),
    },

    updated() {
      this.scrollHighlightedIntoView()
    },

    mounted() {
      this.toolTipSize = this.$refs.input

      this.$store.state.keyboardControl.register(
        'command-Enter',
        'Preview',
        this.syntheticRunQueryClick.bind(this),
        {}
      )
    },

    watch: {
      hasError(val) {
        window.clearTimeout(this.errorTimer)
        this.errorTimer = window.setTimeout(() => {
          this.displayError = val
        }, 500)
      }
    },


    methods: {

      syntheticRunQueryClick() {
        this.$refs.runQueryButton.click()
      },

      async runQuery() {
        await this.$root.$refs.QueryHelper.runQuery()
      },

      handleInput(val) {
        if (this.backticksRemoved) { val = `\`${val}\``}
        this.$emit('input', val)
        this.open = true
      },

      handleSuggestion(val) {
        this.$emit('input', val)
      },

      complete(str) {
        if (str) {
          this.$emit('input', this.completionGenerator.complete(str))
        }
        this.open = false
      },

      highlightByIndex(newIndex) {
        if (this.matchingCompletions.length < 1) {
          this.highlighted = null
        } else if (newIndex < 0) {
          this.highlighted = this.matchingCompletions[0]
        } else if (newIndex >= this.matchingCompletions.length) {
          this.highlighted = this.matchingCompletions[this.matchingCompletions.length - 1]
        } else {
          this.highlighted = this.matchingCompletions[newIndex]
        }
      },

      scrollHighlightedIntoView() {
        if (this.highlightedIndex >= 0) {
          this.scrollIndexIntoView(this.highlightedIndex)
        }
      },

      scrollIndexIntoView(idx) {
        if (this.$refs.list) {
          let elem = this.$refs.list.getElementsByTagName('li')
          elem = elem ? elem[idx] : null
          if (elem) {
            elem.scrollIntoView({block: 'nearest'})
          }
        }
      },

      updateHighlightingForCompletions(matching) {
        let highlightIdx = matching.findIndex(m => m === this.highlighted)
        if (-1 === highlightIdx) {
          highlightIdx = 0
          this.highlighted = matching[highlightIdx]
        }
      }
    }
  }
</script>
