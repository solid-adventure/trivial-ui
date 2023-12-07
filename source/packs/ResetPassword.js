import ResetPassword from '../components/ResetPassword.vue'
import {createApp} from 'vue/dist/vue.runtime.esm-bundler'

console.log(`[ResetPassword] Initializing`)
let index = createApp(ResetPassword);
index.component("reset-password", ResetPassword);

index.use(store);

index.mount("#reset_password");