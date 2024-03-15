<template>
  <div :class="{working: working, disabledButton: disabled}" @click.prevent="click" v-html="content"></div>
</template>

<style lang="scss" scoped>
.disabledButton {
  pointer-events: none;
}
</style>
<script>
  import notifications from '../notifications'

  export default {

    props: {
      value: String,
      workingValue: String,
      action: Function,
      disabled: {
        type: Boolean,
        required: false,
        default: false
      }
    },

    data() {
      return {
        working: false
      }
    },

    computed: {
      content() {
        return this.working && this.workingValue ? this.workingValue : this.value
      }
    },

    methods: {
      async click(event) {
        if (! this.working) {
          this.working = true
          try {
            if (this.action && 'function' === typeof this.action) {
              await this.action(event)
            }
          } catch (err) {
            let verb = this.value ? this.value : 'perform action'
            notifications.error(`Unable to ${verb}`)
            console.error('[Button] Failed to perform action:', err)
          }

          this.working = false
        }
      }
    }
  }
</script>
