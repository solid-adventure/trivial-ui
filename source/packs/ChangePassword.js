import SuperBar from '../components/SuperBar.vue'
import ChangePassword from '../components/ChangePassword.vue'
import store from '../store'
import Vue from 'vue/dist/vue.esm'

console.log(`[ChangePassword] Initializing`)
store.dispatch('init', {})

let registerPassword = new Vue({
    el: '#change_password',
    store,
    components: {
        'super-bar': SuperBar,
        'change-password': ChangePassword
    }
})