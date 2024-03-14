<script>
  import PanelBase from './PanelBase.vue'

  export default {
    name: 'Contract',
    mixins: [PanelBase],

    // There is no display other than the builder for contracts, but the user may be linked here, so redirect them
    created() {
      window.location.href = `/apps/${this.app_id}/builder2`
    }
  }
</script>