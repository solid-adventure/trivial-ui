import OrganizationInviteUser from '../../../components/OrganizationInviteUser.vue'
import SuperBar from '../../../components/SuperBar.vue'
import {createApp} from 'vue/dist/vue.runtime.esm-bundler'
import store from '../../../store'

const orgId = document.getElementById('organization-invitations-new').dataset.orgId
store.dispatch('init', {orgId})

let index = createApp(OrganizationInviteUser);
index.provide('orgId', orgId)
index.component("super-bar", SuperBar);
index.component("organization-invite-user", OrganizationInviteUser);

index.use(store);

index.mount("#organization-invitations-new");
