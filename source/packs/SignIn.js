import SignIn from '../components/SignIn.vue'
import Vue from 'vue/dist/vue.esm'

console.log(`[Sign In] initializing`)

let signIn = new Vue({
    el: '#sign_in',
    components: {
        'sign-in': SignIn
    }
})