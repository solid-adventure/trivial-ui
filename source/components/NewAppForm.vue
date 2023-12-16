<template>
    <super-bar></super-bar>
    <div class="PageContainer">
        <div class="Col1">
            <Notices></Notices>
            <div v-if="buildStatus=='initial'" class="FormWrapper">
                <h1>Create App</h1>
                <div class="row">
                    <div class="column">
                        <label for="app_name" class="FormLabel">Name</label>
                        <input type="text" name="app_name" class='text-field' ref='app_name' v-model='appName' placeholder='App Name' @keydown.prevent.enter="_createApp"/>
                    </div>
                    <div class="column">
                        <label for="panels" class="FormLabel">Display</label>
                        <select v-model='appPanelComponent' @keydown.prevent.enter="_createApp" >
                            <option v-for="appPanel of appPanelNames" :value="appPanel.name">{{appPanel.display_name}}</option>
                        </select>
                    </div>
                </div>
                <ul class="Suggestion">
                    <li class="SuggestionText">Need a suggestion? How about <a @click="fillSuggestedName">{{suggestedName}}</a>?</li>
                    <li><button class="refreshIcon" @click.prevent="refreshSuggestion" aria-label="refresh suggestion"></button></li>
                </ul>



                <div class="Submit">
                    <ActionButton class="button-medium" :class="{working: building}" :action="_createApp" :value="buttonText" working-value="Generating App..."></ActionButton>
                </div>
            </div>
            <div v-else class="messages">
                <p>Starting to build {{this.appName}}...</p>
                <p v-for="message in messages">{{message}}</p>
                <p v-if="buildStatus=='complete'">Ready!</p>
            </div>

        </div>

        <div class="Col2">
            <!-- <span class="label">Preview</span> -->
            <!-- <img :src="previewSrc" width="100%" height="auto" /> -->
        </div>
    </div>
</template>
<script>
import AppPanel from './panels/AppPanel'
import { fetchJSON } from 'trivial-core/lib/component-utils'
import ActionButton from './controls/ActionButton.vue'
import { track } from '../../lib/TrackingService'
import Notices from './Notices.vue'
import notifications from './notifications'
import { mapMutations } from 'vuex'
import FeatureManager from 'trivial-core/lib/FeatureManager'
import App from '../models/App'


