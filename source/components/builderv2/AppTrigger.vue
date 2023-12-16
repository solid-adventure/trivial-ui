<script>
  import ActionButton from '../controls/ActionButton.vue'
  import Clipboard from '../../lib/Clipboard'
  import Icon from '../Icon.vue'
  import KeyboardControl from './KeyboardControl.vue'
  import Notifications from '../notifications'
  import { fetchJSON } from 'trivial-core/lib/component-utils'
  import { mapState, mapGetters } from 'vuex'

  const RECEIVE_MODE = 0
  const RESEND_MODE = 1
  const CUSTOM_MODE = 2
  const SELECT_MODE = 3

  export default {
    components: {
      ActionButton,
      Icon,
      KeyboardControl
    },

    props: {
      customPayload: {
        type: String,
        default: '{}'
      },
      buildDirty: {
        type: Boolean,
        default: false
      },
      buildInProgress: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        mode: CUSTOM_MODE,
        copyButtonText: 'Copy Webhook URL',
        displayKeyboardControls: false
      }
    },

    mounted() {
      this.$store.state.keyboardControl.register('/', "Display Shortcuts", this.openKeyboardControls.bind(this))
      this.$store.state.keyboardControl.register('shift-?', "", this.openKeyboardControls.bind(this))

      this.$store.state.keyboardControl.register('command-shift-r', "Run w/Manual Payload", this.syntheticsendCustomWithConfirmationClick.bind(this))
      this.$store.state.keyboardControl.register('command-l', "Run w/Last Payload", this.syntheticResendLastClick.bind(this))
      this.$store.state.keyboardControl.register('command-p', "Edit Payload", this.configureData.bind(this))


    },

    computed: {
      RECEIVE_MODE() {
        return RECEIVE_MODE
      },

      RESEND_MODE() {
        return RESEND_MODE
      },

      CUSTOM_MODE() {
        return CUSTOM_MODE
      },

      SELECT_MODE() {
        return SELECT_MODE
      },

      inReceiveMode() {
        return RECEIVE_MODE === this.mode
      },

      inResendMode() {
        return RESEND_MODE === this.mode
      },

      inCustomMode() {
        return CUSTOM_MODE === this.mode
      },

      inSelectMode() {
        return SELECT_MODE === this.mode
      },

      ...mapState([
        'app'
      ]),

      ...mapGetters([
        'appUrl'
      ])
    },

    methods: {

      openKeyboardControls() {
        this.displayKeyboardControls = true
      },

      closeKeyboardControls() {
        this.displayKeyboardControls = false
      },

      copyUrl() {
        Clipboard.copy(this.appUrl)
        let width = this.$refs.copy.getBoundingClientRect().width
        this.$refs.copy.style.width = `${Math.ceil(width)}px`
        this.copyButtonText = 'Copied!'
        setTimeout(() => this.copyButtonText = 'Copy Webhook URL', 750)
      },

      syntheticResendLastClick() {
        this.$refs.resendLastButton.click()
      },

      async resendLast() {
        try {
          const appId = this.app.name
          const webhooks = await fetchJSON(`/proxy/trivial?path=/webhooks&app_id=${appId}&limit=1`)
          if (webhooks[0]) {
            await fetchJSON('/proxy/trivial', {
              method: 'post',
              headers: {'content-type': 'application/json'},
              body: JSON.stringify({path: `/webhooks/${webhooks[0].id}/resend`})
            })
          } else {
            await fetchJSON('/proxy/trivial', {
              method: 'post',
              headers: {'content-type': 'application/json'},
              body: JSON.stringify({
                path: `/webhooks/${appId}/send`,
                payload: {}
              })
            })
          }
          Notifications.success('Data sent')
        } catch (err) {
          console.error('Failed to resend last webhook', err)
          Notifications.error(`Could not resend last payload: ${err.message}`)
        }
      },

      configureData() {
        this.$emit('edit:payload')
      },

      async sendCustom() {
        try {
          const appId = this.app.name
          await fetchJSON('/proxy/trivial', {
            method: 'post',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({
              path: `/webhooks/${appId}/send`,
              payload: JSON.parse(this.customPayload)
            })
          })
          Notifications.success('Data sent')
        } catch (err) {
          console.error('Failed to send custom data', err)
          Notifications.error(`Could not send custom data: ${err.message}`)
        }
      },

      syntheticsendCustomWithConfirmationClick() {
        this.$refs.sendCustomButton.click()
      },

      async sendCustomWithConfirmation() {
        if (this.buildInProgress) {
          let message = 'You have a build in progress.'
            this.$emit('confirm:run', {message: message, onConfirm: this.sendCustom})
        }
        else if (this.buildDirty) {
          let message = 'You have unsaved changes, this will run against the previous version.'
          this.$emit('confirm:run', {message: message, onConfirm: this.sendCustom})
        }
        else {
          await this.sendCustom()
        }
      }
    }
  }
</script>

<template>
  <div class="app-trigger">
    <span class="keyboardControls"><a href="#" @click="openKeyboardControls"><Icon icon="help"></Icon></a></span>
    <KeyboardControl v-if="displayKeyboardControls" @close="closeKeyboardControls"/>
    <label>App Trigger:</label>
    <select v-model="mode">
      <option :value="SELECT_MODE">Select</option>
      <option :value="CUSTOM_MODE">Manual</option>
      <option :value="RECEIVE_MODE">Receive Webhook</option>
      <option :value="RESEND_MODE">Re-send Last Payload</option>
    </select>
    <div v-if="inReceiveMode">
      <button ref="copy" class="secondary-button" @click="copyUrl">{{copyButtonText}}</button>
    </div>
    <div v-if="inResendMode">
      <ActionButton
        ref="resendLastButton"
        class="button-medium"
        value="Run <span class='shortcut'>⌘ + L</span>"
        workingValue="Sending..."
        :action="resendLast"></ActionButton>
    </div>
    <div v-if="inCustomMode">
      <div class="secondary-button" @click="configureData">Edit Payload</div>
      <ActionButton
        ref="sendCustomButton"
        class="button-medium"
        value="Run"
        workingValue="Sending..."
        :action="sendCustomWithConfirmation"></ActionButton>
    </div>
    <div v-if="inSelectMode">
      <em>No app trigger selected</em>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .app-trigger {
    display: flex;
    column-gap: .75em;
    align-items: center;

    select {
      font-size: inherit;
      font-family: inherit;
      height: 2.5625em;
    }


    .button-medium {
      text-transform: none;
      margin-left: 8px;
    }
  }
</style>
