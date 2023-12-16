import SuperBar from '../components/SuperBar.vue'
import Actions from '../components/Actions.vue'
import store from '../store'
import {createApp} from 'vue/dist/vue.runtime.esm-bundler'


console.log('[Actions] initializing')
store.dispatch('init', {})

let index = createApp(Actions);
index.component("super-bar", SuperBar);
index.component("actions", Actions);

index.use(store);

index.mount("#actions");

