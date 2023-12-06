import OrganizationInviteUser from '../../../components/OrganizationInviteUser.vue'
import SuperBar from '../../../components/SuperBar.vue'
import Vue from 'vue/dist/vue.esm'
import store from '../../../store'

const orgId = document.getElementById('organization-invitations-new').dataset.orgId
store.dispatch('init', {orgId})


let edit = new Vue({
  el: '#organization-invitations-new',
  store,
  provide: {
    orgId
  },
  components: {
    'organization-invite-user': OrganizationInviteUser,
    'super-bar': SuperBar,
  }
})