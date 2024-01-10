<script>
  import ActionDescriptors from 'trivial-core/lib/actionsv2/catalog/ActionDescriptors'
  import ActionEnabler from 'trivial-core/lib/ActionEnabler'
  import CopyButton from '../controls/CopyButton.vue'
  import HideableSection from '../controls/HideableSection.vue'
  import ToggleButton from '../controls/ToggleButton.vue' 
  import { mapGetters, mapMutations, mapState } from 'vuex'

  export default {
    components: {
      CopyButton,
      HideableSection,
      ToggleButton
    },

    props: {
      value: {
        type: Object,
        required: true
      },
      displayDescriptorName: {
        type: Boolean,
        required: false,
        default: true
      }
    },

    mounted() {
      this.$store.state.keyboardControl.register(
        'command-/',
        'Toggle Action On/Off',
        this.syntheticClickToggle.bind(this),
      )

    },

    computed: {

      path() {
        let appPath = window.location.pathname
        return `${appPath}/action/${this.action.type}/${this.action.identifier}`
      },

      url() {
        let url = new URL(this.path, window.location.href)
        return url.href
      },

      action() {
        return this.value
      },

      descriptor() {
        return ActionDescriptors.forType(this.action.type)
      },

      iconUrl() {
        return this.descriptor.iconUrl ? `url(${this.descriptor.iconUrl})` : null
      },

      fullDescription() {
        return this.descriptor.fullDescriptionHTML
      },

      hasFullHTMLDescription() {
        return this.descriptor.fullDescriptionHTML != null && this.descriptor.fullDescriptionHTML !== ""
      },

      hasShortDescription() {
        return this.descriptor.shortDescription != null && this.descriptor.shortDescription !== ""
      },

      ...mapGetters([
        'hiddenByTour',
      ]),

      ...mapState([
        'playgroundMode',
        'tourMode',
        'tourStep'
      ])

    },

    methods: {

      handleActionEnabledToggle(val) {
        let a = new ActionEnabler(this.action)
        val ? a.enable() : a.disable()
      },

      syntheticClickToggle() {
        this.$refs.ActionEnabledToggle.$el.click()
      },

      ...mapMutations([
        'incrementTour',
      ])

    }

  }
</script>

<template>
  <div>
    <div class="header-section">
      <div class="title-group">
        <div class="icon" :style="{'background-image': iconUrl}"></div>
        <div class="name-description">
          <h2 class="name" v-if="displayDescriptorName">{{descriptor.name}}
            <CopyButton class="copy copy-path" :value="url" />
          </h2>
          <p v-if="hasShortDescription" class="short-description">{{ descriptor.shortDescription }}</p>
        </div>
      </div>
      <div v-if="action.identifier != 1 && !playgroundMode " class="disable-group">
        <p class="toggle-label">Action On/Off</p>
        <ToggleButton ref="ActionEnabledToggle" @update:modelValue="handleActionEnabledToggle" :modelValue="action.enabled"></ToggleButton>
      </div>
    </div>
    <HideableSection v-if="hasFullHTMLDescription && !hiddenByTour('action-info')" class="action-info">
      <div v-html="fullDescription"></div>
    </HideableSection>

    <div class="field left-inset" v-if="descriptor.nameRequired">
      <label :for="`action_${action.identifier}_name`">Name <span class='required'>(required)</span> </label>
      <input type="text" :id="`action_${action.identifier}_name`" v-model="action.name" placeholder="A descriptive name for this instance">
      <hr />
    </div>



  </div>
</template>

<style lang="scss" scoped>

  .header-section {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-direction: row;
    position: relative;
  }

  .disable-group {
    display: inline-flex;
    flex-direction: column;
    align-items: center;

    p.toggle-label {
      margin-top: 0;
      margin-bottom: 0.3em;
    }

  }

  .title-group {
    display: flex;
    align-items: center;
    margin-bottom: 2em;

    .icon {
      width: 84px;
      height: 84px;
      background-repeat: no-repeat;
      background-position: 50% 50%;
      background-size: contain;
    }

    .name-description {
      margin-left: 1em;

      .name {
        margin-bottom: 0;
        color: var(--on-surface);
      }

      p.short-description {
        margin-top: 0;
        color: var(--on-surface-secondary);
      }

    }

    .copy-path {
      font-size: 0.8em;
    }

  }

</style>
