<script>
import { fetchJSON } from 'trivial-core/lib/component-utils'
import OrganizationUsersManager from './OrganizationUsersManager.vue';

export default {
    data() {
        return {
            message: null,
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
            if(this.newOrgName===''){
                this.setMessage('Give your organization a name.')
                return
            }
            try {
                await this.$store.state.Session.apiCall(`/organizations`, 'POST', {
                    name: this.newOrgName,
                    billing_email: this.$store.state.user.email
                });

            }
            catch (error) {
                console.log('[OrganizationsManager][newOrganization] Error: ', error);
                this.setMessage(error.message)
            }
            this.newOrgName = '';
            this.loadOrganizations()
        },
        async fetchOrganizations() {
            try {
                return await this.$store.state.Session.apiCall(`/organizations`);
            }
            catch (error) {
                console.log('[OrganizationsManager][loadOrganizations] Error: ', error);
                this.setMessage(error.message)
            }
        },
        async injectOrganizationUsers(orgs) {
            let promises = [];
            for (let org of orgs) {
                let response = this.$store.state.Session.apiCall(`/organizations/${org.id}`);
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
        }, 
        setMessage(newMessage){
            setTimeout(() => { this.message = newMessage }, 250)
            setTimeout(() => { this.message = null }, 2500)
        },
        navigateTo(orgId){
            // TODO replace with navigation
           this.$router.push({ path: `/organizations/${orgId}/edit` })
        }
    },
    components: { OrganizationUsersManager }
}
</script>
<template>
  <div>
    <h2>Organizations</h2>
    <p>Here you can manage all the organizations you are a part of.</p>

    <span>
      <form id="newOrgForm">
        <input type="text" placeholder="name" v-model="newOrgName" required/>
        <button class="button-medium" @click="newOrganization">Add New Organization</button>
      </form>
    </span>
    <table class="spaced">
        <thead>
            <tr>
                <th class="name">Name</th>
                <th class="billing-email">Billing Email</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="org in organizations" :key="org.id" @click="navigateTo(org.id)">
                <td>{{ org.name }}</td>
                <td>{{ org.billing_email }}</td>
            </tr>
        </tbody>
    </table>
    <div v-if="message" id="messages">{{message}}</div>
  </div>
  
</template>
<style lang="scss" scoped>

#messages{
    margin: 2rem 0;
}
</style>