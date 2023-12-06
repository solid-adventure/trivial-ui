import OrganizationSettings from '../../components/OrganizationSettings.vue'
import SuperBar from '../../components/SuperBar.vue'
import Vue from 'vue/dist/vue.esm'
import store from '../../store'

const orgId = document.getElementById('organization_edit').dataset.orgId
store.dispatch('init', {orgId})


let edit = new Vue({
  el: '#organization_edit',
  store,
  provide: {
    orgId
  },
  components: {
    'organization-settings': OrganizationSettings,
    'super-bar': SuperBar,
  }
})