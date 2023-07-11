import WebhookDisplay from '../../components/WebhookDisplay.vue'
import SuperBar from '../../components/SuperBar.vue'
import store from '../../store'
import Vue from 'vue/dist/vue.esm'

console.log(`[WebhookDisplay] initializing`)
store.dispatch('init', {})

let webhookDisplay = new Vue({
    el: '#webhook_display',
    store,
    provide:{
        webhookId: document.getElementById('webhook_display').dataset.webhookId
    },
    components: {
        'super-bar': SuperBar,
        'webhook-display': WebhookDisplay
    }
})