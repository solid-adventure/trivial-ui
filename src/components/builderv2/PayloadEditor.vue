<script>

  import CodeErrorDetail from '../controls/CodeErrorDetail.vue'
  import Modal from '../../components/Modal.vue'
  import { mapActions } from 'vuex'

  export default {

    mixins: [
      Modal
    ],

    components: {
      CodeErrorDetail,
    },

    props: {
      payload: {
        type: String,
        required: true
      }
    },

    data() {
      return {
        draftPayload: "{}"
      }
    },

    created() {
      this.requireDataSample().then( response => {
        this.draftPayload = JSON.stringify(this.$store.state.dataSample.payload, null, 2)
        }
      )
    },

    computed: {
      payloadLines() {
        return (this.draftPayload || '').split("\n")
      },

      hasError: function() {
        return typeof this.currentError != 'undefined'
      },

      currentError: function() {
        try { JSON.parse(this.draftPayload) }
        catch(e) {
          return e
        }
      }
    },

    methods: {

      save() {
        this.$store.commit('setCustomPayload', this.draftPayload)
        this.$emit('close')
      },

      payloadScroll(event) {
        this.$refs.lines.scrollTop = event.target.scrollTop
      },

      ...mapActions([
        'requireDataSample'
      ])
    }
  }
</script>

<template>
  <div class="modal-overlay visible">
    <div class="modal modal-medium-large">
      <h1 class="modal-title">Manual Payload</h1>
      <p>This JSON is sent to your app when you run it manually.</p>
      <div class="row">
      <span class='pro-tip'>Pro Tip</span>
      <p>The data your app receives is available to your actions with the variable <pre>initialPayload</pre>.
      </p>
      </div>
      <span @click="close" class="close-icon"></span>
      <div class="payload-editor">
        <ul class="lines" ref="lines" aria-hidden="true">
          <li v-for="(line, num) in payloadLines"><span class="number">{{num+1}}</span>{{line || ' '}}</li>
        </ul>
        <textarea
          v-model="draftPayload"
          class="code-entry"
          autocomplete="off"
          spellcheck="false"
          @scroll="payloadScroll"></textarea>
      </div>
      <div class="feedback-container">
        <CodeErrorDetail
          v-if="hasError"
          class="error-detail"
          :value="currentError"></CodeErrorDetail>
        <div v-else class="success-row">
          <span class="success-icon"></span>
          <p>Valid JSON</p>
        </div>
      </div>
      <div class="button-row headroom">
        <input type="button" class="button-medium save" @click="save" value="Save">
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

  .modal-overlay pre {
    display: inline;
  }

  .feedback-container {
    min-height: 5em;

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

  .row {
    display: flex;
    align-content: flex-start;
    padding-top: 1em;

    .pro-tip {
      background-color: var(--background-high-contrast);
      color: var(--success-highlight);
      padding: 4px 8px;
      margin-right: 8px;
      border-radius: 6px;
      border: 1px solid var(--success-highlight);
      flex-shrink: 0;
      height: fit-content;
    }

    p {
      padding: 0 8em 0 0;
      margin-top: 0;
    }

  }

  .button-row {
    flex-direction: column;
  }

  .payload-editor {
    position: relative;
    height: 15em;
    border-radius: 8px;
    border: 1px solid var(--input-border-color);

    textarea {
      width: 100%;
      height: 100%;
      border: 0px none;
      background: transparent;
      position: absolute;
      top: 0px;
      left: 0px;
      font-size: inherit;
      padding: 2px 2px 2.5em 3em;
      box-sizing: border-box;
      color: inherit;
      resize: none;
    }

    .lines {
      position: absolute;
      top: 0px;
      left: 0px;
      font-family: var(--code-font);
      margin: 0;
      padding: 2px 2px 2.5em 3em;
      box-sizing: border-box;
      white-space: pre-wrap;
      list-style: none;
      height: 100%;
      overflow-y: auto;
      color: transparent;
      width: 100%;
      border-radius: 8px 0 0 0;

      li {
        position: relative;
        width: 100%;

        .number {
          position: absolute;
          top: 0;
          left: -3em;
          box-sizing: border-box;
          width: 3em;
          padding: 0 .125em;
          height: 100%;
          text-align: center;
          overflow: hidden;
          background-color: var(--background-high-contrast);
          color: var(--on-background-high-contrast);
        }
      }
    }
  }
</style>
