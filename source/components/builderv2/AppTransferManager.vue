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
      id: (state) => state.app.id,
      name: (state) => state.app.name,
    }),
  },
  data() {
    return {
      organizations: [],
      transferInProgress: false,
      errorMsg: null,
      loadOrgsError: false,
      transferError: false,
    };
  },

  created() {
    this.loadOrganizations();
  },

  methods: {
    ...mapMutations(["updateAppOwner"]),

    async loadOrganizations() {
      try {
        let response = await fetchJSON(`/proxy/trivial?path=/organizations`);
        this.organizations = response;
      } catch (error) {
        this.loadOrgsError = true;
      }
    },

    async transferApp(org_name, org_id) {
      if (
        confirm(
          `Are you sure you want to transfer "${this.descriptive_name}" to the organization: "${org_name}"?`
        )
      ) {
        try {
          this.errorMsg = null;
          this.transferInProgress = true;
          this.transferError = false;
          let response = await fetchJSON(`/proxy/trivial`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              path: `/apps/${this.id}/transfer/organizations/${org_id}`,
            }),
          });
          await new Promise((resolve) => {
            this.delayTransferIndicator(resolve);
          });
          this.updateAppOwner({
            owner_type: "Organization",
            owner_id: org_id,
          });
        } catch (error) {
          await new Promise((resolve) => {
            this.delayTransferIndicator(resolve);
          });
          this.transferError = true;
        }
      }
    },

    delayTransferIndicator(resolve) {
      setTimeout(() => {
        this.transferInProgress = false;
        resolve();
      }, 1000);
    },
  },
};
</script>

<template>

  <div id="app-notices">
    <span v-if="transferInProgress"> Transfer In Progress... </span>
    <span v-if="transferError"> Transfer Failed. </span>
    <span v-if="owner_type === 'User' && !transferInProgress">
      This app is visible to you. Transferring this app will make it visible to
      all members of organization.
    </span>
  </div>

  <table class="spaced user-organizations" v-if="!loadOrgsError">
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
            <div v-if="owner_id === org.id && owner_type === 'Organization'">
              <span>Current Owner</span>
            </div>
            <div v-else class="new-button-container">
              <a class="button-small" @click="transferApp(org.name, org.id)"
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
  display: block;
  margin-top: 15px;
  height: 2em;
}

</style>
