<script>
  import Icon from '../Icon.vue'
  import ActionSearchResult from './ActionSearchResult.vue'
  import ActionSearch from 'trivial-core/lib/actionsv2/catalog/ActionSearch'
  import ActionDescriptors from 'trivial-core/lib/actionsv2/catalog/ActionDescriptors'

  export default {
    components: {
      Icon,
      ActionSearchResult
    },

    mounted() {
      this.$store.state.keyboardControl.register('command-shift-a', "New Action", this.expand.bind(this))

      this.$store.state.keyboardControl.register('Escape', "", this.collapse.bind(this))
      this.$store.state.keyboardControl.register('command-.', "", this.collapse.bind(this))

    },

    data() {
      return {
        collapsed: true,
        selected: null,
        searchString: '',
        searchQuery: ''
      }
    },

    directives: {
      scrollIntoView: {
        inserted(el) {
          el.scrollIntoView({behavior: 'smooth', block: 'center'})
        }
      },

      focus: {
        inserted(el) {
          el.focus()
        }
      }
    },

    computed: {
      expanded() {
        return ! this.collapsed
      },

      actions() {
        const list = ActionSearch.search(this.searchQuery)
        const result = []
        list.forEach(name => {
          const icon = ActionDescriptors.forType(name).iconUrl
          const parts = name.split('/')
          let context = result
          for (let i = 0; i < parts.length - 1; ++i) {
            let group = context.find(item => item.title === parts[i])
            if (undefined === group) {
              group = {
                type: 'group',
                title: parts[i],
                name: parts.slice(0, i + 1).join('/'),
                icon: icon,
                children: []
              }
              context.push(group)
            }
            context = group.children
          }
          context.push({
            type: 'action',
            title: parts[parts.length - 1],
            name: name,
            icon: icon
          })
        })
        return result
      },

      selectedDescriptor() {
        if (!this.selected) {
          return undefined
        }

        return ActionDescriptors.forType(this.selected)
      },

      selectedDescriptorIconStyle() {
        if (this.selectedDescriptor.iconUrl) {
          return {backgroundImage: `url(${this.selectedDescriptor.iconUrl})`}
        } else {
          return {}
        }
      }
    },

    methods: {
      expand() {
        this.collapsed = false
      },

      collapse() {
        this.collapsed = true
        this.selected = null
      },

      selectAction(name) {
        this.selected = name
      },

      addSelected() {
        this.$emit('add:action', this.selected)
        this.collapsed = true
        this.selected = null
      },

      doSearch() {
        this.searchQuery = this.searchString
      },

      clearSearch() {
        this.searchQuery = ''
        this.searchString = ''
      }
    }
  }
</script>

<template>
  <div class="section">
    <div v-if="collapsed" class="collapsed">
      <button class="button-small" @click="expand">Add Action</button>
    </div>
    <div v-if="expanded" class="expanded">
      <div class="button-row">
        <button class="button-small" @click="collapse">Cancel</button>
      </div>
      <h3>Add Action</h3>
      <h5>Search Actions</h5>
      <div class="action-search" v-scroll-into-view>
        <div class="search-panel">
          <div class="search-field">
            <Icon icon="search" class="search-icon"></Icon>
            <input
              type="text"
              v-model="searchString"
              v-focus
              @keydown.enter.prevent="doSearch"
              @keydown.esc.prevent="clearSearch">
          </div>
          <ul class="results-list">
            <ActionSearchResult
              v-for="action in actions"
              :key="action.name"
              :value="action"
              :selected="selected"
              :query="searchQuery"
              @update:selected="selectAction"></ActionSearchResult>
          </ul>
        </div>
        <div class="action-inspector">
          <div v-if="selectedDescriptor">
            <h4>
              <span class="actionIcon" :style="selectedDescriptorIconStyle"></span>
              {{selectedDescriptor.descriptiveName}}
              <button class="button-medium" @click="addSelected">Add this Action</button>
            </h4>
            <div v-html="selectedDescriptor.overviewHTML"></div>
          </div>
          <div v-else="selectedDescriptor">
            <p>Select an action.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .section {
    margin-bottom: 1em;
    margin-left: 0;
  }

  .collapsed {
    display: flex;
    justify-content: flex-start;
    width: 100%;
  }

  .expanded {
    .button-row {
      display: flex;
      justify-content: flex-end;
    }

    h5 {
      font-size: .875em;
      font-weight: 400;
      text-transform: uppercase;
      margin-bottom: .25em;
    }

    .action-search {
      display: grid;
      grid-template-columns: 1fr 2fr;
      column-gap: 2px;
      height: 20em;

      .search-panel {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: stretch;
        row-gap: 2px;

        .search-field {
          background-color: var(--background-high-contrast);
          color: var(--on-background);
          position: relative;

          .search-icon {
            position: absolute;
            font-size: 1.125em;
            top: 50%;
            right: .5em;
            transform: translate(0, -50%);
          }

          input[type=text] {
            background-color: transparent;
            border: none;
            font-family: inherit;
            font-size: inherit;
            margin: 0;
            width: 100%;
            border-sizing: border-box;
            height: 1em;
          }
        }

        .results-list {
          flex-grow: 1;
          margin: 0;
          padding: 1em;
          list-style: none;
          background-color: var(--background-high-contrast);
          color: var(--on-background);
          box-sizing: border-box;
          max-height: calc(19em - 2px);
          overflow: auto;
        }
      }

      .action-inspector {
        background-color: var(--background-high-contrast);
        color: var(--on-background);
        overflow: auto;
        padding: 2em;

        h4 {
          .actionIcon {
            display: inline-block;
            margin-right: 1em;
            width: 2.65em;
            height: 2.65em;
            background-position: 50% 50%;
            background-size: contain;
            background-repeat: no-repeat;
            vertical-align: middle;
          }

          button {
            margin-left: 2em;
          }
        }
      }
    }
  }
</style>
