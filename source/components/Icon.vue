<script>
  import icons from './icons'

  export default {
    components: {
      ...icons
    },

    props: {
      icon: {
        type: String,
        required: true
      }
    }
  }
</script>

<template>
  <span class="icon-wrapper">
    <component :is="icon"></component>
  </span>
</template>

<style lang="scss" scoped>
  .icon-wrapper {
    display: inline-block;
    width: 1em;
    height: 1em;

    > svg {
      width: 1em;
      height: 1em;
    }
  }
</style>
