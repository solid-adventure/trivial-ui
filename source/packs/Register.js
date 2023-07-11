import Register from '../components/Register.vue'
import Vue from 'vue/dist/vue.esm'

console.log(`[Register] Initializing`)

let register = new Vue({
    el: '#register',
    components: {
        'register': Register
    }
})