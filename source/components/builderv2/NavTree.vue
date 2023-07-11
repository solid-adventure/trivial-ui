<script>
  import { mapActions, mapMutations, mapState } from 'vuex'

  export default {

    props: {
      selectedTitle: {
        type: String,
        required: false
      }
    },

    methods: {
      selected(title) {
        return this.selectedTitle === title ? 'selected' : 'unselected'
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
        <h2>📓 Activity Log</h2>
      </div>
      </a>
      <a href="builder2">
        <div :class="selected('builder')">
          <h2>🛠 App Builder</h2>
        </div>
        </a>
      <a href="settings2">
        <div :class="selected('settings')">
          <h2>⚙️ Settings</h2>
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