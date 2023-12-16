import Builder from '../../components/builderv2/Builder.vue'
import SuperBar from '../../components/SuperBar.vue'
import store from '../../store'
import {createApp} from 'vue/dist/vue.runtime.esm-bundler'


console.log('[Builder2] initializing')
const appId = document.getElementById('builder').dataset.appId
store.dispatch('init', {appId}).then(() => {
  
let index = createApp(Builder);
index.component("super-bar", SuperBar);
index.component("builder", Builder);

index.use(store);

index.mount("#builder");

})
