<template>
  <div class="OrganizationSettings">

    <h1>{{ organization.name }} | Users And Roles</h1>

<!--
    <form id="editOrgForm">
      <label >Name<input type="text" :placeholder="organization.name" v-model="updatedName"></label>
      <label>Billing Email<input type="text" :placeholder="organization.billing_email" v-model="updatedBillingEmail"></label>
      <button class="button-medium" @click="editOrganization">Update Organization</button>
    </form> -->

    <div class="action-row">
      <a :href="newInvitationPath" class="button-medium">Add New User</button>
      </a>
    </div>
    <table class="organization-users">
      <caption>Users</caption>
      <thead>
        <tr>
          <th class="name">Name</th>
          <th class="email">Email</th>
          <th class="role">Organization Role</th>
          <th class="status">Status</th>
          <th class="created_at">Date Added</th>
          <th class="actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in organization.users" :key="user.user_id">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td><button @click="deleteUser(user.name)">remove</button></td>
        </tr>
      </tbody>
    </table>

<!--     <p>Invite New User</p>
    <form id="newUserForm">
      <label >Email<input type="text" placeholder="newuser@email.com" v-model="newUserEmail"></label>
      <select name="rolelist" id="roles" v-model="newUserRole">
          <option value="" selected disabled hidden>role</option>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
      </select>
    </form> -->

    <button class="deleteOrganization" @click="deleteOrganization">Delete Org</button>
  </div>
</template>
<script>
import { fetchJSON } from 'trivial-core/lib/component-utils'

export default {
  inject: ['orgId'],

  data(){
    return {
      newUserEmail: '',
      newUserRole: '',
      organization: null,
      updatedBillingEmail:'',
      updatedName: ''
    }
  },

  created(){
    this.loadOrganization()
  },

  computed: {
    newInvitationPath(){
      return `/organizations/${this.orgId}/invitations/new`
    }
  },

  methods: {
    async loadOrganization(){
      try{
        let response = await fetchJSON(`/proxy/trivial?path=/organizations/${this.orgId}`)
        this.organization = response

      } catch(error){
          console.log('[OrganizationSettings][loadOrganization] Error:', error)
      }
    },
    async newOrganizationUser(e){
      e.preventDefault()
      if(!this.newUserEmail.length || !this.newUserRole.length) return
      let userId = this.userIdByEmail(this.newUserEmail) // first look up user by email to get user id
      if(userId !== null) this.createRole(userId) // if user exists, create role with existing user
      else { // else, create user, passing the email and a temp name and password
        let tempPassword = this.generateRandString()
        let user = await this.createUser(this.newUserEmail, `${this.organization.name} Member`, tempPassword)
        this.createRole(user.id)
      }
      this.newUserEmail = this.newUserRole = ''
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
          let remove = await fetch(`/proxy/trivial?path=/organizations/${this.orgId}`, {
              method: 'DELETE',
              headers: { 'content-type': 'application/json' }
          });
          if(remove.status!== 204) throw new Error(remove.status)
          window.location.href = `http://localhost:3000/settings`
      }
      catch (error) {
          console.log('[OrganizationsManager][deleteOrganization]', error);
      }
    },

    async createUser(email, name, password){
      try{
        let user = await fetch(`/proxy/trivial?path=/users`,{
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            email,
            name,
            password
          })
        })
      } catch(error){
        console.log('[OrganizationsManager][createUser]', error);
      }
    },

    async deleteUser(name){
      if(confirm(`Are you sure you want to delete ${name} from the ${this.organization.name} Organization?`))
      try{
        let remove = await fetch(`/proxy/trivial?path=/organizations/${this.orgId}/delete_org_role`, {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' }
        });
        if(remove.status!== 204) throw new Error(remove.status)
      } catch(error){
        console.log('[OrganizationsManager][deleteUser]', error);
      }
    }
  },

  async userIdByEmail(email){
    // look up user by email and return user ID if found 
    // else return null
  },

  async createRole(id){
    try{
      await fetch('proxy/trivial', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          path: `/organizations/${this.orgId}/create_org_role`,
          user_id: id,
          role: this.newUserRole
        })
      })
    } catch(error){
      console.log('[OrganizationSettings][createRole] Error:', error)
    }
  },

  generateRandString(){
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
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

div.action-row {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

 // #editOrgForm, #newUserForm{
 //  label{
 //    margin-right: 1em;
 //  }
 //  label > input{
 //    margin-left: 1em;
 //  }
 // }

 table.organization-users {
  width: 100%;
  margin-block: 3em;
}
 //  thead th{
 //    margin: 0;
 //    padding: 0.25rem 0.5rem;
 //    font-size: 1.25em;
 //    font-weight: bold;
 //    border-bottom: 1px solid var(--on-background);
 //    text-align: left;

 //    &.name {width: 20%;}
 //    &.email {width: 40%;}
 //    &.remove {width: 40%;}
 //  }
 // }
 // .deleteOrganization{
 //  position: absolute;
 //  right: 2em;
 // }

</style>