<script>
  import ProgramTreeNode from './ProgramTreeNode.vue'

  export default {
    components: {
      ProgramTreeNode
    },

    props: {
      value: {
        type: Object,
        required: true
      },
      selected: {
        type: Object,
        required: false
      }
    },

    methods: {
      navigate(def) {
        this.$emit('navigate', def)
      }
    }
  }
</script>

<template>
  <ul class="tree">
    <ProgramTreeNode
      :value="value"
      :selected="selected"
      @navigate="navigate"></ProgramTreeNode>
  </ul>
</template>

<style lang="scss" scoped>
  ul.tree {
    margin: 1em 0 1em 1em;
    padding: 0;
    list-style: none;
  }
</style>
