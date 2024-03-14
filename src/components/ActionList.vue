<script>
import EditAction from './EditAction.vue'

export default {

  components: {
    'edit-action': EditAction
  },

  props: {
    actions: Array,
    topics: Array
  },

  data() {
    return {
      editAction: {
        perform: '',
        topics: [],
        config: {}
      },
      showEdit: false,
      isNew: true,
      editingIndex: -1
    }
  },

  methods: {
    clickNewAction() {
      this.editAction.perform = ''
      this.editAction.topics = []
      this.editAction.config = []
      this.isNew = true
      this.showEdit = true
    },

    clickAction(index) {
      this.editingIndex = index
      this.editAction.perform = this.actions[index].perform
      this.editAction.topics = [].concat(this.actions[index].topics) // new array copy
      this.editAction.config = Object.assign({}, this.actions[index].config) // new object copy
      this.isNew = false
      this.showEdit = true
    },

    addAction() {
      this.actions.push(Object.assign({}, this.editAction))
      this.$emit('manifestupdated')
    },

    updateAction() {
      Object.assign(this.actions[this.editingIndex], this.editAction)
      this.$emit('manifestupdated')
    },

    deleteAction() {
      this.actions.splice(this.editingIndex, 1)
      this.$emit('manifestupdated')
    }
  }
}
</script>

<template>
  <div>
    <h2 class="section-title">Actions</h2>
    <p class="section-help-text"><em>Actions send the transformed data to a final destination.</em></p>

    <p v-if="actions.length < 1"><em>No actions to display</em></p>

    <div v-for="(action,idx) in actions" class="clickable-action" @click="clickAction(idx)">
      <h4 class="section-title">{{action.perform}}</h4>
      <p class="applies-to-topics"><em>For topics: {{action.topics.join(', ')}}</em></p>
    </div>

    <input type="button" class="button-small" @click="clickNewAction" value="New Action">
    <edit-action
      v-if="showEdit"
      v-model="editAction"
      :topics="topics"
      :is-new="isNew"
      :show="showEdit"
      @update:show="showEdit = $event"
      @addaction="addAction"
      @updateaction="updateAction"
      @deleteaction="deleteAction"></edit-action>
  </div>
</template>
