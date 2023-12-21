<script>
  import ActionDescriptors from 'trivial-core/lib/actionsv2/catalog/ActionDescriptors'
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
      programTitle: {
        type: String,
        required: false,
        default: 'App Builder'
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
      },

    },

    computed: {

      humanizedProgramTitle() {
        // ReceiveWebhook is an unfriendly and hard to scrub default, so we'll just call it App Builder
        return this.programTitle == 'ReceiveWebhook' ? "App Builder" : this.programTitle
      },

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
    <a href="builder2">
      <div class="title" :class="selected('builder')">
        <Icon icon="contract"></Icon>
        <span>{{ humanizedProgramTitle }}</span>
        <!-- This almost works, but navigateTo is causing the page to reload and drop the action -->
        <!-- Questioning the concept, not worth fixing right now -->
        <!-- <ProgramTree v-if="program" :value="program" :selected="selectedAction" @navigate="navigateTo"></ProgramTree> -->
      </div>
    </a>
    <a href="activity">
      <div class="title" :class="selected('activity')">
        <Icon icon="code"></Icon>
        <span>Activity Log</span>
      </div>
    </a>
    <a href="settings2">
      <div class="title" :class="selected('settings')">
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
      padding: 0 2em;
      width: 23em;
      height: 100%;
      overflow: auto;
      border-right: 1px solid var(--on-background-20);
      background-color: var(--surface);

      .app-name-container {
        padding: 1em;
        font-size: 1.5em;
      }

      .title {
        font-size: 1.15em;
      }

      .icon-wrapper {
        vertical-align: top;
        margin-right: 0.5em;
        margin-top: 0.1em;
      }

      .unselected, .selected {
        padding: 1em;
        margin: 0 2em;
        border-radius: 1em;
      }

      .unselected {
        color: var(--on-surface);
      }

      .selected {
        color: var(--primary);
        background-color: var(--secondary);
        font-weight: bold;
      }

      .unselected:hover {
        background-color: var(--background-high-contrast);
      }


    }
</style>