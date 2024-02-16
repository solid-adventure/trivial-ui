<script>
import { fetchJSON } from "trivial-core/lib/component-utils";
import SearchField from "../controls/SearchField.vue";

export default {
  components: {
    SearchField,
  },
  props: {
    appType: String,
    // app_id
  },
  data() {
    return {
      organizations: []
    };
  },
  created(){
    this.loadOrganizations()
  },
  methods: {
    async loadOrganizations() {
      try {
        let response = await fetchJSON(
          `/proxy/trivial?path=/organizations`
        );
        this.organizations = response;
      } catch (error) {
        console.log("[OrganizationSettings][loadOrganization] Error:", error);
      }
    },
    async transferApp(id){
      // console.log(app_id)
      try {
        let response = await fetchJSON(
          `/proxy/trivial?path=/apps/${app_id}/transfer/organizations/${id}`,{
            method: 'PUT'
        });
        console.log(response)
      } catch (error) {
        console.log("[OrganizationSettings][loadOrganization] Error:", error);
      }
    }
  },

};
</script>

<template>
  <div class="page-inset">
    <h2>{{ appType }} | Organizations </h2>
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
            <th class = "organization">Organization</th>
            <th class = "billing-email">Billing Email</th>
            <th class = "action">Action</th>
          </tr>
        </thead>
 
        <tbody>
          <tr v-for="org in organizations" :key="org.id">
            <td>{{org.name}}</td>
            <td>{{org.billing_email}}</td>
            <td>
              <div class="new-button-container">
                <a
                  class="button-medium headroom-small"
                  >Transfer</a
                >
              </div>
            </td>
          </tr>
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
