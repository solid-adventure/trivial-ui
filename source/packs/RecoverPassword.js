import RecoverPassword from '../components/RecoverPassword.vue'
import Vue from 'vue/dist/vue.esm'

console.log(`[RecoverPassword] Initializing`)

let registerPassword = new Vue({
    el: '#recover_password',
    components: {
        'recover-password': RecoverPassword
    }
})