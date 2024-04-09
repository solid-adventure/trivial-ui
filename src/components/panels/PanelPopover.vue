<template>
  <div v-if="editMode">
    <div class="edit-link">
      <RouterLink :to="`/apps/${app_id}/builder2`">Edit</RouterLink>
    </div>
    <div class="trash-link">
      <a href="#" v-on:click.prevent="deletePanel(app_id)"><Icon icon="trash"></Icon></a>
    </div>
  </div>

</template>

<script>

  import App from '../../models/App'
  import Icon from '../Icon.vue'
  import { mapState } from "vuex";

  export default {

    props: {

      parent_app_id: {
        type: String,
        required: true
      },

      app_id: {
        type: String,
        required: true
      }
    },

    components: {
      Icon
    },

    computed: {
      editMode() {
        let p = new URLSearchParams(window.location.search)
        return p.get('mode') == 'edit' && this.Permissions.canEdit(this.app_id)
      },
      ...mapState({
        Permissions: state => state.Permissions
      })
    },

    methods: {
      async deletePanel(app_id) {
        if (!confirm("Permanently delete this panel? This cannot be undone.")) { return false }
        let panelApp = new App(this.$store, app_id)
        panelApp.destroy()
        let dashboardApp = new App(this.$store, this.parent_app_id)
        await dashboardApp.deletePanelOption({'apps': app_id})
      },
    }

  }

</script>

<style lang="scss" scoped>

</style>