import SuperBar from '../../components/SuperBar.vue'
import NavTree from '../../components/builderv2/NavTree.vue'
import InstanceActivity from '../../components/builderv2/InstanceActivity.vue'
import store from '../../store'
import {createApp} from 'vue/dist/vue.runtime.esm-bundler'


console.log('[Activity] initializing')
const appId = document.getElementById('activity').dataset.appId
store.dispatch('init', {appId}).then(() => {
  
let index = createApp(InstanceActivity);
index.provide('appId', appId)
index.component("super-bar", SuperBar);
index.component("nav-tree", NavTree);

index.use(store);

index.mount("#activity");
})
