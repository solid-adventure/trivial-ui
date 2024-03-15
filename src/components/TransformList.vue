<script>
import EditTransform from './EditTransform.vue'

export default {

  components: {
    'edit-transform': EditTransform
  },

  props: {
    transforms: Array,
    topics: Array
  },

  data() {
    return {
      editTransform: {
        from: '',
        to: '',
        topics: [],
        transformations: []
      },
      showEdit: false,
      isNew: true,
      editingIndex: -1
    }
  },

  methods: {
    clickNewTransform() {
      this.editTransform.from = ''
      this.editTransform.to = ''
      this.editTransform.topics = []
      this.editTransform.transformations = []
      this.isNew = true
      this.showEdit = true
    },

    clickTransform(index) {
      this.editingIndex = index
      this.editTransform.from = this.transforms[index].from
      this.editTransform.to = this.transforms[index].to
      this.editTransform.topics = [].concat(this.transforms[index].topics) // new array copy
      this.editTransform.transformations =
        this.transforms[index].transformations.map(t => [t[0], t[1]]) // deep copy
      this.isNew = false
      this.showEdit = true
    },

    addTransform() {
      this.transforms.push(Object.assign({}, this.editTransform))
      this.$emit('manifestupdated')
    },

    updateTransform() {
      Object.assign(this.transforms[this.editingIndex], this.editTransform)
      this.$emit('manifestupdated')
    },

    deleteTransform() {
      this.transforms.splice(this.editingIndex, 1)
      this.$emit('manifestupdated')
    }
  }
}
</script>

<style scoped>
  ul.transformList {
  	padding: 0;
  	margin-left: 1em;
  }

  li.transform {
  	list-style-type: none;
  	margin: 0.5em 0;
  	padding: 0;
  }

  li.transform input {
    width: 25em;
    font-family: var(--code-font);
    width: 60%;
    cursor: pointer;
  }

  li.transform input {
  	width: 30%;
  }

  li.transform span.eq{
  	margin: 1em;
  }
</style>

<template>
  <div>
    <h2 class="section-title">Transforms</h2>
    <p class="section-help-text"><em>Transforms are used to convert one data type into another.</em></p>

    <p v-if="transforms.length < 1"><em>No transforms to display</em></p>

    <div v-for="(transform,idx) in transforms" class="clickable-action" @click="clickTransform(idx)">
      <h4 class="section-title">{{transform.from}}To{{transform.to}}</h4>
      <p class="applies-to-topics"><em>For topics: {{transform.topics.join(', ')}}</em></p>
      <ul class="transformList">
        <li v-for="expression in transform.transformations" class="transform"><input @mousedown="$event.preventDefault()"  class="no-select-input" type="text" v-model="expression[0]" readonly><span class="eq">=</span><input @mousedown="$event.preventDefault()"  class="no-select-input" type="text" v-model="expression[1]" readonly></li>
      </ul>
    </div>

    <input type="button" class="button-small" @click="clickNewTransform" value="New Transform">
    <edit-transform
      v-if="showEdit"
      v-model="editTransform"
      :topics="topics"
      :is-new="isNew"
      :show="showEdit"
      @update:show="showEdit = $event"
      @addtransform="addTransform"
      @updatetransform="updateTransform"
      @deletetransform="deleteTransform"></edit-transform>
  </div>
</template>
