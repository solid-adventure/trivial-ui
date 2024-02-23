<script>
import { fetchJSON } from "trivial-core/lib/component-utils";
import { mapState } from "vuex";
import { mapMutations } from "vuex";

export default {
  computed: {
    ...mapState({
      descriptive_name: (state) => state.app.descriptive_name,
      owner_id: (state) => state.app.owner_id,
      owner_type: (state) => state.app.owner_type,
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
    };
  },

  created() {
    this.loadOrganizations();
  },

  methods: {
    ...mapMutations(["updateAppOwner"]),

    setUserType(user_type, org_name) {
      if (user_type === "Organization") {
        this.new_owner_type_path = "organizations";
        this.confirm_msg = `Transfer "${this.descriptive_name}" to the organization| "${org_name}"?`;
      } else if (user_type === "User") {
        this.new_owner_type_path = "users";
        this.confirm_msg = `Transfer "${this.descriptive_name}" to yourself?`;
      } else {
        throw new Error("user_type is not set appropriately.");
      }
    },
    async loadOrganizations() {
      try {
        let response = await fetchJSON(`/proxy/trivial?path=/organizations`);
        this.organizations = response;
      } catch (error) {
        this.load_org_error = true;
      }
    },

    async transferApp(new_owner_type, new_owner_id, org_name) {
      this.setUserType(new_owner_type, org_name);
      if (confirm(this.confirm_msg)) {
        try {
          this.transfer_in_progress = true;
          this.transfer_error = false;
          let response = await fetchJSON(`/proxy/trivial`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              path: `/apps/${this.current_app_id}/transfer/${this.new_owner_type_path}/${new_owner_id}`,
            }),
          });
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
  <div id="app-notices">
    <span v-if="transfer_in_progress">Transfer In Progress...</span>
    <span v-if="transfer_error">Transfer Failed.</span>
    <span v-if="owner_type === 'User' && !transfer_in_progress">
      <strong>This app is visible only to you.</strong><br>Transferring this app
      will make it visible to all members of the organization.
    </span>
    <div v-if = "owner_type !== 'User' && !transfer_in_progress">
      <p>Make the app visible only to you:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
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
              v-if="owner_id === org.id && owner_type === 'Organization'"
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
</template>

<style lang="scss" scoped>
.active {
  background-color: var(--table-column-head-color);
}
table.user-organizations {
  width: 70%;
}

#app-notices {
  display: flex;
  margin-top: 5px;
  height: 4em;
  margin-bottom: 30px;
  align-items: center;
}
</style>
