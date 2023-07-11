import SuperBar from '../../components/SuperBar.vue'
import NavTree from '../../components/builderv2/NavTree.vue'
import InstanceSettings from '../../components/InstanceSettings.vue'
import store from '../../store'
import Vue from 'vue/dist/vue.esm'


console.log('[Settings] initializing')
const appId = document.getElementById('settings').dataset.appId
store.dispatch('init', {appId})

let show = new Vue({
  el: '#settings',
  store,
  provide: {
    appId
  },
  components: {
    'super-bar': SuperBar,
    'nav-tree': NavTree,
    'instance-settings': InstanceSettings
  }
})
