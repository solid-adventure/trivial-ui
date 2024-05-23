<script>
  import ActionDescriptors from 'trivial-core/lib/actionsv2/catalog/ActionDescriptors'
  import ActionIterator from 'trivial-core/lib/actionsv2/catalog/ActionIterator'

  export default {
    name: 'ProgramTreeNode',

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

    data() {
      return {
        open: false
      }
    },

    created() {
      this.checkVisibility()
    },

    watch: {
      selected() {
        this.checkVisibility()
      }
    },

    computed: {
      descriptor() {
        return ActionDescriptors.forType(this.value.type)
      },

      name() {
        return this.descriptor.definitionTitle(this.value)
      },

      iterator() {
        return new ActionIterator(this.value)
      },

      childEntries() {
        return this.iterator.visibleInnerActionEntries
          .map(entry => {
            const [name, actions] = entry
            return {name, actions}
          })
          .filter(entry => entry.actions.length > 0)
      },

      isLeaf() {
        return this.childEntries.length === 0
      },

      hasChildren() {
        return this.childEntries.any(entry => entry.actions.length > 0)
      },

      isDisabled() {
        return !this.value.enabled
      },

      isSelected() {
        return this.selected === this.value
      }
    },

    methods: {
      toggle() {
        this.open = ! this.open
      },

      checkVisibility() {
        if (this.isSelected) {
          this.$emit('show')
        }
      },

      showChild() {
        this.open = true;
        this.$emit('show')
      },

      navigateTo() {
        this.$emit('navigate', this.value)
      },

      navigateChild(def) {
        this.$emit('navigate', def)
      }

    }
  }
</script>

<template>
  <li :class="{selected: isSelected}">
    <button v-if="!isLeaf" class="toggle" @click="toggle">
      <svg v-if="!open" class="icon" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="var(--background)" />
      <path d="M9 12H12M15 12H12M12 12V9M12 12V15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg v-if="open" class="icon" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="var(--background)" />
      <path d="M9 12H12H15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <a href="#" class="label" @click.prevent="navigateTo" :class="{disabled: isDisabled}">{{name}}</a>
    <ul
      v-for="entry in childEntries"
      :key="entry.name"
      class="inner"
      :class="{collapsed: !open, 'with-label': childEntries.length > 1}">
      <li v-if="childEntries.length > 1" class="slot-label">{{entry.name}}</li>
      <ProgramTreeNode
        v-for="node in entry.actions"
        :key="node.identifier"
        :value="node"
        :selected="selected"
        @show="showChild"
        @navigate="navigateChild"></ProgramTreeNode>
    </ul>
  </li>
</template>


<style lang="scss" scoped>

  .disabled {
    opacity: 0.4;
  }

  li {
    margin: 0;
    padding: 0 0 0 1.5em;
    list-style: none;
    position: relative;
    line-height: 1.5em;

    .label {
      white-space: nowrap;
    }

    &.selected > .label {
      font-weight: 400;
    }

    &:before {
      content: '';
      position: absolute;
      top: 0.8625em;
      left: -0.5em;
      height: 1px;
      width: 1.5em;
      border-top: 1px dotted var(--on-background);
    }
  }

  ul.inner {
    margin: 0;
    padding: 0 0 0 1em;
    list-style: none;
    position: relative;

    &.collapsed {
      display: none;
    }

    &.with-label {
      min-height: 1em;
    }

    li {
      &:after {
        content: '';
        position: absolute;
        top: 0;
        left: -0.5em;
        height: calc(100% - 1px);
        width: 1px;
        border-left: 1px dotted var(--on-background);
      }

      &:last-child:after {
        height: 0.8em;
      }
    }

    li.slot-label {
      position: absolute;
      padding: 0;
      left: -3em;
      top: 0.325em;
      font-size: 0.75em;
      color: var(--on-background);
      background-color: var(--clr-bg);
      text-transform: uppercase;
      z-index: 2;

      &:before {
        display: none;
      }

      &:after {
        display: none;
      }
    }
  }

  .toggle {
    margin: 0;
    padding: 0;
    background: transparent;
    position: absolute;
    top: 0.125em;
    left: -1em;
    cursor: pointer;
    z-index: 1;
    color: var(--on-background);

    .icon {
      height: 1.5em;
      width: 1.5em;
    }
  }
</style>
