<template>
  <div class="OrganizationInviteUser">

    <Notices></Notices>

    <!-- TODO make this a component and pass the items as props -->
    <!-- Once it's a component, spruce up the styling -->
    <div class="breadcrumb">
      <span class="history"><a :href="`/organizations/${this.orgId}/edit`">Users and Roles</a></span>
      <span class="spacer">></span>

<!--  TODO: add this back in when we have a way to get the organization name
      <span class="history">{{ organization.name }}</span>
      <span class="spacer">></span>
 -->
      <span class="active"><strong>Add New User</strong></span>
    </div>

    <div class="page-inset">
      <h2>Add New User</h2>
      <form id="newUserForm" @submit="newOrganizationUser">
        <div class="form-input">
          <div class="label-with-error">
            <label for="name">User Full Name</label>
            <span v-if="errors.newUserName" class="form-error">{{ errors.newUserName }}</span>
          </div>
          <input type="text" id="name" v-model="newUserName" />
        </div>
        <div class="form-input">
          <div class="label-with-error">
            <label for="email">User Email Address</label>
            <span v-if="errors.newUserEmail" class="form-error">{{ errors.newUserEmail }}</span>
          </div>
          <input type="text" id="email" v-model="newUserEmail" />
        </div>
        <span class="section">Role</span>
        <span v-if="errors.newUserRole" class="form-error">{{ errors.newUserRole }}</span>
        <div class="form-input radio-group">
          <input type="radio" id="member" name="role" value="member" v-model="newUserRole">
          <label for="member">Member</label>
          <span class="help"><em>User will have view-only privileges of all apps and users in this organization. They will only be able to update apps they have been explicitly granted permissions for, or if they are the owner of the app</em></span>
          <input type="radio" id="admin" name="role" value="admin" v-model="newUserRole">
          <label for="admin">Admin</label>
          <span class="help"><em>User will be able to edit all apps in this organization, as well as add and remove users</em></span>
        </div>
        <button class="button-medium full-width">Save and Send Invite</button>
      </form>
    </div>
  </div>
</template>
<script>

import { fetchJSON } from 'trivial-core/lib/component-utils'
import Notifications from './notifications'
import Notices from './Notices.vue'

export default {
  inject: ['orgId'],

  data(){
    return {
      newUserName: '',
      newUserEmail: '',
      newUserRole: '',
      errors: {
        newUserName: null,
        newUserEmail: null,
        newUserRole: null,
      }
    }
  },

  components: {
    Notices,
    Notifications,
  },

  computed: {
    newInvitationPath(){
      return `/organizations/${this.orgId}/invitations/new`
    },

  },

  methods: {

    validateForm() {
      let valid = true
      this.errors = {}
      if (this.newUserName === '') {
        valid = false
        this.errors.newUserName = 'Name is required'
      }
      if (this.newUserEmail === '') {
        valid = false
        this.errors.newUserEmail = 'Email is required'
      }
      if (this.newUserRole === '') {
        valid = false
        this.errors.newUserRole = 'Role is required'
      }
      return valid
    },

    async newOrganizationUser(e){
      e.preventDefault()
      if (!this.validateForm()) { return false }
      let data = {
        path: `/auth/invitation`,
        email: this.newUserEmail,
        name: this.newUserName,
        invitation_metadata: {
          org_id: this.orgId,
          role: this.newUserRole
        }
      }
      try{
        await fetchJSON(`/proxy/trivial`, {
          method: 'POST',
          headers: {'content-type': 'application/json'},
          body: JSON.stringify(data)
        })
        Notifications.success('Invitation sent')
        window.setTimeout(() => {
          window.location = `/organizations/${this.orgId}/edit`
        }, 2000)
      }
      catch(error){
        Notifications.error(`Failed to send invitation: ${error.message}`)
      }
    },



  }
}
</script>
<style lang="scss">
 .OrganizationInviteUser {
  height: 100%;
  margin: 2em 10em;
  width: calc(100% - 20em);
  top: 80px;
  position: relative;
 }

div.page-inset {
  background: var(--surface);
  padding: 2em 6em;
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

div.form-input {
  display: flex;
  flex-direction: column;
  margin-bottom: 1em;

  label, div.label-with-error {
    margin-bottom: 0.5em;
  }

}

.form-error {
  color: var(--error);
  margin-left: 0.5em;
}

.form-error::before {
  content: '* ';
}

span.section {
  margin-bottom: 0.5em;
  display: inline-block;
}

div.radio-group {
  flex-direction: row;
  align-content: flex-start;
  flex-wrap: wrap;

  input {
    margin-right: 1em;
    border: 0px;
    width: 1.25em;
    height: 1.25em;
  }
}

div.radio-group > .help {
  margin-block-end: 1em;
  margin-left: 2.25em;
  color: var(--on-surface-secondary);
}

.full-width {
  width: 100%;
}

 table.organization-users {
  width: 100%;
  margin-block: 3em;
}

</style>