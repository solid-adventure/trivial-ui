<script>
  import { mapActions, mapMutations, mapState } from 'vuex'
  import Icon from '../Icon.vue'
  import ProgramTree from './ProgramTree.vue'

  export default {

    components: {
      Icon,
      ProgramTree,
    },

    props: {
      selectedTitle: {
        type: String,
        required: false
      },
      program: {
        type: Object,
        required: false
      },
      selectedAction: {
        type: Object,
        required: false
      }
    },

    methods: {
      selected(title) {
        return this.selectedTitle === title ? 'selected' : 'unselected'
      },

      navigateTo(action) {
        this.$emit('programNavigate', action)
      }

    },

    computed: {
      ...mapState([
        'app'
      ])
    }

  }
</script>

<template>
  <div class="navtree">
    <div class='app-name-container'>
      <h1><a :href="`/apps/${this.app.name}`">{{this.app.descriptive_name}}</a></h1>
    </div>
    <a href="activity">
      <div :class="selected('activity')">
        <Icon icon="code"></Icon>
        <span>Activity Log</span>
      </div>
    </a>
    <div :class="selected('builder')">
      <Icon icon="contract"></Icon>
      <span>App Builder</span>
      <ProgramTree v-if="program" :value="program" :selected="selectedAction" @navigate="navigateTo"></ProgramTree>
    </div>
    <a href="settings2">
      <div :class="selected('settings')">
        <Icon icon="gear"></Icon>
        <span>Settings</span>
      </div>
    </a>
  </div>
</template>

<style lang="scss" scoped>

    .navtree {
      position: fixed;
      top: 80px;
      left: 0;
      box-sizing: border-box;
      padding: 0;
      width: 23em;
      height: 100%;
      overflow: auto;
      border-right: 1px solid var(--on-background-20);
      background-color: var(--surface);

      .app-name-container {
        padding: 1em;
        font-size: 1.5em;
      }

      h2 {
        font-weight: 200;
        margin: 1em 0;
        font-size: 1.25em;
        a {
          color: var(--on-background)
        }
      }


      .unselected, .selected {
        padding: 1em;
      }

      .selected {
        background-color: var(--background);

        h2 {
          font-weight: 400;
        }

      }

      .unselected:hover {
        background-color: var(--background-high-contrast);
      }


    }
</style>