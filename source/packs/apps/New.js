import SuperBar from '../../components/SuperBar.vue'
import NewAppForm from '../../components/NewAppForm.vue'
import store from '../../store'
import {createApp} from 'vue/dist/vue.runtime.esm-bundler'


console.log('[New] initializing')
store.dispatch('init', {})

let index = createApp(NewAppForm);
index.component("super-bar", SuperBar);

index.use(store);

index.mount("#new_app");
