import SuperBar from '../../components/SuperBar.vue'
import NavTree from '../../components/builderv2/NavTree.vue'
import InstanceActivity from '../../components/builderv2/InstanceActivity.vue'
import store from '../../store'
import Vue from 'vue/dist/vue.esm'


console.log('[Activity] initializing')
const appId = document.getElementById('activity').dataset.appId
store.dispatch('init', {appId}).then(() => {

  let show = new Vue({
    el: '#activity',
    store,
    provide: {
      appId
    },
    components: {
      'super-bar': SuperBar,
      'nav-tree': NavTree,
      'instance-activity': InstanceActivity
    }
  })

})
