<template>
  <div class="modal-overlay" :class="{visible: show}">
    <div class="modal modal-large">
      <h1 class ="modal-title">{{displayTitle}}</h1>
      <span v-if="isCloseable" v-on:click="close" class ="close-icon"></span>
      <div class="two-panel">
        <div class="code-panel">
          <FunctionEditor class="editor" v-model="value.definition"></FunctionEditor>
        </div>
        <div class="control-panel">
          <div class="field">
            <label for="given">Given</label>
            <input type="text" name="given" v-model="value.testInput">
          </div>
          <div class="field">
            <div class="field-row">
              <label for="returns">Returns</label>
              <CopyButton :value="returnValue"/>
            </div>
            <textarea name="returns" readonly="true">{{returnValue}}</textarea>
          </div>


          <div class="field">
            <label for="notes">Notes</label>
            <textarea name="notes" v-model="value.notes"></textarea>
          </div>
        </div>
      </div>

    <div class="feedback-container">
      <CodeErrorDetail
        v-if="hasError"
        class="error-detail"
        :value="currentError">          
        </CodeErrorDetail>
        <div v-else class="success-row">
          <span class="success-icon"></span>
          <p>Valid JavaScript</p>
        </div>
    </div>
      <div class="button-row">
        <input type="button" class="button-small delete" @click="clickDelete" v-if="!isNew" value="Delete">
        <input v-if="isSaveable" type="button" class="button-small save" :disabled="!isValid" @click="clickSave" value="Save">
        <span v-else class="brand">
          <a href="https://www.withTrivial.com" target="_blank"><img/></a>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

  .feedback-container {
    min-height: 9em;

    div.success-row {
      color: var(--success-highlight);
      background-color: var(--background);
      border-radius: 6px;
      padding: 1em;
      display: flex;
      align-items: center;

      span.success-icon {
        background-image: var(--success-icon);
        background-repeat: no-repeat;
        background-position: left center;
        height: 1.5em;
        width: 1.5em;
        display: inline-block;
        margin-right: 0.5em;
      }

      p {
        margin: 0.5em 0;
      } 
    }
  }

  .brand img {
      height: 1.5em;
      width: auto;
      content: var(--logo);
      right: 1em;
      bottom: 1em;
      position: absolute;
  }

  .two-panel {
    display: flex;

    .code-panel {
      box-sizing: content-box;
      width: 67%;
      padding-right: 1em;
      border-right: 2px solid var(--background-80);
      margin-bottom: 1em;

      .editor {
        width: 100%;
        min-height: 23em; // Safari
        height: 100%;
      }
    }

    .control-panel {
      box-sizing: content-box;
      width: 33%;
      padding-left: 1em;

      .field-row {
        display: flex;
        justify-content: space-between;
      }

      input[type=text] {
        font-size: inherit;
        font-family: var(--code-font);
      }

      textarea {
        font-family: var(--code-font);
        font-size: inherit;
        font-weight: inherit;
        width: 100%;
        height: 8em;
        resize: none;
        border: 1px solid var(--input-border-color);
      }
    }
  }

  .error {
    min-height: 1em;
    line-height: 1;
    margin-top: .25em;
    color: var(--error);
  }

  .modal-overlay .modal .button-row {
    margin-top: 1em;
  }

  input[type=button][disabled] {
    opacity: .5;
  }
</style>

<script>
  import FunctionEditor from './controls/FunctionEditor.vue'
  import CodeCompletionGenerator from 'trivial-core/lib/CodeCompletionGenerator'
  import CopyButton from './controls/CopyButton.vue'
  import CodeErrorDetail from './controls/CodeErrorDetail.vue'
  import Modal from './Modal.vue'
  import { track } from '../../lib/TrackingService'

  export default {

    mixins: [
      Modal
    ],

    components: {
      FunctionEditor,
      CopyButton,
      CodeErrorDetail
    },

    props: {
      value: Object,
      show: {
        type: Boolean,
        default: true
      },
      isNew: {
        type: Boolean,
        default: true
      },
      standAloneMode: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: ''
      },
      blocks: Array
    },

    computed: {
      parser() {
        return new CodeCompletionGenerator(this.value.definition, {
          blocks: this.blocks,
          singleExpression: false
        })
      },

      isSaveable() {
        return !this.standAloneMode
      },

      isCloseable() {
        return !this.standAloneMode
      },

      displayTitle() {
        return this.title ? this.title : "Custom Block"
      },

      returnValue() {
        let out = this.parser.firstDefinedFunctionReturnsFor(this.value.testInput)
        if( typeof out == 'undefined') { out = 'undefined'}
        return typeof out == 'string' ? out : JSON.stringify(out, null, 2)
      },

      isValid() {
         return undefined === this.currentError
       },

      hasError() {
        return this.value && this.parser.parseError
      },

      currentError() {
          return this.parser.parseError
      },

    },

    methods: {
      clickSave: function() {
        this.updateName()

        if (! this.isValid)
          return;

        if (this.isNew){
          this.$emit('addfunction', this.value)
          track('Created Custom Function', {})
        }
        else
          this.$emit('updatefunction', this.value)

        this.$emit('close')
      },

      clickDelete: function() {
        this.updateName()

        if (confirm(`Are you sure you want to delete the function '${this.value.name}'?`)) {
          this.$emit('deletefunction', this.value)
          this.$emit('close')
        }
      },

      // close: function() {
      //   this.$emit('close')
      // },

      updateName: function() {
        this.value.name = this.parser.firstDefinedFunctionName()
      }

    }
  }
</script>
