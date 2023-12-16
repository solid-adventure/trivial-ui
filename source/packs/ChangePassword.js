import SuperBar from '../components/SuperBar.vue'
import ChangePassword from '../components/ChangePassword.vue'
import store from '../store'
import {createApp} from 'vue/dist/vue.runtime.esm-bundler'

console.log(`[ChangePassword] Initializing`)
store.dispatch('init', {})

let index = createApp(ChangePassword);
index.component("super-bar", SuperBar);
index.component("change-password", ChangePassword);

index.use(store);

index.mount("#change_password");
