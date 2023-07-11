<script>
  import editors from './editors'

  export default {
    components: {
      ...editors
    },

    props: {
      editor: {
        type: String,
        required: true
      },
      value: {
        type: Object,
        required: true
      },
      credentials: {
        type: Object,
        required: true
      },
      nextIdentifier: {
        type: Number,
        required: true
      }
    },

    methods: {
      edit(action) {
        this.$emit('edit', action)
      }
    }
  }
</script>

<template>
  <component
    :is="editor"
    :value="value"
    :credentials="credentials"
    :nextIdentifier="nextIdentifier"
    @edit="edit"></component>
</template>
