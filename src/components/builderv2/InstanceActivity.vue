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

    <FilterEditor></FilterEditor>
    <WebhooksTable></WebhooksTable>
  </div>
</template>

<style lang="scss">
  .InstanceActivity {
  	margin: 2em;
    left: 23em;
    top: 120px;
    position: relative;
    width: calc(100% - 27em);
  }

</style>