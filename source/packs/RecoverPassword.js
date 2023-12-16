import RecoverPassword from '../components/RecoverPassword.vue'
import {createApp} from 'vue/dist/vue.runtime.esm-bundler'

console.log(`[RecoverPassword] Initializing`)

let index = createApp(RecoverPassword);
index.component("recover_password", RecoverPassword);

index.mount("#recover_password");
