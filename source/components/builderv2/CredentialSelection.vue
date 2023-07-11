<script>
  import { mapActions, mapState, mapMutations } from 'vuex'
  import CredentialSetEditor from './CredentialSetEditor.vue'

  export default {
    components: {
      CredentialSetEditor
    },

    props: {
      name: {
        type: String,
        required: true
      },
      field: {
        type: Object,
        required: true
      },
      config: {
        type: Object,
        required: true
      },
      forAction: {
        type: Object,
        required: false
      },
      editable: {
        type: Boolean,
        required: true
      }
    },

    data() {
      return {
        editing: false
      }
    },

    created() {
      if (this.currentAction &&
          this.forAction &&
          this.currentCredentialSet &&
          this.forAction.identifier === this.currentAction &&
          this.currentCredentialSet === this.credentialSetId) {
        this.editCredentials()
        this.setCurrentCredentialSet(null)
      }
    },

    mounted() {
      this.setCurrentCredentialSet(this.config[this.name].$cred)
    },

    computed: {
      existingCreds() {
        return this.credentialSets.filter(cs => cs.credential_type === this.field.type)
      },

      credentialSetId: {
        get: function() {
          return this.config[this.name].$cred
        },
        set: function(val) {
          this.config[this.name].$cred = val
          this.setCurrentCredentialSet(val)
        }
      },

      isNewSet() {
        return null === this.credentialSetId
      },

      isSampleDb() {
        return -1 === this.credentialSetId 
      },

      ...mapState([
        'credentialSets',
        'currentAction',
        'currentCredentialSet',
        'tourMode'
      ])

    },

    methods: {
      editCredentials() {
        this.editing = true
      },

      closeEditor() {
        this.loadCredentialSets()
        this.editing = false
      },

      credentialsAdded(data) {
        this.credentialSetId = data.id
      },

      ...mapActions(['loadCredentialSets']), 
      ...mapMutations([
        'incrementTour',
        'setCurrentCredentialSet'
      ])
    }
  }
</script>

<template>
  <div class="selection">
    <div v-if="!editable" class="credential-message">
        <em v-if="isNewSet">⚠️<br />This action does not have credentials saved.<br />Contact the app owner to authorize this service.</em>
        <em v-else>Credentials have been set.<br />Contact the app owner to edit or re-authorize.</em>
    </div>
    <div v-else class="row-container">
      <div class="form-row">
        <select v-model="credentialSetId">
          <option :value="null">New</option>
          <option :value="-1">E-Commerce DB (Sample)</option>
          <option v-for="cred in existingCreds" :key="cred.id" :value="cred.id">{{cred.name}}</option>
        </select>
        <button v-if="isNewSet" class="button-small" @click="editCredentials">Create</button>
        <button v-if="!isNewSet && !isSampleDb" class="button-small" @click="editCredentials">Configure</button>
        <CredentialSetEditor
          v-if="editing"
          :value="credentialSetId"
          :allowed-types="[field.type]"
          :for-action="forAction"
          :config-name="name"
          @added="credentialsAdded"
          @close="closeEditor"></CredentialSetEditor>
      </div>
      <div v-if="tourMode && !isNewSet">
        <button class="button-medium main-btn btn-hover" @click.prevent="incrementTour">Next</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>


  .selection {
    display: flex;
    align-items: stretch;
    column-gap: 0.5em;

    .row-container {
        display: flex;
        flex-direction: column;
        column-gap: 0.5em;
        row-gap: 1em;

        .form-row {
          height: 2.75em;
          display: flex;
          column-gap: 0.5em;

          select {
            height: 100%;
            font-family: inherit;
            font-size: inherit;
            min-width: 8em;
          }

          button {
            height: 100%;
          }

        }
    }


  }

  .credential-message {
    background-color: var(--accent-20);
    color: var(--on-accent-20);
    padding: 1em;
    width: 100%;
  }


</style>
