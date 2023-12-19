<template>
    <div class="overlay">
        <div class ="container">
            <div class="header">
                <p v-if="loading">Loading Webhook {{this.webhookId}}</p>
                <p v-else-if="errorMessage">Error Loading Webhook {{this.webhookId}}</p>
                <p v-else>Received {{this.timestamp}}</p>
                <CopyButton class="copy" v-if="payload" :value="jsonPayload">Copy payload</CopyButton>
            </div>
            <p v-if="errorMessage"><em>{{errorMessage}}</em></p>
            <pre v-if="payload" > {{this.jsonPayload}} </pre>
        </div>
    </div>
</template>
<style lang="scss" scoped>

.overlay{
    position: absolute;
    top: 80px;
    width: 100%;
    padding: 0;
}

.overlay p{
    margin-left: 1em;
    float: left;
}

.overlay pre{
    width: 86%;
    color: var(--webhook-pre-color);
    text-align: left;
    margin-left: 1em;
    margin-right: auto;
}

.container{
    align-items: center;
    display: flex;
    flex-direction: column;
    background-color: var(--surface);
    margin: 1em;
}

.header{
    position: relative;
    width: 100%;
}

.header button{
    margin-right: 1em;
    position: fixed;
    top: 11%;
    right: 2%;
}

.copy{
    background: transparent;
    color: var(--on-background);
    font-size: 22px;
}

</style>
<script>

  import CopyButton from './controls/CopyButton.vue'
  import { mapMutations } from 'vuex'
  export default {
    inject: ['webhookId'],

    data(){
        return {
            webhook: null,
            loading: true,
            errorMessage: null,
            payload: null,
        }
    },

    computed: {
        timestamp() {
            if(this.webhook && this.webhook?.created_at){
                const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
                let t = new Date(this.webhook.created_at)
                let hour = t.getHours()
                switch(true){
                    case hour < 12:
                        return `${monthNames[t.getMonth()]} ${t.getDate()}, ${hour}:${('0' + t.getMinutes()).slice(-2)}a`
                    case hour == 12:
                        return `${monthNames[t.getMonth()]} ${t.getDate()}, ${hour}:${('0' + t.getMinutes()).slice(-2)}p`
                    case hour > 12:
                        return `${monthNames[t.getMonth()]} ${t.getDate()}, ${hour%12}:${('0' + t.getMinutes()).slice(-2)}p`
                }
            }
            else {
               console.log('[WebhookDisplay][timestamp] Webhook not available to generate timestamp')
            }
        },

        jsonPayload() {
            return JSON.stringify(this.payload, null, 2)
        }
    },

    components:{
        CopyButton
     },

    created() {
        this.loadWebhook()
    },

    methods: {
        async loadWebhook(){
            try {
                let response = await fetch(`/proxy/trivial?path=/webhooks/${this.webhookId}`)
                this.webhook = await response.json()
                if(this.webhook != null && response.ok){
                    this.setAppId(this.webhook.app_id)
                    this.payload = this.webhook.payload
                }
                else if(!response.ok){
                    console.log(`[WebhookDisplay][loadWebhook] Error: Fetch call response returned not ok` )
                    this.errorMessage = response.statusText
                }
                this.loading = false
            }
            catch (error){
                console.log(`[WebhookDisplay][loadWebhook] Error: ${error}` )
                this.loading = false
                this.errorMessage = error.message
            }
        },

        ...mapMutations([
          'setAppId'
        ])
    }
}
</script>