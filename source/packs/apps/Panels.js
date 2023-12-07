import Panels from '../../components/Panels.vue'
import SuperBar from '../../components/SuperBar.vue'
import store from '../../store'
import {createApp} from 'vue/dist/vue.runtime.esm-bundler'


console.log('[Panels] initializing')
const appId = document.getElementById('panels').dataset.appId
store.dispatch('init', {appId}).then(() => {

  let index = createApp(Panels);
  index.component("panels", Panels);
  index.component("super-bar", SuperBar);
  
  index.use(store);
  
  index.mount("#panels");

})


