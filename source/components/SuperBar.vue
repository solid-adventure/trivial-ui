<template>
  <div class="SuperBar">
    <span class="brand"><a href="/"><img src="/assets/images/trivial-logo-light-warm.svg"/></a></span>
    <span class="superlink" :class="{active: isActive('dashboard')}"><a href="/?paneltype=dashboard">Dashboards</a></span>
    <!-- TEMP DISABLE -->
    <!-- <span class="superlink" :class="{active: isActive('unset')}"><a href="/?paneltype=unset">Data Connectors</a></span> -->
    <span class="superlink" :class="{active: isActive('playground')}"><a href="/playground">Playground</a></span>
    <!-- <span><a href="/settings">Account</a></span> -->
    <span class="settings">
      <div class ="theme">
        <ToggleButton 
          @input="updateToggleButtonState" 
          :value="active" 
          off-icon="sun"
          on-icon="moon"
          theme-override="dark"></ToggleButton>
      </div>
      <a href="/settings">Welcome, {{firstName}}!</a>
    </span>
  </div>
</template>

<style lang="scss" scoped>
  .SuperBar {
    background-color: var(--super-bar-background);
    color: var(--on-primary-darker);
    font-size: 1em;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 80px;
    line-height: 80px;
    white-space: nowrap;
    z-index: 100;

    span {
      padding: 0 1em;
      vertical-align: bottom;
    }

    span.superlink {
      display: inline-block;
    }

    a {
      color: var(--on-primary-darker);
    }

    .user-icon {
      height: 32px;
      width: auto;
      color: var(--accent);
      display: inline-block;
      margin-top: 4px;
    }

    .active{
      background-color: var(--scrim-color);
      color: var(--on-background);
      border-bottom: 0;
      border-color: var(--accent);
    }

  }

  .brand img {
    height: 23px;
    width: 115px;
    margin-top: 8px;
  }

  .SuperBar .brand {
  	font-weight: 100;
  	font-size: 1.5em;
    margin-left: 0.6em;
  }

  .SuperBar .settings {
    margin-right: 0.6em;
    float: right;
  }

  .theme{
    display: inline-block;
    vertical-align: middle;
    margin-right: 1em
  }

  .themeUpdating {
    opacity: 50%;
  }
</style>

<script>
  import { mapState } from 'vuex'
  import Icon from './Icon.vue'
  import { fetchJSON } from 'trivial-core/lib/component-utils'
  import { track } from '../../lib/TrackingService'
  import ToggleButton from './controls/ToggleButton.vue'
  import { Moon, Sun } from './icons'
import { timeout } from 'd3-timer'

  export default {
    data(){
      return {
        activeTheme: '',
        themeUpdating: false,
        prevLink: undefined,
        newLink: undefined
      }
    },

    created() {
      this.loadTheme()
    },

    components: {
      Icon,
      ToggleButton
    },

    computed: {
      active(){
        return this.activeTheme == 'Dark'
      },
      firstName() {
        const match = /^\s*(\S+)/.exec(this.user.name || '')
        return match ? match[1] : (this.user.name || '')
      },

      ...mapState([
        'user'
      ])
    },

    methods: {
      isActive(tab) {
        if (window.location.pathname != '/') { return false }
        let params =  new URLSearchParams(window.location.search)
        let panelTypeFromLocation = params.get('paneltype')
        if (tab == 'dashboard' && !panelTypeFromLocation) {
          return true
        }
        return tab == panelTypeFromLocation

      },
      async loadTheme(){
        try {
          let response = await fetchJSON('/proxy/trivial?path=/profile')
          response.user.color_theme == null ? this.activeTheme = "Light" : this.activeTheme = response.user.color_theme
        }
        catch(error){
          console.log('[Settings][loadTheme] Error: ', error)
        }
      },
      async updateToggleButtonState(event){
        this.themeUpdating = true
        this.prevLink = document.querySelector('link[rel=stylesheet]')
        this.newLink = document.createElement('link')
        this.newLink.rel = 'stylesheet'
        switch(event){
          case true:
            this.activeTheme = 'Dark'
            this.newLink.href = '/assets/stylesheets/app.css'
            this.prevLink.after(this.newLink)
            break
          case false:
            this.activeTheme = 'Light'
            this.newLink.href = '/assets/stylesheets/app-light.css'
            this.prevLink.after(this.newLink)
            break
        }
        timeout(() => {
          this.prevLink.remove()
        }, 500)
        await this.themeUpdateCall()
        track('Changed Theme', {
          'New Active Theme': this.activeTheme
        })
        this.themeUpdating = false
      },

      async themeUpdateCall(){
        try {
          let update = await fetchJSON('/proxy/trivial', {
            method: 'put',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({
              path: '/profile',
              color_theme: this.activeTheme
            })
          })
        } catch (err) {
            console.log('[Settings][themeUpdateCall] Error: ', err)
        }
      }
    }
  }
</script>
