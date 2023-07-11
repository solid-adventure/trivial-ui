import Builder from '../../components/builderv2/Builder.vue'
import SuperBar from '../../components/SuperBar.vue'
import store from '../../store'
import Vue from 'vue/dist/vue.esm'


console.log('[Builder2] initializing')
const appId = document.getElementById('builder').dataset.appId
store.dispatch('init', {appId}).then(() => {

  let builder = new Vue({
    el: '#builder',
    store,
    components: {
      builder: Builder,
      'super-bar': SuperBar
    }
  })

})
