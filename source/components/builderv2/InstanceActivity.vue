<script>
  import WebhooksTable from '../activityLog/WebhooksTable.vue'
  import NavTree from './NavTree.vue'

  export default {
    components: {
      WebhooksTable,
      'nav-tree': NavTree
    }
  }

</script>

<template>
  <div class="InstanceActivity">
    <!-- <super-bar></super-bar> -->
    <nav-tree :selected-title="'activity'"></nav-tree>
    <WebhooksTable></WebhooksTable>
  </div>
</template>

<style lang="scss">
  .InstanceActivity {
  	margin: 2em;
    left: 23em;
    top: 80px;
    position: relative;
    width: calc(100% - 27em);
  }

</style>