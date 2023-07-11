<template>
  <div class="message-container" :class="containerClasses">
    <transition name="fade-slow">
      <div v-if="hasMessages" class="messages" :class="lastMessageType">
        <div v-for="msg in messages" :class="['message', msg.type]">
          {{msg.message}}
          <ActionButton
            v-for="action in msg.actions()"
            class="button-medium"
            :action="() => performAction(msg, action)"
            :value="action.label">
          </ActionButton>
        </div>
        <button class="dismiss" aria-label="Dismiss" @click.prevent="dismissAll"><Icon icon="times-circle"></Icon></button>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
  @import "../assets/stylesheets/includes/variables";

  .flush .messages {
    margin-top: 0;
    margin-bottom: 0;
  }

  .message-container {
    z-index: 1;

    &.pinned {
      position: sticky;
      top: 4em;
    }

    &.unpinned {
      position: absolute;
      top: 0;
      left: 0;

      &.right {
        left: auto;
        right: -2em;
      }
    }
  }

  .messages {
    background-color: var(--success);
    color: var(--on-success);
    padding: 0.40625em 2em;
    margin: .5em 2em;
    text-align: left;
    box-shadow: 1px 1px 4px rgba(0, 0, 0, .2);
    position: relative;

    &.error {
      background-color: var(--error);
      color: var(--on-error);

      .button-medium {
        border-color: var(--on-error-highlight);
      }
    }

    .message {
      line-height: calc(2.4em + 6px);
    }

    .dismiss {
      cursor: pointer;
      position: absolute;
      padding: 0;
      top: .5em;
      right: .5em;
      color: inherit;
      background-color: transparent;
      opacity: 0;
      transition: opacity 100ms;
    }

    &:hover button {
      opacity: 1;
    }

    .button-medium {
      color: inherit;
      background-color: transparent;
      border: 1px solid var(--success-highlight);
      text-transform: none;
      margin-left: .5em;
    }
  }
</style>

<script>
  import notifications from './notifications'
  import ActionButton from './controls/ActionButton.vue'
  import Icon from './Icon.vue'

  class Message {
    constructor(message, type, options) {
      this.message = message
      this.type = type
      this.options = Object.assign({}, options)
    }

    actions() {
      return Object.keys(this.options.actions || {}).map(label => {
        return {label: label, fn: this.options.actions[label]}
      })
    }

    shouldAutoDismiss() {
      return (
        false !== this.options.autoDismiss &&
        Object.keys(this.options.actions || {}).length === 0
      )
    }
  }

  export default {
    components: {
      ActionButton,
      Icon
    },

    props: {
      pinned: {
        type: Boolean,
        default: true
      },
      dismissDelay: {
        type: Number,
        default: 5000
      }
    },

    data() {
      return {
        messages: [],
      }
    },

    created() {
      notifications.setComponent(this)
    },

    computed: {
      hasMessages() {
        return this.messages.length > 0
      },

      containerClasses() {
        return this.pinned ? ['pinned'] : ['unpinned']
      },

      lastMessageType() {
        return (this.messages[this.messages.length - 1] || {}).type
      }
    },

    methods: {
      notice(type, message, options) {
        let messageObj = new Message(message, type, options)
        this.messages.push(messageObj)
        if (messageObj.shouldAutoDismiss()) {
          this.dismissOnDelay(messageObj)
        }
      },

      dismissAll() {
        this.messages.splice(0, this.messages.length)
      },

      dismissOnDelay(msg) {
        window.setTimeout( () => {
          this.dismissMessage(msg)
        }, this.dismissDelay)
      },

      dismissMessage(msg) {
        const idx = this.messages.indexOf(msg)
        if (idx !== -1) {
          this.messages.splice(idx, 1)
        }
      },

      async performAction(msg, action) {
        try {
          await action.fn()
          this.dismissMessage(msg)
        } catch (err) {
          console.error(`[Notices][performAction] ${action.label} action failed:`, err)
          this.notice('error', `${action.label} failed: ${err.message}`)
        }
      }
    }
  }
</script>
