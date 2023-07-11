import SuperBar from '../../components/SuperBar.vue'
import InstanceManager from '../../components/InstanceManager.vue'
import InstanceExport from '../../components/InstanceExport.vue'
import store from '../../store'
import Vue from 'vue/dist/vue.esm'


console.log('[Export] initializing')
const appId = document.getElementById('export').dataset.appId
store.dispatch('init', {appId})

let show = new Vue({
  el: '#export',
  store,
  provide: {
    appId
  },
  components: {
    'super-bar': SuperBar,
    'instance-manager': InstanceManager,
    'instance-export': InstanceExport
  }
})
