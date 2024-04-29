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
    <FilterEditor></FilterEditor>
    <WebhooksTable></WebhooksTable>
  </div>
</template>

<style lang="scss">
  .InstanceActivity {
  	margin: 2em;
    position: relative;
  }

</style>