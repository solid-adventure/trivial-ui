<template>
  <div class="section-container">
      <h1>{{sectionTitle}}</h1>
      <hr />
</div>
</template>

<script>
  import PanelBase from './PanelBase.vue'

  export default {

    mixins: [PanelBase],

    computed: {

      sectionTitle() {
        try {
          return this.app.panels.options.title
        } catch(e) {
          return ''
        }
      }

    },

    methods: {
      // Section renders static attributes from its options, and skips the network call.
      fetchData() {
        return false
      }
    }
  }
</script>

<style lang="scss" scoped>

  .section-container {

    margin-top: 4em;

    hr {
      border: 1px solid var(--on-background-20);
      margin-bottom: 2em;
    }


  }


</style>