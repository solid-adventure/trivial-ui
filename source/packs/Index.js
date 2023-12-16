import SuperBar from '../components/SuperBar.vue'
import AppsOverview from '../components/AppsOverview.vue'
import store from '../store'
import {createApp} from 'vue/dist/vue.runtime.esm-bundler'


console.log('[Index] initializing')
store.dispatch('init', {})

let index = createApp(AppsOverview);
index.component("super-bar", SuperBar);
index.use(store);
index.mount("#index");

