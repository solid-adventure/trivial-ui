import AcceptInvitation from '../components/AcceptInvitation.vue'
import store from '../store'
import {createApp} from 'vue/dist/vue.runtime.esm-bundler'

console.log(`[AcceptInvitation] Initializing`)
store.dispatch('init', {})

let index = createApp(AcceptInvitation);
index.component("accept-invitation", AcceptInvitation);

index.use(store);

index.mount("#accept_invitation");