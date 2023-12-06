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
                this.setMessage(error.message)
            }
            this.newOrgName = '';
            this.loadOrganizations()
        },
        async fetchOrganizations() {
            try {
                let orgs = await fetchJSON(`/proxy/trivial?path=/organizations`);
                return orgs;
            }
            catch (error) {
                console.log('[OrganizationsManager][loadOrganizations] Error: ', error);
                this.setMessage(error.message)
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
        }, 
        setMessage(newMessage){
            setTimeout(() => { this.message = newMessage }, 250)
            setTimeout(() => { this.message = null }, 2500)
        },
        navigateTo(orgId){
            // TODO replace with navigation
           window.location.href = `/organizations/${orgId}/edit`
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
    <table class="organization-sets">
        <thead>
            <tr>
                <th class="name">Name</th>
                <th class="billing-email">Billing Email</th>
                <th class="remove"></th>
                <th class="users"></th>
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
.organization-sets {
    width: 100%;
    border-collapse: collapse;
    font-weight: inherit;

    thead th {
        margin: 0;
        padding: 0.25rem 0.5rem;
        font-size: 1.25em;
        font-weight: bold;
        border-bottom: 1px solid var(--on-background);
        text-align: left;

        &.id { width: 10%; }
        &.name { width: 20%; }
        &.billing-email { width: 30%; }
        &.remove { width: 10%; }
        &.users { width: 40%; }
    }

    tbody {
        tr{
            cursor: pointer;
        }

        tr:nth-child(even) {
          background-color: var(--on-background-20);
        }

        tr:hover {
          background-color: var(--primary);

          td {
            color: var(--on-primary);
          }
        }


        td {
          margin: 0;
          padding: 0.25em 0.5em;
        }

        td .remove-organization:hover{
            background-color: var(--primary);
            color: var(--on-primary);
        }
      }
}

#messages{
    margin: 2rem 0;
}
</style>