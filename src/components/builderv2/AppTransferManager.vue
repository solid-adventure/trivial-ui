<script>
import { fetchJSON } from "trivial-core/lib/component-utils";
import { mapState } from "vuex";
import { mapMutations } from "vuex";

export default {
  computed: {
    ...mapState({
      current_descriptive_name: (state) => state.app.descriptive_name,
      current_owner_id: (state) => state.app.owner_id,
      current_owner_type: (state) => state.app.owner_type,
      current_app_id: (state) => state.app.id,
      user_id: (state) => state.user.id
    }),
  },
  data() {
    return {
      organizations: [],
      transfer_in_progress: false,
      load_org_error: false,
      transfer_error: false,
      new_owner_type_path: null,
      confirm_msg: null,
      app_owner_org_name: null
    };
  },

  created() {
    this.loadOrganizations();
  },

  methods: {
    ...mapMutations(["updateAppOwner"]),

    isOwner(org_id) {
      return this.current_owner_id === org_id && this.current_owner_type === 'Organization'
    },
    checkAndSetOrgOwner(org_id, org_name){
      if(this.isOwner(org_id)) {
        this.app_owner_org_name = org_name
        return true
      } else{
        return false
      }
    },
    setOwnerType(user_type, org_name) {
      if (user_type === "Organization") {
        this.new_owner_type_path = "organizations";
        this.confirm_msg = `Transfer "${this.current_descriptive_name}" to the organization| "${org_name}"?`;
      } else if (user_type === "User") {
        this.new_owner_type_path = "users";
        this.confirm_msg = `Transfer "${this.current_descriptive_name}" to yourself?`;
      } else {
        throw new Error("user_type is not set appropriately.");
      }
    },

    async loadOrganizations() {
      try {
        this.organizations = await this.$store.state.Session.apiCall('/organizations');
      } catch (error) {
        this.load_org_error = true;
      }
    },

    async transferApp(new_owner_type, new_owner_id, org_name) {
      this.setOwnerType(new_owner_type, org_name);
      if (confirm(this.confirm_msg)) {
        try {
          this.transfer_in_progress = true;
          this.transfer_error = false;
          await this.$store.state.Session.apiCall(`/apps/${this.current_app_id}/transfer/${this.new_owner_type_path}/${new_owner_id}`, 'PUT');
          await new Promise((resolve) => {
            this.delayTransferIndicator(resolve);
          });
          this.updateAppOwner({
            owner_type: new_owner_type,
            owner_id: new_owner_id,
          });
        } catch (error) {
          await new Promise((resolve) => {
            this.delayTransferIndicator(resolve);
          });
          this.transfer_error = true;
        }
      }
    },

    delayTransferIndicator(resolve) {
      setTimeout(() => {
        this.transfer_in_progress = false;
        resolve();
      }, 1000);
    },
  },
};
</script>

<template>
  <div id = "transfer-app-container">
  <div id="app-notices">
    <span v-if="transfer_in_progress">Transfer In Progress...</span>
    <span v-if="transfer_error">Transfer Failed.</span>
    <span v-if="current_owner_type === 'User' && !transfer_in_progress">
      <strong>This app is visible only to you.</strong><br>Transferring this app
      will make it visible to all members of the organization.
    </span>
    <div id = "private-notice" v-if = "current_owner_type !== 'User' && !transfer_in_progress && !transfer_error">
      <p><strong>This app is visible to all members of {{ app_owner_org_name }}.</strong><br>Make the app visible only to you:</p>
      <a class="button-small" @click="transferApp('User', user_id)"
        >Make Private</a
      >
    </div>
  </div>

  <table class="spaced user-organizations" v-if="!load_org_error">
    <thead>
      <tr class="active">
        <th class="organization">Organization</th>
        <th class="billing-email">Billing Email</th>
        <th class="action">Action</th>
      </tr>
    </thead>
    <tbody>
      <template v-for="org in organizations" :key="org.id">
        <tr>
          <td>{{ org.name }}</td>
          <td>{{ org.billing_email }}</td>
          <td>
            <div
              v-if="checkAndSetOrgOwner(org.id, org.name)"
              class="new-button-container"
            >
              <span>Current Owner</span>
            </div>
            <div v-else class="new-button-container">
              <a
                class="button-small"
                @click="transferApp('Organization', org.id, org.name)"
                >Transfer</a
              >
            </div>
          </td>
        </tr>
      </template>
    </tbody>
  </table>
  <span v-else>Failed to load user's organizations</span>
  <p v-if="!load_org_error && !organizations.length" class="no-orgs">
    <em>You do not have any organziations. Navigate to settings to create a new organization.</em>
  </p>
</div>
</template>
<style lang="scss" scoped>

#transfer-app-container {
  width: 100%;
}
.active {
  background-color: var(--table-column-head-color);
}
table.user-organizations {
  width: 100%;
}
tr {
  height: 4em;
  th {
    width: 33%;
  }
}
#app-notices {
  display: flex;
  height: 8em;
  padding-bottom: 10px;
  align-items: center;
}
.no-orgs {
  text-align: center;
  margin-top: 4em;
}

  
</style>
