<template>
  <div class="OrganizationSettings">

    <div class="breadcrumb">
      <span class="history"><a href="/settings">Settings</a></span>
      <span class="spacer">></span>
      <span class="history">{{ organization.name }}</span>
      <span class="spacer">></span>
      <span class="active"><strong>Users And Roles</strong></span>
    </div>

    <div class="page-inset">
      <h1>{{ organization.name }} | Users And Roles</h1>

  <!--
      <form id="editOrgForm">
        <label >Name<input type="text" :placeholder="organization.name" v-model="updatedName"></label>
        <label>Billing Email<input type="text" :placeholder="organization.billing_email" v-model="updatedBillingEmail"></label>
        <button class="button-medium" @click="editOrganization">Update Organization</button>
      </form> -->

      <div class="action-row">
        <a :href="newInvitationPath" class="button-medium">Add New User</a>
      </div>
      <table class="spaced organization-users">
        <thead>
          <tr>
            <th class="name">Name</th>
            <th class="email">Email</th>
            <th class="role">Organization Role</th>
<!--             <th class="status">Status</th>
            <th class="created_at">Date Added</th>
 -->            <th class="actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.user_id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td><span :class="{admin: user.role === 'admin'}">{{ user.role }}</span></td>
<!--             <td>{{ user.invitation_status }}</td>
            <td>{{ user.date_added }}</td>
 -->            <td>
              <a v-if="deletable(user)" href="#" @click="removeUser(user)"><Icon icon="trash"></Icon></a>
            </td>
          </tr>
        </tbody>
      </table>

      <button v-if="orgDeletable" class="button-small deleteOrganization" @click="deleteOrganization">Delete Org</button>
    </div>
  </div>
</template>
<script>
import { fetchJSON } from 'trivial-core/lib/component-utils'
import Icon from './Icon.vue'

export default {

  data(){
    return {
      organization: {},
      updatedBillingEmail:'',
      updatedName: '',
      users: [],
      orgId: this.$route.params.id
    }
  },

  created(){
    this.loadOrganization()
  },

  components: {
    Icon
  },

  computed: {

    newInvitationPath(){
      return `/organizations/${this.orgId}/invitations/new`
    },

    lastAdmin() {
      return this.users.filter(u => u.role == 'admin').length == 1
    },

    orgDeletable() {
      return this.users.length == 0
    },

  },

  methods: {

    deletable(user) {
      return user.role != 'admin' || !this.lastAdmin
    },

    async loadOrganization(){
      try{
        let response = await fetchJSON(`/proxy/trivial?path=/organizations/${this.orgId}`)
        this.organization = response
        this.users.push(...this.organization.users)
        console.log(JSON.stringify(this.organization, null, 2))

      } catch(error){
          console.log('[OrganizationSettings][loadOrganization] Error:', error)
      }
    },

    async editOrganization(e){
      e.preventDefault()
      let updatedParams = {}
      if(this.updatedBillingEmail !== this.organization.billing_email) updatedParams.billing_email = this.updatedBillingEmail
      if(this.updatedName !== this.organization.name) updatedParams.name = this.updatedName
      if(!updatedParams.name && !updatedParams.billing_email) return // no updates provided
      try{
        let response = await fetchJSON('/proxy/trivial', {  
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            ...updatedParams,
            path: `/organizations/${this.orgId}`
          })
        })
      } catch(error){
        console.log('[OrganizationSettings][editOrganization] Error:', error)
      }
      this.updatedBillingEmail = this.updatedName = ''
    },

    async deleteOrganization() {
      if(confirm(`Are you sure you want to delete the ${this.organization.name} Organization?`))
      try {
          let response = await fetch(`/proxy/trivial?path=/organizations/${this.orgId}`, {
              method: 'DELETE',
              headers: { 'content-type': 'application/json' }
          });
          if(response.status!== 204) throw new Error(response.status)
          window.location.href = `http://localhost:3000/settings`
      }
      catch (error) {
          console.log('[OrganizationsManager][deleteOrganization]', error);
      }
    },

    async removeUser(user){
      if(confirm(`Are you sure you want to delete ${user.name} from the ${this.organization.name} Organization?`))
      try{
        let response = await fetch(`/proxy/trivial?path=/organizations/${this.orgId}/delete_org_role&user_id=${user.user_id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          this.users = this.users.filter(u => u.user_id != user.user_id)
        }


        // if(remove.status!== 204) throw new Error(remove.status)
      } catch(error){
        console.log('[OrganizationsManager][deleteUser]', error);
      }
    }
  },


}
</script>
<style lang="scss">
 .OrganizationSettings {
  height: 100%;
  margin: 2em;
  width: calc(100% - 4em);
  top: 80px;
  position: relative;
 }

div.page-inset {
  background: var(--surface);
  padding: 2em 3em;
  border-radius: 1em;
  border: 1px solid var(--background-80);
  margin: 2em;
  min-width: 18em;
}

div.action-row {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

table.organization-users {
  width: 100%;
  margin-block: 3em;
}

span.admin {
  font-weight: bold;
}

</style>