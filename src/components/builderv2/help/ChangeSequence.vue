<script>
  export default {
    methods: {
      close() {
        this.$emit('close')
      }
    }
  }
</script>

<template>
  <div @click.self="close" class="modal-overlay visible">
    <div class="modal modal-medium-large">
      <h1 class="modal-title">👾 Sequence matters</h1>
      <span @click="close" class="close-icon"></span>
      <div class="help-message">
        <p><span class='pro-tip'>Pro Tip</span>Move <em>SendResponse</em> to the end to get feedback from previous actions.</p>
        <img src="/src/assets/images/help/changeSequence.gif" />
      </div>
      <div class="button-row headroom">
        <input type="button" class="button-medium save" @click="close" value="OK">
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .help-message {
    img {
      width: 100%;
    }

    .pro-tip {
      background-color: var(--background-high-contrast);
      color: var(--success-highlight);
      padding: 4px 8px;
      margin-right: 8px;
      border-radius: 6px;
      border: 1px solid var(--success-highlight);
    }

  }

  .button-row {
    flex-direction: column;
  }

</style>
