<template>
  <div class='function-body'>
    <HideableSection v-if="!hiddenByTour('custom-functions') && !playgroundMode" :initially-hidden="true" display-name='Functions' class="custom-functions">
      <ul class="function-list">
        <li class="well">
          <h4>Add New Function</h4>
          <input type="text" placeholder="Name" :value="functionName" @input="input" @keydown="keydown">
        </li>
        <li v-for="(fn,idx) in value" class="well fn" @click="editFunction(idx)">
          <h4><a href="#" @click.prevent="editFunction(idx)">{{fn.name}}</a></h4>
          <p>{{fn.notes}}</p>
        </li>
      </ul>
      <EditFunction
        v-if="editing"
        :value="newFunction"
        :isNew="null === functionIndex"
        :blocks="value"
        @close="editing = false"
        @addfunction="addFunction"
        @updatefunction="updateFunction"
        @deletefunction="deleteFunction"></EditFunction>
      </HideableSection>
  </div>
</template>

<style lang="scss" scoped>
  .function-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    column-gap: 1em;
    row-gap: 1em;

    > li {
      margin: 0;

      &.fn {
        cursor: pointer;
      }
    }

    h4 {
      font-size: 1rem;
      margin: 0 0 1em 0;
    }

    input[type=text] {
      font-size: inherit;
      font-family: var(--code-font);
      width: 100%;
      border: 1px solid var(--accent);
    }
  }
</style>

<script>
  import EditFunction from './EditFunction.vue'
  import HideableSection from './controls/HideableSection.vue'
  import { sanitizedIdentifier } from 'trivial-core/lib/code-utils'
  import notifications from './notifications'
  import { mapGetters, mapMutations, mapState } from 'vuex'

  export default {
    components: {
      EditFunction,
      HideableSection
    },

    props: {
      value: {
        type: Array,
        required: true
      }
    },

    data() {
      return {
        functionName: '',
        editing: false,
        functionIndex: null,
        newFunction: {
          name: '',
          definition: '',
          testInput: '',
          notes: ''
        }
      }
    },

    computed: {

      ...mapGetters([
        'hiddenByTour',
      ]),

      ...mapState([
        'tourMode',
        'tourStep',
        'playgroundMode'
      ])
    },

    methods: {
      input(event) {
        this.functionName = sanitizedIdentifier(event.target.value)
      },

      keydown(event) {
        switch (event.code) {
        case "Escape":
          this.functionName = ''
          event.preventDefault()
          break

        case "Enter":
        case "Tab":
          if (this.functionName) {
            this.createFunction(this.functionName)
            this.functionName = ''
            event.preventDefault()
          }
          break
        }
      },

      createFunction(name) {
        const existingIdx = this.value.findIndex(f => f.name === name)
        if (existingIdx !== -1) {
          this.editFunction(existingIdx)
        } else {
          this.newFunction.name = name
          this.newFunction.definition =
            `function ${this.functionName} (value) {\n\n  return value\n\n}`
          this.newFunction.testInput = ''
          this.newFunction.notes = ''
          this.functionIndex = null
          this.editing = true
        }
      },

      editFunction(idx) {
        Object.assign(this.newFunction, this.value[idx])
        this.functionIndex = idx
        this.editing = true
      },

      addFunction(def) {
        this.value.unshift(Object.assign({}, def))
        this.checkForDuplicates(0)
      },

      updateFunction(def) {
        Object.assign(this.value[this.functionIndex], def)
        this.checkForDuplicates(this.functionIndex)
      },

      deleteFunction(def) {
        this.value.splice(this.functionIndex, 1)
      },

      deleteFunctionByDef(def) {
        const idx = this.value.findIndex(f => f === def)
        if (idx !== -1) {
          this.value.splice(idx, 1)
        }
      },

      checkForDuplicates(idx) {
        const saved = this.value[idx]
        const dup = this.value.find((f, fIdx) => {
          return fIdx !== idx && f.name === saved.name
        })
        if (dup !== undefined) {
          notifications.info(
            `There is another function with the name '${dup.name}'. ` +
            'Would you like to replace it?',
            {
              actions: {
                No: () => false,
                Yes: () => this.deleteFunctionByDef(dup)
              }
            }
          )
        }
      }
    }
  }
</script>
