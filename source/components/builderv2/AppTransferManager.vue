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
    app_descriptive_name: String,
    app_name: String,
  },

  data() {
    return {
      organizations: [],
      transferInProgress: false,
      transferComplete: false
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

    async transferApp(org_name, org_id) {
      if (
        confirm(
          `Are you sure you want to transfer the App: "${this.app_descriptive_name}"" to the Organization: "${org_name}"?`
        )
      ) {
        try {
          this.transferInProgress = true
          let response = await fetchJSON(`/proxy/trivial`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              path: `/apps/${this.app_id}/transfer/organizations/${org_id}`,
            }),
          });
          console.log(response);
          await new Promise((resolve) => {
            this.delayTransferIndicator(resolve)
          })
          window.location.reload()
        } catch (error) {
          this.delayTransferIndicator()
          console.log("[AppTransferManager][transferApp] Error:", error);
        }
      }
    },

    delayTransferIndicator(resolve){
        setTimeout(()=> {
          this.transferInProgress = false
          this.transferComplete = true
          resolve()
        }, 1000)
      }
  },
};
</script>

<template>
  <div class="title-row">
    <div class = "transfer-status">
      <span v-if="transferInProgress">
        Transfer In Progress...
      </span>
      <span v-if="transferComplete">
        Transfer Complete!
      </span>  
    </div>

    <table class="spaced user-organizations">
      <thead>
        <tr class = "active">
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
              <div  v-if="owner_id != org.id" class="new-button-container">
                <a
                  class="button-medium headroom-small"
                  @click="transferApp(org.name, org.id)"
                  >Transfer</a
                >
              </div>
              <div v-else class="new-button-container">
                <a
                  class="button-medium headroom-small disable-button"
                  >Current Owner</a
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
</template>

<style lang="scss" scoped>

  .active{
    background-color: var(--table-column-head-color);
  }


table.user-organizations {
  width: 70%;
}
.disable-button {
  pointer-events: none;
}
.transfer-status {
  display: block;
  height: 2em;
}

</style>
