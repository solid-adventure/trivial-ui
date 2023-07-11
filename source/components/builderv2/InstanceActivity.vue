<script>
  import WebhooksTable from '../activityLog/WebhooksTable.vue'

  export default {
    inject: ['appId'],

    components: {
      WebhooksTable
    }
  }

</script>

<template>
  <div class="InstanceActivity">
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