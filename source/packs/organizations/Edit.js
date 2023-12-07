import OrganizationSettings from '../../components/OrganizationSettings.vue'
import SuperBar from '../../components/SuperBar.vue'
import {createApp} from 'vue/dist/vue.runtime.esm-bundler'
import store from '../../store'

const orgId = document.getElementById('organization_edit').dataset.orgId
store.dispatch('init', {orgId})

let index = createApp(OrganizationSettings);
index.provide('orgId', orgId)
index.component("super-bar", SuperBar);
index.component("organization-settings", OrganizationSettings);

index.use(store);

index.mount("#organization_edit");
