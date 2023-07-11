<script>
  import FieldEditor from './FieldEditor.vue'

  export default {
    components: {
      FieldEditor
    },

    props: {
      allowFieldCreation: {
        type: Boolean,
        required: false
      },
      fields: {
        type: Object,
        required: true
      },
      data: {
        type: Object,
        required: true
      },
      credentials: {
        type: Object,
        required: true
      },
      context: {
        required: false,
        default() {
          return {}
        }
      }
    },

    computed: {
      visibleFields() {
        return Object.fromEntries(
          [...Object.entries(this.fields)].filter(f => ! f[1].hidden)
        )
      }

    },

    methods: {
      editor(field) {
        return field.editorComponent || this.defaultEditor(field)
      },

      defaultEditor(field) {
        return this.isArrayType(field) ? 'CustomCollection' : 'CustomField'
      },

      isArrayType(field) {
        return 'function' === typeof (field.type || {}).member_type
      },

      keyIdentifierPair(key) {
        return [key, this.context.identifier].filter(i => i).join('-')
      }
    }
  }
</script>

<template>
  <div>
    <div v-for="(field, name) in visibleFields" :key="keyIdentifierPair(name)">
      <FieldEditor
        :editor="editor(field)"
        :name="name"
        :field="field"
        :config="data"
        :credentials="credentials"
        :context="context"
        :allowFieldCreation="allowFieldCreation" ></FieldEditor>
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
