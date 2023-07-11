import SuperBar from '../../components/SuperBar.vue'
import NewAppForm from '../../components/NewAppForm.vue'
import store from '../../store'
import Vue from 'vue/dist/vue.esm'


console.log('[New] initializing')
store.dispatch('init', {})

let new_app = new Vue({
  el: '#new_app',
  store,
  components: {
    'super-bar': SuperBar,
    'new-app-form': NewAppForm,
  }
})
