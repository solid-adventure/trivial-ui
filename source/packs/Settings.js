
import SuperBar from '../components/SuperBar.vue'
import Settings from '../components/Settings.vue'
import store from '../store'
import Vue from 'vue/dist/vue.esm'


console.log('[Settings] initializing')
store.dispatch('init', {})

let index = new Vue({
  el: '#settings',
  store,
  components: {
    'super-bar': SuperBar,
    'settings': Settings
  }
})