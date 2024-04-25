<template>
  <div class="page-container">

    <div class="page-inset">
      <h2>{{ organization.name }} | Users And Roles</h2>
      <div class="action-row" v-if = "canAddMember">
        <RouterLink :to="newInvitationPath" class="button-medium">Add New User</RouterLink>
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
              <a v-if="user.canBeRemoved" href="#" @click="removeUser(user)"><Icon icon="trash"></Icon></a>
            </td>
          </tr>
        </tbody>
      </table>

      <button v-if="orgDeletable" class="button-small deleteOrganization" @click="deleteOrganization">Delete Org</button>
    </div>
  </div>
</template>
<script>

import Icon from './Icon.vue'
import { mapState } from "vuex";
export default {

  data(){
    return {
      organization: {},
      updatedBillingEmail:'',
      updatedName: '',
      users: [],
      orgId: this.$route.params.id, 
      canAddMember: false
    }
  },

  async created(){
    await this.loadOrganization()
    this.findUserRole()
    this.setOrgPermits()
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
      return this.users.length === 1
    },

    ...mapState(['Permissions'])
  },

  methods: {

    async loadOrganization(){
      try{
        this.organization = await this.$store.state.Session.apiCall(`/organizations/${this.orgId}`)
        this.users.push(...this.organization.users)
      } catch(error){
        // TODO these should all print to the UI, not the console
        console.error('[OrganizationSettings][loadOrganization] Error:', error)
      }
    },

    setOrgPermits(){
      this.$store.state.Permissions.can('addMember', 'Org', {userRole: this.currentUserRole}).then(
        res => {
          this.canAddMember = res
        }
      )
      this.users.map(user => {
        return this.$store.state.Permissions.can('removeMember', 'Org', {memberRole: user.role, userRole: this.currentUserRole, lastAdmin: this.lastAdmin })
          .then(res => {
            user.canBeRemoved = res;
          });
      });
    },

    findUserRole(){
      this.currentUserRole = this.users.find(user => user.user_id === (this.$store.state.user.id))?.role
    },

    async deleteOrganization() {
      if(confirm(`Are you sure you want to delete the ${this.organization.name} Organization?`))
      try {
        await this.$store.state.Session.apiCall(`/organizations/${this.orgId}`, 'DELETE')
        this.$router.push({ path: '/settings' })
      }
      catch (error) {
        // TODO these should all print to the UI, not the console
        console.error('[OrganizationsManager][deleteOrganization]', error);
      }
    },

    async removeUser(user){
      if(confirm(`Are you sure you want to delete ${user.name} from the ${this.organization.name} Organization?`))
      try{
        await this.$store.state.Session.apiCall(`/organizations/${this.orgId}/delete_org_role?user_id=${user.user_id}`, 'DELETE')
        this.users = this.users.filter(u => u.user_id != user.user_id)
      } catch(error){
        // TODO these should all print to the UI, not the console
        console.error('[OrganizationsManager][deleteUser]', error);
      }
    }
  },


}
</script>
<style lang="scss">

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