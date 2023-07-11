<script>
  import Icon from '../Icon.vue'
  import ActionSearch from './ActionSearch.vue'
  import ActionDescriptors from 'trivial-core/lib/actionsv2/catalog/ActionDescriptors'
  import ActionIterator from 'trivial-core/lib/actionsv2/catalog/ActionIterator'
  import { mapGetters } from 'vuex'

  export default {
    components: {
      ActionSearch,
      Icon
    },

    props: {
      name: {
        type: String,
        required: true
      },
      actions: {
        type: Array,
        required: true
      },
      nextIdentifier: {
        type: Number,
        required: true
      },
      credentials: {
        type: Object,
        required: true
      }
    },

    data() {
      return {
        movingFrom: -1,
        movingTo: -1,
        inserting: false
      }
    },

    computed: {
      actionList() {
        const list = this.actions.map((def,index) => { return {index, def} })
        if (-1 !== this.movingFrom && -1 !== this.movingTo) {
          if (this.movingFrom < this.movingTo) {
            list.splice(this.movingTo - 1, 0, ...list.splice(this.movingFrom, 1))
          } else if (this.movingFrom > this.movingTo) {
            list.splice(this.movingTo, 0, ...list.splice(this.movingFrom, 1))
          }
        } else if (this.inserting && -1 !== this.movingTo) {
          list.splice(this.movingTo, 0, {index: -1, def: {name: '\u00a0' /* NBSP */}})
        }
        return list
      },

      ...mapGetters([
        'manifestLoaded'
      ]),
    },

    methods: {
      humanize(value) {
        return String(value).replaceAll('_', ' ')
      },

      definitionName(def) {
        return def.name || ActionDescriptors.forType(def.type).name
      },

      async createNewAction(type) {
        const newDef =  ActionDescriptors.actionDefinitionAndCredentialsOfType(
          type, this.nextIdentifier
        )
        await this.callAfterAdd(newDef)
        if (newDef.credentials) {
          this.$set(this.credentials, newDef.action.identifier, newDef.credentials)
        }
        return newDef.action
      },

      async callAfterAdd(newDef) {
        const descr = ActionDescriptors.forType(newDef.action.type)
        const actionSlot = this
        await descr.invokeHook('afterAdd', {
          app: this.$store.state.app,
          definition: newDef.action,
          credentials: newDef.credentials,
          user: this.$store.state.user,
          setCustomPayload(payload) {
            actionSlot.$store.commit('setCustomPayload', payload)
            actionSlot.$store.commit('setDataSample', JSON.parse(payload))
          }
        })
      },

      destroyAction(def) {
        const iter = new ActionIterator(def)
        iter.eachChild(child => this.destroyAction(child))

        if (def.identifier in this.credentials) {
          this.$delete(this.credentials, def.identifier)
        }
      },

      dragExistingAction(event, index) {
        this.movingFrom = index
        this.movingTo = -1
        event.dataTransfer.setData('application/json',
          JSON.stringify({operation: 'move', index}))
      },

      dragEnd(event) {
        this.movingFrom = -1
        this.movingTo = -1
        this.inserting = false
      },

      dragOverItem(event, overIndex) {
        event.preventDefault()
        if (-1 === this.movingFrom) {
          event.dataTransfer.dropEffect = 'copy'
          this.inserting = true
          this.stopInsertCancelledTimer()
        } else {
          event.dataTransfer.dropEffect = 'move'
        }
        this.movingTo = this.isBelowItem(event) ? overIndex + 1 : overIndex
      },

      dragLeaveItem(event) {
        if (this.inserting) {
          this.startInsertCancelledTimer()
        }
      },

      async dropItem(event, overIndex) {
        const data = JSON.parse(event.dataTransfer.getData('application/json'))
        const idx = this.isBelowItem(event) ? overIndex + 1 : overIndex
        if (data && data.operation === 'add') {
          event.preventDefault()
          event.stopPropagation()
          const def = await this.createNewAction(data.type)
          this.actions.splice(idx, 0, def)
        } else if (-1 !== this.movingFrom) {
          event.preventDefault()
          event.stopPropagation()
          if (this.movingFrom < idx) {
            this.actions.splice(idx - 1, 0, ...this.actions.splice(this.movingFrom, 1))
          } else if (this.movingFrom > idx) {
            this.actions.splice(idx, 0, ...this.actions.splice(this.movingFrom, 1))
          }
        }
        this.movingFrom = -1
        this.movingTo = -1
        this.inserting = false
      },

      isBelowItem(event) {
        const target = event.target
        const rect = target ? target.getBoundingClientRect() : null
        return rect && ((event.clientY - rect.top)/(rect.bottom - rect.top) > 0.5)
      },

      startInsertCancelledTimer() {
        this.stopInsertCancelledTimer()
        this.leaveTimer = setTimeout(() => {
          this.inserting = false
          this.leaveTimer = null
        }, 350)
      },

      stopInsertCancelledTimer() {
        if (this.leaveTimer) {
          clearTimeout(this.leaveTimer)
          this.leaveTimer = null
        }
      },

      edit(def) {
        if (this.actions.indexOf(def) !== -1) {
          this.$emit('edit', def)
        }
      },

      deleteAction(def) {
        const idx = this.actions.indexOf(def)
        if (idx !== -1 && confirm(`Are you sure you want to delete the ${def.name || def.type || 'Group'} action?`)) {
          this.destroyAction(def)
          this.actions.splice(idx, 1)
        }
      },

      isInsertingAction(action) {
        if (this.movingFrom !== -1) {
          return action.index === this.movingFrom
        } else if (this.inserting) {
          return action.index === -1
        } else {
          return false
        }
      },

      iconUrl(def) {
        let type = (def.type == "ActionWithTransform") ? def.definition.actions[1].type : def.type
        return ActionDescriptors.forType(type).iconUrl ? `url(${ActionDescriptors.forType(type).iconUrl})` : ''
      },

      async addAction(name) {
        const def = await this.createNewAction(name)
        this.actions.push(def)
      }

    }
  }
