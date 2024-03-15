<script>

  import Modal from '../../components/Modal.vue'

  export default {

    mixins: [
      Modal
    ],

    props: {
      message: {
        type: String,
        required: false
      },

      onConfirm: {
        type: Function,
        required: false
      }
    },

    methods: {

      proceed() {
        this.$emit('close')
        this.onConfirm()
      },

    }
  }
</script>

<template>
  <div @click.self="close" class="modal-overlay visible">
    <div class="modal modal-medium">
      <h1 class="modal-title">Are you sure?</h1>
      <span @click="close" class="close-icon"></span>
      <div class="message-display">
        <p>{{this.message}}</p>
      </div>
      <div class="button-row headroom">
        <input type="button" class="button-medium secondary-button" @click="close" value="Cancel">
        <input type="button" class="button-medium" @click="proceed" value="OK">
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>
