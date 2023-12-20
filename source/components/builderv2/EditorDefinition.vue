
<script>
  import ActionDescriptors from 'trivial-core/lib/actionsv2/catalog/ActionDescriptors'
  import ActionSlot from './ActionSlot.vue'
  import CustomFields from './CustomFields.vue'

  export default {
    components: {
      ActionSlot,
      CustomFields
    },

    props: {
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

    computed: {
      action() {
        return this.value
      },

      allowFieldCreation() {
        return this.descriptor.allowFieldCreation
      },

      actionSlotDisplayName() {
        return this.descriptor.actionSlotDisplayName || this.descriptor.slotName
      },

      descriptor() {
        return ActionDescriptors.forType(this.action.type)
      },

      hasDefinition() {
        return Object.keys(this.descriptor.definitionFields || {}).length > 0 ||
          (this.descriptor.actionSlots || []).length > 0
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
  <div>
    <div v-if="hasDefinition">
      <CustomFields
        :fields="descriptor.definitionFields"
        :data="action.definition"
        :credentials="credentials"
        :context="action"
        :allowFieldCreation="allowFieldCreation"></CustomFields>
      <ActionSlot
        v-for="slotName in descriptor.actionSlots"
        :key="slotName"
        :name="actionSlotDisplayName"
        :actions="action.definition[slotName]"
        :nextIdentifier="nextIdentifier"
        :credentials="credentials"
        @edit="edit"></ActionSlot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
