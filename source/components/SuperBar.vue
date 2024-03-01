<template>
  <div class="SuperBar">
    <!-- NOTE The brand logo image is overwritten with var(--logo) -->
    <span class="brand"><a href="/"><img src="/assets/images/trivial-logo-light-warm.svg"/></a></span>
    <span class="superlink" :class="{active: isActive('dashboard')}"><a href="/dashboard">Dashboards</a></span>
    <span class="superlink" :class="{active: isActive('contract')}"><a href="/contract">Contracts</a></span>
    <!-- TEMP DISABLE -->
    <!-- <span class="superlink" :class="{active: isActive('unset')}"><a href="/?paneltype=unset">Data Connectors</a></span> -->
    <span class="settings">
      <div class ="theme">
        <ToggleButton
          @update:modelValue="updateToggleButtonState"
          :modelValue="themeToggleActive"
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
    vertical-align: middle;

    span {
      padding: 0 1em;
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
      background-color: var(--super-bar-background-active);
      color: var(--on-background);
      border-bottom: 0;
      border-color: var(--accent);
    }

  }

  .brand img {
    height: calc(100% - 1em);
    max-width: 4em;
    vertical-align: middle;
    margin-top: -0.5em;
    content: var(--logo-superbar);
  }

  .brand {
  	font-weight: 100;
  	font-size: 1.5em;
    margin-left: 0.6em;
    vertical-align: middle;
  }

  .settings {
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

  export default {
    data(){
      return {
        activeTheme: 'Light',
        themeUpdating: false,
        prevLink: undefined,
        newLink: undefined
      }
    },

    mounted() {
      this.setActiveTheme()
    },

    components: {
      Icon,
      ToggleButton
    },

    computed: {
      themeToggleActive(){
        return this.activeTheme == 'Dark'
      },

      firstName() {
        if (!this.user) { return 'Guest' }
        const match = /^\s*(\S+)/.exec(this.user.name || '')
        return match ? match[1] : (this.user.name || '')
      },

      ...mapState([
        'user'
      ]),

    },

    methods: {

      setActiveTheme() {
        if (!this.user || !this.user.color_theme) { return }
        this.activeTheme = this.user.color_theme
      },

      isActive(tab) {
        if (window.location.pathname != '/') { return false }
        let params =  new URLSearchParams(window.location.search)
        let panelTypeFromLocation = params.get('paneltype')
        if (tab == 'dashboard' && !panelTypeFromLocation) {
          return true
        }
        return tab == panelTypeFromLocation

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
        window.setTimeout(() => {
          this.prevLink.remove()
        }, 500)
        await this.themeUpdateCall()
        track('Changed Theme', {
          'New Active Theme': this.activeTheme
        })
        this.themeUpdating = false
      },

      async themeUpdateCall() {
        this.$store.state.Session.updateProfile({color_theme: this.activeTheme})
        .catch(err => console.error('[Settings][themeUpdateCall] Error: ', err))
      }
    }
  }
</script>
