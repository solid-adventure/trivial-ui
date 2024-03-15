<template>
  <div class="autocomplete-input" :class="{expanded: showList}">
    <div class="autocomplete-container">
      <input type="text"
             class="code-entry"
             name="search_code"
             :class="{error: hasError}"
             autocomplete="off"
             :value="modelValue"
             :placeholder="placeholder"
             @input="input"
             @blur="blur"
             @keydown="keydown"
             ref="input"
             >
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
    <div v-if="hasResolvedValue" class="resolved-display">
      <pre>{{resolvedValue}}</pre>
    </div>

    <CodeErrorDetail
      v-if="hasError && expandErrors"
      class="error-detail"
      :value="currentError"></CodeErrorDetail>
  </div>
</template>

<style lang="scss" scoped>

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

  }

  .completions {
    position: absolute;
    top: 2em;
    left: 0;
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
</style>

<script>
  import CodeCompletionGenerator from 'trivial-core/lib/CodeCompletionGenerator'
  import CodeErrorDetail from '../../controls/CodeErrorDetail.vue'
  import ToolTip from '../../controls/ToolTip.vue'

  export default {
    components: {
      CodeErrorDetail,
      ToolTip
    },

    props: {
      modelValue: String,
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
        toolTipSize: null
      }
    },

    computed: {
      completionGenerator: function() {
        const gen = new CodeCompletionGenerator(this.modelValue, {
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
        return this.open && this.matchingCompletions.length > 0
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
        if (this.modelValue && this.completionGenerator.parseError) {
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
      }
    },

    updated() {
      this.scrollHighlightedIntoView()
    },

    mounted() {
      this.toolTipSize = this.$refs.input
    },

    methods: {
      input(event) {
        this.$emit('update:modelValue', event.target.value)
        this.open = true
      },

      blur() {
        this.open = false
      },

      complete(str) {
        if (str) {
          this.$emit('update:modelValue', this.completionGenerator.complete(str))
        }
        this.open = false
      },

      keydown(event) {
        if (!this.open) {
          if (["Enter", "ArrowUp", "ArrowDown"].indexOf(event.code) !== -1) {
            event.preventDefault()
            this.open = true
          }
          if ('Enter' === event.code && this.modelValue) {
            this.$emit('submit')
          }
          return
        }

        switch (event.code) {
        case "Escape":
          this.open = false
          event.preventDefault()
          break

        case "ArrowDown":
          this.highlightByIndex(this.highlightedIndex + 1)
          event.preventDefault()
          break

        case "ArrowUp":
          this.highlightByIndex(this.highlightedIndex - 1)
          event.preventDefault()
          break

        case "Home":
          this.highlightByIndex(0)
          event.preventDefault()
          break

        case "End":
          this.highlightByIndex(this.matchingCompletions.length - 1)
          event.preventDefault()
          break

        case "Enter":
        case "Tab":
          this.complete(this.highlighted)
          event.preventDefault()
          break
        }
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
