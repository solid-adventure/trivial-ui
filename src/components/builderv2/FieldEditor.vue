<script>
  import fieldEditors from './field-editors'

  export default {
    components: {
      ...fieldEditors
    },

    props: {
      editor: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      field: {
        type: Object,
        required: true
      },
      config: {
        type: Object,
        required: true
      },
      credentials: {
        type: Object,
        required: true
      },
      context: {
        required: false
      },
      allowFieldCreation: {
        type: Boolean,
        required: false
      }
    }
  }
</script>

<template>
  <component
    :is="editor"
    :name="name"
    :field="field"
    :config="config"
    :credentials="credentials"
    :context="context"
    :allowFieldCreation="allowFieldCreation"></component>
</template>
