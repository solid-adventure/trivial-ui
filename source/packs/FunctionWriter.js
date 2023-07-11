import FunctionWriter from '../components/FunctionWriter.vue'
import Vue from 'vue/dist/vue.esm'

console.log(`[FunctionWriter] Initializing`)

let functionWriter = new Vue({
    el: '#functionWriter',
    components: {
        'function-writer': FunctionWriter
    }
})