<script>
import { fetchJSON } from "trivial-core/lib/component-utils";
import SearchField from "../controls/SearchField.vue";

export default {
  components: {
    SearchField,
  },
  props: {
    app_type: String,
    app_id: Number,
    owner_id: Number,
  },
  data() {
    return {
      organizations: [],
    };
  },
  created() {
    this.loadOrganizations();
  },
  methods: {
    async loadOrganizations() {
      try {
        let response = await fetchJSON(`/proxy/trivial?path=/organizations`);
        this.organizations = response;
      } catch (error) {
        console.log("[AppTransferManager][loadOrganization] Error:", error);
      }
    },
    async transferApp(org_id) {
      try {
        let response = await fetchJSON(`/proxy/trivial`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            path: `/apps/${this.app_id}/transfer/organizations/${org_id}`,
          }),
        });
        console.log(response);
      } catch (error) {
        console.log("[AppTransferManager][transferApp] Error:", error);
      }
    },
  },
};
</script>

<template>
  <div class="page-inset">
    <h2>{{ app_type }} | Organizations</h2>
    <div class="title-row">
      <!-- <div class="search-container">
        <SearchField
          v-if=""
          :searchTerm="searchTerm"
          v-on:update="searchTerm = $event"
        ></SearchField>
      </div> -->
      <table class="spaced user-organizations">
        <thead>
          <tr>
            <th class="organization">Organization</th>
            <th class="billing-email">Billing Email</th>
            <th class="action">Action</th>
          </tr>
        </thead>

        <tbody>
          <template v-for="org in organizations" :key="org.id">
            <tr v-if = "owner_id != org.id">
              <td>{{ org.name }}</td>
              <td>{{ org.billing_email }}</td>
              <td>
                <div class="new-button-container">
                  <a
                    class="button-medium headroom-small"
                    @click="transferApp(org.id)"
                    >Transfer</a
                  >
                </div>
              </td>
            </tr>
          </template>
        </tbody>
        <!-- <tbody v-else>
          <tr>
            <td>Loading...</td>
          </tr>
        </tbody> -->
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tab.active,
.active {
  background-color: var(--table-column-head-color);
  color: var(--on-background);
  border-bottom: 0;
  border-color: var(--accent);
}
div.action-buttons {
  button {
    background-color: transparent;
  }
}
table.user-organizations {
  width: 100%;
  margin-block: 3em;
}
</style>
