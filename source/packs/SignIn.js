import SignIn from '../components/SignIn.vue'
import {createApp} from 'vue/dist/vue.runtime.esm-bundler'
import store from '../store'

console.log(`[Sign In] initializing`)

let index = createApp(SignIn)

index.use(store)
index.component('sign-in', SignIn)
index.mount("#sign_in")