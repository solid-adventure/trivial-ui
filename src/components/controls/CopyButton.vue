<template>
  <button @click.prevent="click" aria-label="Copy">

    <span v-if="!message">
      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="icon">
          <path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path><path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path>
      </svg>
    </span>
    <span v-else>
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="color-success">
        <path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
    </svg>
  </span>
    <!-- <img src="/src/assets/images/clipboard-solid-50.svg" class="icon" /> -->
    <transition name="fade">
      <div v-if="message" class="message">{{message}}</div>
    </transition>
  </button>
</template>

<style lang="scss" scoped>

  .color-success {
    fill: green;
  }

  button {
    position: relative;
    cursor: pointer;
    background-color: transparent;
    .icon {
      fill: var(--link);
    }
    .message {
      background: var(--tool-tip-background);
      color: var(--tool-tip-color);
      box-shadow: 2px 2px 2px rgba(0, 0, 0, .4);
      white-space: nowrap;
      position: absolute;
      border-radius: 2px;
      padding: .5em 1em;
      transform-origin: top;
      margin-bottom: 10px;
      left: 50%;
      transform: translate(-50%, 4px);
      font-size: 1rem;
      z-index: 2;
      font-weight: 100;
    }
  }
</style>

<script>
  import Clipboard from '../../lib/Clipboard'
  import { debounce } from 'trivial-core/lib/component-utils'
  export default {
    props: {
      success: {
        type: String,
        default: 'Copied!'
      },
      failure: {
        type: String,
        default: 'Error!'
      },
      value: {
        type: String,
        required: true
      },
      messageDelay: {
        type: Number,
        default: 1500
      }
    },
    data() {
      return {
        message: null
      }
    },
    methods: {
      click() {
        if (Clipboard.copy(this.value)) {
          this.$emit('copied', this.value)
          this.flashMessage(this.success)
        } else {
          this.$emit('failed')
          this.flashMessage(this.failure)
        }
      },
      flashMessage(msg) {
        this.message = msg
        this.restoreMessage()
      },
      restoreMessage: debounce(
        function() { this.message = null },
        function() { return this.messageDelay }
      )
    }
  }
</script>
