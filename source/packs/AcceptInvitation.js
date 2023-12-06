import AcceptInvitation from '../components/AcceptInvitation.vue'
import store from '../store'
import Vue from 'vue/dist/vue.esm'

console.log(`[AcceptInvitation] Initializing`)
store.dispatch('init', {})

let  acceptInvitation = new Vue({
    el: '#accept_invitation',
    store,
    components: {
        'accept-invitation': AcceptInvitation
    }
})