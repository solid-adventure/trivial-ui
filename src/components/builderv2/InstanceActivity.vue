<script>
  import FilterEditor from './FilterEditor.vue'
  //import NavTree from './NavTree.vue'
  import Notices from '../Notices.vue'
  import WebhooksTable from '../activityLog/WebhooksTable.vue'
  import { mapState, mapGetters } from 'vuex'

  export default {
    components: {
      FilterEditor,
      //NavTree,
      Notices,
      WebhooksTable,
    },
    computed: {
      ...mapState(['app']),
      ...mapGetters(['appLoaded'])
    }
  }

</script>

<template>
  <div class="InstanceActivity">
    <!-- <super-bar></super-bar> -->
    <Notices></Notices>
    <!--<nav-tree :selected-title="'activity'"></nav-tree>-->

    <div class="instance-activity-items">
      <div class='app-name-container'>
        <h1 v-if = "appLoaded"><RouterLink :to="`/apps/${this.app.name}/builder2`">{{this.app.descriptive_name}}</RouterLink></h1>
        <h1 v-else>Loading...</h1>
      </div>
      <FilterEditor></FilterEditor>
      <WebhooksTable></WebhooksTable>
    </div>
  </div>
</template>

<style lang="scss">
  .InstanceActivity {
  	/*margin: 2em;
    left: 23em;
    top: 120px;
    position: relative;
    width: calc(100% - 27em);*/

    display: flex;

    & .instance-activity-items {
      display: flex;
      flex-direction: column;
      width: 100%;

      & a {
        color: var(--clr-text-primary);
      }
    }
  }

</style>