</script>

<template>
  <div v-if="manifestLoaded">
    <h3>{{humanize(name)}}</h3>

    <div v-if="actionList.length > 0">
    <ol class="actions-numbers">
      <li v-for="action in actionList"><hr /></li>
    </ol>

    <ul class="actions">
      <li v-for="(action, newIndex) in actionList"
        :key="action.index"
        :class="{inserting: isInsertingAction(action), disabled: !action.def.enabled}"
        draggable="true"
        @dragstart="dragExistingAction($event, action.index)"
        @dragend="dragEnd($event)"
        @dragover="dragOverItem($event, newIndex)"
        @dragleave="dragLeaveItem"
        @drop="dropItem($event, newIndex)">

        <div class="grab"><img src='/assets/images/grabby-dots-01.svg' class='grabby-dots'/></div>
        <div class="icon" :style="{'background-image': iconUrl(action.def)}"></div>
        <a href="#" @click.prevent="edit(action.def)" class='description'>
          <div class="description">
            <h2 class='title'>{{definitionName(action.def)}}<span class='edit-icon'>✏️</span></h2>
            <!-- <p class='description'>Description text</p> -->
          </div>
        </a>
        <div class="delete">
          <button class="delete" @click="deleteAction(action.def)" aria-label="delete"><Icon icon="times-circle" class="icon"></Icon></button>
        </div>
        </li>
      </ul>
      </div>
      <div v-if="actionList.length == 0" class="empty"><em>No actions to display. Use <strong>Add Action</strong> to choose the steps in your sequence.</em></div>
      <ActionSearch @add:action="addAction"></ActionSearch>
  </div>
</template>

<style lang="scss" scoped>
  h3 {
    text-transform: capitalize;
  }

  .empty {
    margin-bottom: 1em;
  }

  ol.actions-numbers {
    padding: 0;
    margin: 0;
    float: left;
    margin-left: 2em;
    display: none;

    li {
    height: 36px;
    padding: 8px;
    margin: 9px 12px 12px 12px;
    font-size: 1.2em;
    line-height: 2em;

      hr {
        border: 1px dashed var(--on-background);
        width: 200%;
        opacity: 0.5;
      }

    }

  }

  ul.actions {

    padding: 0;
    margin: 0;
    background-color: transparent;
    color: var(--on-surface);
    min-height: 5em;
    position: relative;
    border-radius: 0px;
    list-style: none;
    display: block;
    position: relative;

    &:before {
      position: absolute;
      top: 1.25em;
      left: 1.25em;
      color: var(--on-surface-40);
      z-index: 1;
    }

    li.disabled {
      opacity: 0.4;
    }

    li {
      margin: 12px 0;
      padding: 0 0 0 1em;
      background-color: var(--surface-secondary);
      color: var(--on-surface-secondary);
      position: relative;
      z-index: 2;
      border-radius: 0px;
      border: 1px solid var(--accent);
      display: flex;
      align-items: center;
      cursor: pointer;
      box-shadow: 4px 4px 0px 0px var(--surface);
      &.inserting {
        box-shadow: 5px 5px 4px 1px var(--surface);
        z-index: 100;
      }

      a.description {
        color: var(--on-background);
      }

      &.inserting, &.inserting a {
        background-color: var(--accent);
        color: var(--on-accent);
      }

      img.grabby-dots {
        height: 30px;
        opacity: 0.3;
      }

      .icon, .grab, .description {
        margin: 0.5em;
      }

      > .icon {
        margin-left: 1em;
        width: 36px;
        height: 36px;
        background-repeat: no-repeat;
        background-position: 50% 50%;
        background-size: contain;
      }

      .description {
        flex-grow: 1;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        .title {
          width: 100%;
          margin: 0;
          font-size: 1em;
          font-weight: 100;
        }

        .description {
          margin: 0;
        }

      }

      .delete {
        display: none;
        background: transparent;
        color: var(--on-background);
        cursor: pointer;
        margin: 0 .5em 0 0;

        .icon {
          font-size: 1.5em;
        }
      }

      &:hover .delete {
        display: block;
      }

      .edit-icon {
        display: none;
        transform: scale(-1,1);
        margin-left: 1em;      }

      &:hover .edit-icon {
        display: inline-block;
      }


    }
  }
</style>
