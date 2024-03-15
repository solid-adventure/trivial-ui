<template>
  <div class="page-container">

    <Notices></Notices>

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

  data(){
    return {
      newUserName: '',
      newUserEmail: '',
      newUserRole: '',
      orgId: this.$route.params.id,
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
        email: this.newUserEmail,
        name: this.newUserName,
        trivial_ui_url: window.location.origin,
        invitation_metadata: {
          org_id: this.orgId,
          role: this.newUserRole
        }
      }
      try {
        await this.$store.state.Session.apiCall('/auth/invitation', 'POST', data)
        Notifications.success('Invitation sent')
        window.setTimeout(() => {
          this.$router.push({ path: `/organizations/${this.orgId}/edit` })
        }, 2000)
      }
      catch(error){
        Notifications.error(`Failed to send invitation: ${error.message}`)
      }
    },



  }
}
</script>
<style lang="scss" scoped>

  div.page-inset {
    padding: 2em 6em;
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
    max-width: 26em;

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
