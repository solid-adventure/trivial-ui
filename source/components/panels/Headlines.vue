<template>
  <div class="panels-container">
    <div v-for="headline of headlines" class="panel">
      <h1>
        {{headline.count}}
      </h1>
      <p>{{headline.title}}</p>
    </div>
  </div>
</template>

<script>
  import PanelBase from './PanelBase.vue'

  export default {

    mixins: [PanelBase],

    methods: {

      handleResponse(response) {
        if (response.statusCode >= 400) {
          this.errors = response.body
          this.headlines = [{count: '-', title: this.errors}]
        } else {
          try {
            let r = response.body
            this.headlines = r.headlines
          } catch (error) {
            this.errors = error
            this.headlines = [{count: '-', title: this.errors}]
          }          
        }
      }
    }
  }
</script>

<style lang="scss" scoped>

  .panels-container {
    display: flex;
    flex-direction: column;
  }

  .panel {
    width: calc(100% - 6em);
    height: 30vh;
  }

  @media only screen and (min-width: 768px) {
    /* For mobile phones: */

    .panels-container {
      display: flex;
      flex-direction: row;
    }

    .panel {
      width: 320px;
      height: 200px;
    }
  }

  .panel {
    border: 1px solid var(--on-background-20);
    border-radius: 12px;
    padding: 2em;
    margin: 1em;


    h1 {
      color: var(--series-1);
      font-size: 5em;
      margin-bottom: 0;
    }


  }
</style>