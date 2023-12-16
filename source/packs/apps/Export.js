import SuperBar from '../../components/SuperBar.vue'
import InstanceManager from '../../components/InstanceManager.vue'
import InstanceExport from '../../components/InstanceExport.vue'
import store from '../../store'
import {createApp} from 'vue/dist/vue.runtime.esm-bundler'


console.log('[Export] initializing')
const appId = document.getElementById('export').dataset.appId
store.dispatch('init', {appId})

let index = createApp(InstanceExport);
index.provide('appId', appId)
index.component("super-bar", SuperBar);
index.component("instance-manager", InstanceManager);
index.component("instance-export", InstanceExport);

index.use(store);

index.mount("#export");
show.use(store);
