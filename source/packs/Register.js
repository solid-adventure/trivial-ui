import Register from '../components/Register.vue'
import {createApp} from 'vue/dist/vue.runtime.esm-bundler'

console.log(`[Register] Initializing`)

let index = createApp(Register);
index.component("register", Register);

index.use(store);

index.mount("#register");
