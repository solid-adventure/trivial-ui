import SuperBar from '../components/SuperBar.vue'
import AppsOverview from '../components/AppsOverview.vue'
import store from '../store'
import Vue from 'vue/dist/vue.esm'


console.log('[Index] initializing')
store.dispatch('init', {})

let index = new Vue({
  el: '#index',
  store,
  components: {
    'super-bar': SuperBar,
    'apps-overview': AppsOverview
  }
})
