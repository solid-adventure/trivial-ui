<script>
  import FilterEditor from './FilterEditor.vue'
  import NavTree from './NavTree.vue'
  import Notices from '../Notices.vue'
  import WebhooksTable from '../activityLog/WebhooksTable.vue'

  export default {
    components: {
      FilterEditor,
      NavTree,
      Notices,
      WebhooksTable,
    }
  }

</script>

<template>
  <div class="InstanceActivity">
    <!-- <super-bar></super-bar> -->
    <Notices></Notices>
    <nav-tree :selected-title="'activity'"></nav-tree>

    <div class="instance-activity-items">
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
    }
  }

</style>