export default {
    components: {
        ActionButton,
        Notices
    },

    data() {
        return {
            appPanel: null,
            suggestedName: null,
            appName: '',
            appPanelComponent: this.defaultPanelComponent(),
            appPanelNames: AppPanel.names,
            buildStatus: 'initial',
            appId: null,
            tutorialStep: 0,
            tutorialStepsCount: 3,
            messages: [],
            messageTimer: null,
            building: false
        }
    },

    async mounted() {
        this.suggestedName = await this.fetchSuggestedName()
        this.suggestedNameFocus()
    },

    computed: {

        previewSrc() {
            return AppPanel.previewSrc(this.appPanelComponent)
        },

        buttonText() {
            return this.building ? 'Generating App...' : 'Build it!'
        }

    },

    methods:{

        defaultPanelComponent() {
            try {
                let params =  new URLSearchParams(window.location.search)
                let panelParam = params.get('paneltype') || 'dashboard'
                let panel = AppPanel.names.find(n => n.name.toLowerCase() == panelParam.toLowerCase())
                return panel.name
            } catch(e) {
                console.log(`Could not find panel type ${e}`)
                return 'Dashboard'
            }
        },

        incrementTutorial() {
            this.tutorialStep++
        },

        decrementTutorial() {
            this.tutorialStep--
        },

        startMessages() {
            this.messageTimer = setInterval(() => this.messages.push('Building...'), 2000)
        },

        stopMessages() {
            window.clearInterval(this.messageTimer)
        },

        async stopMessagesAndRedirect() {
            this.stopMessages()
            let locFromPanel = this.appPanel.afterCreatePath(this.appId)
            window.location = locFromPanel ? locFromPanel : `/apps/${this.appId}`
        },

        async _createApp() {
        try {
          let app = new App(this.$store)
          this.appPanel = new AppPanel(this.appPanelComponent)
          const appInstance = await app.create({name: this.appName, panelOptions: this.appPanel.defaultOptions})
          track('App Creation Started', {})
          this.buildStatus = 'started'
          // this.incrementTutorial()
          this.startMessages()
          await this.appPanel.afterAdd(app)
          this.build(appInstance, this.$store.state.manifest.content)
        } catch (error) {
          console.log('[AppManager][createApp] Error: ', error)
          track('App Creation Failed', {})
          notifications.error(`Failed to create app: ${error.message}`)
        }
      },

      async build(appInstance, manifest) {
        try {
          const params = FeatureManager.featureParams()
          fetchJSON(`/build?${params}`, { // await removed
            method: 'post',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(manifest)
          })
          this.buildStatus = 'complete'
          this.appId = appInstance.name
          this.stopMessagesAndRedirect()
        } catch(error) {
          this.stopMessages()
          console.error('[NewAppForm][build] Error:', error)
          notifications.error(
            `The app build failed with the following error. Please retry: ${error.message}`,
            {
              actions: {
                Retry: async () => this.build(appInstance, manifest)
              }
            }
          )
        }
      },

      async refreshSuggestion(){
          this.suggestedName = await this.fetchSuggestedName()
          track('Refreshed Name Suggestion',{
              'New Suggested Name': this.suggestedName
          })
      },

      async fetchSuggestedName(){
          try {
            const name = await fetchJSON('/proxy/trivial?path=/apps/name_suggestion')
            return name.suggestion
        }
        catch(error){
            console.log('[NewAppForm][fetchSuggestedName] Error: ', error)
            notifications.error(error.message)
        }
      },

      fillSuggestedName(){
          this.appName = this.suggestedName
          track('Suggested App Name Click', {
              'Suggested Name': this.suggestedName
          })
        },

      suggestedNameFocus() { this.$refs.app_name.focus() },

      ...mapMutations([
        'addApp', 
      ])

    },
}
</script>
<style lang="scss" scoped>
.PageContainer{
    position: fixed;
    top: 80px;
    height: calc(100% - 80px);
    width: 100%;
    padding-top: 0.5em;
    display: flex;
    align-items: start;
}

.Col1, .Col2 {
    width: 100%;;
    margin: 2em
}

.Col1{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    margin-left:2em;
}

.Header{
    width: calc(100% - 4em);

    h1 {
        margin-block-end: 0.1em;
    }

    em {
        margin-bottom: 2em;
        display: block;
    }
}

.FormWrapper {

    .row {
        display: flex;
        flex-direction: row;
        align-items: flex-start;

        .column {
            margin-right: 1em;
        }

    }

    li {
        list-style-type: none;
        line-height: 2em;
    }


    input, select {
        box-sizing: border-box;
        padding: 0.5em;
        width: 12em;
        color: var(--on-background);
        font-size: 1em;
        height: 3em;
    }

    input {
        width: 18em;
    }

    select {
        vertical-align:top;
    }

    li {
        font-size: 16px;
    }
}

.FormLabel, .label{
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    display: block;
}

.SuggestionText{
    margin: 1em 0 1em -40px;
    line-height: 1em;

    a {
        color: var(--primary);
    }
}

.Suggestion{
    display: inline;
    li{
        display: inline-block;
    }
    a {
        cursor: pointer;
    }
}

.refreshIcon{
    height: 1em;
    width: 1em;
    background-image: url("/source/assets/images/sync-solid.svg");
    color: var(--on-surface);
    background-color: transparent;
    cursor: pointer;
}

.info-bar {

    display: flex;
    justify-content: space-evenly;

    .back {
        display: block;
    }

    .counter {
        display: block;
        text-align: right;
        flex-grow: 2;
        }


}

.messages p {
    margin: 0;
    padding: 0;
    opacity: 0.5;
}

.tut-animation img {
    width: 45vw;
}

</style>
