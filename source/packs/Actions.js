import SuperBar from '../components/SuperBar.vue'
import Actions from '../components/Actions.vue'
import store from '../store'
import Vue from 'vue/dist/vue.esm'


console.log('[Actions] initializing')
store.dispatch('init', {})

let index = new Vue({
  el: '#actions',
  store,
  components: {
    'super-bar': SuperBar,
    'actions': Actions
  }
})
