<template>
  <div class="OrganizationSettings">

    <h1>{{ organization.name }}</h1>

    
      <form id="editOrgForm">
        <label >Name<input type="text" :placeholder="organization.name" v-model="updatedName"></label>
        <label>Billing Email<input type="text" :placeholder="organization.billing_email" v-model="updatedBillingEmail"></label>
        <button class="button-medium" @click="editOrganization">Update Organization</button>
      </form>

    <table class="organization-users">
      <caption>Users</caption>
      <thead>
        <tr>
          <th class="name">Name</th>
          <th class="email">Email</th>
          <th class="remove"></th>
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

    <p>Add New User</p>
    <form id="newUserForm">
      <label >Email<input type="text" placeholder="newuser@email.com" v-model="newUserEmail"></label>
      <button class="button-medium" @click="newUser">Add User</button>
    </form>

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
      organization: null,
      updatedBillingEmail:'',
      updatedName: ''
    }
  },

  created(){
    this.loadOrganization()
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
    async newUser(){
      // TODO look up user by email 
      try{
        await fetch('proxy/trivial', {
          method: 'POST',
          headers: {'content-type': 'application/json'},
          body: JSON.stringify({
            path: `/organizations/${this.orgId}/create_org_role`
          })
        })
      } catch(error){
        console.log('[OrganizationSettings][loadOrganization] Error:', error)
      }
    },

    async editOrganization(){
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
}
</script>
<style lang="scss">
 .OrganizationSettings{ 
  height: 100%;
  margin: 2em;
  width: calc(100% - 4em);
  top: 80px;
  position: relative;
 } 

 #editOrgForm, #newUserForm{
  label{
    margin-right: 1em;
  }
  label > input{
    margin-left: 1em;
  }
 }

 .organization-users{
  width: 100%;
  margin-block: 3em;
  
  thead th{
    margin: 0;
    padding: 0.25rem 0.5rem;
    font-size: 1.25em;
    font-weight: bold;
    border-bottom: 1px solid var(--on-background);
    text-align: left;

    &.name {width: 20%;}
    &.email {width: 40%;}
    &.remove {width: 40%;}
  }
 }
 .deleteOrganization{
  position: absolute;
  right: 2em;
 }

</style>