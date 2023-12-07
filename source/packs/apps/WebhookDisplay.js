import WebhookDisplay from '../../components/WebhookDisplay.vue'
import SuperBar from '../../components/SuperBar.vue'
import store from '../../store'
import Vue from 'vue/dist/vue.runtime.esm-bundler'

console.log(`[WebhookDisplay] initializing`)
store.dispatch('init', {})

let index = createApp(WebhookDisplay);
index.provide('webhookId', document.getElementById('webhook_display').dataset.webhookId)
index.component("super-bar", SuperBar);
index.component("webhook-display", WebhookDisplay);

index.use(store);

index.mount("#webhook_display");
