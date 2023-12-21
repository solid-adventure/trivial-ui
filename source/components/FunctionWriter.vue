<template>
    <div class="overlay">

        <div class="container">
            <EditFunction
                :value="newFunction"
                :standAloneMode="true"
                title="JavaScript Function Writer"
            ></EditFunction>

          <div class="support-link">
            Questions? 
            <a link="mailto:support@withtrivial.com">support@withTrivial.com</a>
          </div>

        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "../assets/stylesheets/includes/auth";
    .container {
        text-align: left;
    }

    .modal-overlay {
        background-color: transparent;
    }

   .support-link {
      position: absolute;
      bottom: 1em;
      text-align: center;
    }

</style>

<script>
  import TrackingService from '../../lib/TrackingService';
  import EditFunction from './EditFunction.vue'

  import store from '../store'
export default {
    components: {
        EditFunction
    },

    created() {
        // This seems to be wrong sadly we can just rename setIsAuthenticated
        // To 'ShowSuperBar'
      store.dispatch('setIsAuthenticated', {isAuthenticated: false});
    },

    data(){
        return {
        newFunction: {
          name: 'sayHello',
          definition: `function sayHello (name) {\n\n  return \`Hello, \${name}\`\n\n}`,
          testInput: '"World"',
          notes: 'Realtime JavaScript function writer'
            }
        }
    },

    methods: {

    }
}
</script>