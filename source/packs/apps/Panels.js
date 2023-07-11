import Panels from '../../components/Panels.vue'
import SuperBar from '../../components/SuperBar.vue'
import store from '../../store'
import Vue from 'vue/dist/vue.esm'


console.log('[Panels] initializing')
const appId = document.getElementById('panels').dataset.appId
store.dispatch('init', {appId}).then(() => {

  let panels = new Vue({
    el: '#panels',
    store,
    components: {
      panels: Panels,
      'super-bar': SuperBar
    }
  })

})
