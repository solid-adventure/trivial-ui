<script>
import { fetchJSON } from 'trivial-core/lib/component-utils'
import Organization from './Organization.vue';

export default {
    data() {
        return {
            errorMessage: null,
            newOrgName: '',
            organizations: []
        };
    },
    created() {
        this.loadOrganizations()
    },
    methods: {
        async newOrganization(e) {
            e.preventDefault();
            try {
                await fetch('/proxy/trivial', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        path: `/organizations`,
                        name: this.newOrgName,
                        billing_email: this.$store.state.user.email
                    })
                });
            }
            catch (error) {
                console.log('[OrganizationsManager][newOrganization] Error: ', error);
                this.errorMessage = error.message;
            }
            this.newOrgName = '';
            this.loadOrganizations()
        },
        async newUser({orgId, userId, role}) {
            try {
                await fetch('proxy/trivial', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        path: `/organizations/${orgId}/create_org_role`,
                        user_id: userId,
                        role: role
                    })
                });
            }
            catch (error) {
                console.log('[OrganizationsManager][newUser] Error: ', error);
                this.errorMessage = error.message;
            }
            this.loadOrganizations()
        },
        async removeOrganization(orgId) {
            try {
                await fetch(`proxy/trivial?path=/organizations/${orgId}`, {
                    method: 'DELETE',
                    headers: { 'content-type': 'application/json' }
                });
            }
            catch (error) {
                console.log('[OrganizationsManager][removeOrganization] Error: ', error);
                this.errorMessage = error.message;
            }
            this.loadOrganizations()
        },
        async removeRole({orgId, userId}) {
            try {
                await fetch(`proxy/trivial?path=/organizations/${orgId}/delete_org_role`, {
                    method: 'DELETE',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        user_id: userId
                    })
                });
            }
            catch (error) {
                console.log('[OrganizationsManager][removeRole] Error: ', error);
                this.errorMessage = error.message;
            }
            this.loadOrganizations()
        },
        async fetchOrganizations() {
            try {
                let orgs = await fetchJSON(`/proxy/trivial?path=/organizations`);
                return orgs;
            }
            catch (error) {
                console.log('[OrganizationsManager][loadOrganizations] Error: ', error);
                this.errorMessage = error.message;
            }
        },
        async injectOrganizationUsers(orgs) {
            let promises = [];
            for (let org of orgs) {
                let response = fetchJSON(`/proxy/trivial?path=/organizations/${org.id}`);
                promises.push(response);
            }
            const responses = await Promise.all(promises);
            responses.forEach((org, i) => { orgs[i].users = org.users; });
            this.organizations = orgs;
        },
        async loadOrganizations(){
            await this.fetchOrganizations()
                .then(response => {
                this.injectOrganizationUsers(response);
            });
        }
    },
    components: { Organization }
}
</script>
<template>
  <div>
    <h2>Organizations Manager</h2>
    <div v-if="errorMessage" id="messages">{{errorMessage}}</div>
    <p>Here you can manage all the organizations you are a part of.</p>

    <span>
      <form id="newOrgForm">
        <input type="text" placeholder="name" v-model="newOrgName" />
        <button class="button-medium" @click="newOrganization">Add New Organization</button>
      </form>
    </span>
    <div class="section">
      <div v-for="org in organizations" :key="org.id" class="organization">
        <Organization 
          :organization="org"
          @newuser="newUser"
          @removeorganization="removeOrganization"
          @removerole="removeRole"
        ></Organization>
      </div>
    </div>
  </div>
  
</template>
<style lang="scss" scoped>

</style>