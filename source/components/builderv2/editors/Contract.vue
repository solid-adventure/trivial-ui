<script>
  import EditorOverview from '../EditorOverview.vue'
  import EditorDefinition from '../EditorDefinition.vue'
  import EditorAdvanced from '../EditorAdvanced.vue'
  import HideableSection from '../../controls/HideableSection.vue'
  import CopyButton from '../../controls/CopyButton.vue'
  import { mapState, mapGetters } from 'vuex'

  export default {
    components: {
      EditorOverview,
      EditorDefinition,
      EditorAdvanced,
      HideableSection,
      CopyButton,
    },

    props: {
      value: {
        type: Object,
        required: true
      },
      credentials: {
        type: Object,
        required: true
      },
      nextIdentifier: {
        type: Number,
        required: true
      }
    },

    computed: {
      action() {
        return this.value
      },

      ...mapState([
        'app',
        'manifest'
      ]),

      ...mapGetters([
        'appUrl'
      ])
    },

    methods: {
      edit(action) {
        this.$emit('edit', action)
      }
    }
  }
</script>

<template>
  <div>
    <!-- <EditorOverview :value="action" :displayDescriptorName=false></EditorOverview> -->
    <!-- <EditorAdvanced :value="action"></EditorAdvanced> -->
    <EditorDefinition
      :value="action"
      :credentials="credentials"
      :nextIdentifier="nextIdentifier"
      @edit="edit"></EditorDefinition>
  </div>
</template>

<style lang="scss" scoped>

</style>
