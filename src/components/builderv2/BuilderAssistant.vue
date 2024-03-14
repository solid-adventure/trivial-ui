<template>
  <div v-if="assistantSuggestions.length > 0" class="container">
    <h2>Trivi Sez:</h2>
    <ul>
      <li v-for="suggestion in assistantSuggestions">
        <p>{{ suggestion.text }}</p>

        <ActionButton
          class="button-small"
          value="Accept"
          workingValue="Applying..."
          :action="suggestion.onConfirm">
        </ActionButton>
      </li>
    </ul>
  </div>
</template>

<script>

  import ActionButton from '../controls/ActionButton.vue'
  import BuilderAssistant from '../../lib/BuilderAssistant'

  export default {
    components:  {
      ActionButton
    },

    props: {
      app: {
        type: Object,
        required: true
      },
      actions: {
        type: Array,
        required: true
      },
      nextIdentifier: {
        type: Number,
        required: true
      }
    },

    computed: {
      assistantSuggestions() {
        try {
          let builderAssistant = new BuilderAssistant(this.app, this.actions, this.nextIdentifier)
          return builderAssistant.suggestions
        } catch (e) {
          console.log(`BuilderAssistant suggestions failed: ${e}`)
        }
      },
    }


  }
</script>

<style lang="scss" scoped>
  .container {
    position: fixed;
    left: 23em;
    background: var(--accent);
    padding: 1em;
    max-width: 40%;
    box-shadow: 10px 10px 5px 0px var(--surface);;
    z-index: 10;

    pre {
      font-family: monospace;
      font-size: 1.5em;
    }

    h2 {
      margin: 0.5em 0 0 0;
    }

    ul {
      margin: 0;
      padding: 0;

      li {
        list-style-type: none;

        p {
          margin-top: 0;
        }


      }
    }
  }
</style>
