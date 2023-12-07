import SuperBar from '../../components/SuperBar.vue'
import NavTree from '../../components/builderv2/NavTree.vue'
import InstanceSettings from '../../components/InstanceSettings.vue'
import store from '../../store'
import {createApp} from 'vue/dist/vue.runtime.esm-bundler'


console.log('[Settings2] initializing')
const appId = document.getElementById('settings').dataset.appId
store.dispatch('init', {appId})

let index = createApp(InstanceSettings);
index.provide('appId', appId)
index.component("super-bar", SuperBar);
index.component("nav-tree", NavTree);
index.component("instance-settings", InstanceSettings);

index.use(store);

index.mount("#settings");
