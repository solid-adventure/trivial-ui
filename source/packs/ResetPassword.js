import ResetPassword from '../components/ResetPassword.vue'
import Vue from 'vue/dist/vue.esm'

console.log(`[ResetPassword] Initializing`)

let resetPassword = new Vue({
    el: '#reset_password',
    components: {
        'reset-password': ResetPassword
    }
})