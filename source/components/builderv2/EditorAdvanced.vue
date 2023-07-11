<script>
  import HideableSection from '../controls/HideableSection.vue'
  import { mapGetters, mapMutations, mapState } from 'vuex'

  export default {
    components: {
      HideableSection
    },

    props: {
      value: {
        type: Object,
        required: true
      }
    },

    computed: {
      action() {
        return this.value
      },

      ...mapGetters([
        'hiddenByTour'
      ]),

      ...mapState([
        'playgroundMode',
        'tourMode',
        'tourStep'
      ])
    }
  }
</script>

<template>
  <div>
    <HideableSection v-if="!hiddenByTour('advanced-settings') && !playgroundMode" :initially-hidden="true" display-name='Advanced' class="advanced-settings">
    <div class="field">
      <label :for="`action_${action.identifier}_name`">Instance Name (optional)</label>
      <input type="text" :id="`action_${action.identifier}_name`" v-model="action.name" placeholder="A descriptive name for this instance">
    </div>
    <div class="field">
      <label :for="`action_${action.identifier}_inputName`">Input Value Name</label>
      <input type="text" :id="`action_${action.identifier}_inputName`" v-model="action.inputName" placeholder="payload">
    </div>
    <div class="field">
      <label :for="`action_${action.identifier}_outputName`">Output Value Name</label>
      <input type="text" :id="`action_${action.identifier}_ouptputName`" v-model="action.outputName" placeholder="payload">
    </div>
    </HideableSection>
  </div>
</template>

<style lang="scss" scoped>
  h3 {
    margin-bottom: 0;
  }

  .settings {
    margin-bottom: 1em;
  }
</style>
