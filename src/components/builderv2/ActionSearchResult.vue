<script>
  export default {
    name: 'ActionSearchResult',

    props: {
      value: {
        type: Object,
        required: true
      },
      selected: {
        required: false
      },
      query: {
        type: String,
        required: false
      }
    },

    data() {
      return {
        expanded: false
      }
    },

    created() {
      if (this.query) {
        this.expanded = true
      }
    },

    watch: {
      query() {
        if (this.query) {
          this.expanded = true
        } else {
          this.expanded = false
        }
      }
    },

    computed: {
      isGroup() {
        return this.value.type === 'group'
      },

      backgroundStyle() {
        if (this.value.icon) {
          return {backgroundImage: `url(${this.value.icon})`}
        } else {
          return {}
        }
      },

      isSelected() {
        return this.value.name === this.selected
      },

      highlightHover() {
        return (this.isGroup && !this.expanded) || !this.isGroup
      }
    },

    methods: {
      trigger() {
        if (this.isGroup) {
          this.expanded = ! this.expanded
        } else {
          this.$emit('update:selected', this.value.name)
        }
      },

      updateSelected(value) {
        this.$emit('update:selected', value)
      }

    }
  }
</script>

<template>
  <li class="result" :class="{highlightHover: highlightHover, selected: isSelected}">
    <button
      :style="backgroundStyle"
      :class="{group: isGroup}"
      @click="trigger">{{value.title}}</button>
    <ul v-if="isGroup" v-show="expanded">
      <ActionSearchResult
        v-for="child in value.children"
        :key="child.name"
        :value="child"
        :selected="selected"
        :query="query"
        @update:selected="updateSelected"></ActionSearchResult>
    </ul>
  </li>
</template>

<style lang="scss" scoped>
  .result {
    padding: 0 0 0 1.5em;

    &.selected {
      color: var(--on-background);
      background-color: var(--background);
    }
  
  }

  .highlightHover:hover {
      background-color: var(--background);;
  }

  button {
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    background-color: transparent;
    margin: 0;
    padding: 0;
    cursor: pointer;
    padding: 0 0 0 1.5em;
    background-repeat: no-repeat;
    background-position: 0px 0px;
    background-size: 1em 1em;

    &.group {
      font-weight: 400;
    }

  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
</style>
