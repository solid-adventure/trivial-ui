<script>
  import ActionButton from '../controls/ActionButton.vue'
  import CredentialTypes from 'trivial-core/lib/actionsv2/catalog/CredentialTypes'
  import CustomFields from './CustomFields.vue'
  import Modal from '../../components/Modal.vue'
  import Notifications from '../notifications'
  import { mapState, mapActions } from 'vuex'
  import parse from '../../lib/pg-connection-string'
  import TrackingService from '../../../lib/TrackingService'
  import {nextTick} from 'vue'

  export default {

    mixins: [
      Modal
    ],

    components: {
      ActionButton,
      CustomFields
    },

    props: {
      value: {
        type: String,
        required: false
      },
      allowedTypes: {
        type: Array,
        required: false
      },
      forAction: {
        type: Object,
        required: false
      },
      configName: {
        type: String,
        required: false
      }
    },

    data() {
      return {
        credentialSet: {
          id: null,
          name: '',
          credential_type: ''
        },
        credentials: {
        },
        errorMessage: null,
        loading: false,
        importConnectionButtonVisible: true,
        connectionUrlFieldVisible: false,
        connectionUrl: ''
      }
    },

    async created() {
      if (this.value) {
        try {
          this.loading = true
          const data = await this.loadCredentialSetAndSecret({id: this.value})
          this.credentialSet.id = data.credential_set.id
          this.credentialSet.name = data.credential_set.name
          this.credentialSet.credential_type = data.credential_set.credential_type
          this.credentials = data.credentials
          this.loading = false
        } catch (err) {
          console.error({err}, `Failed to load credential set ${this.value}`)
          Notifications.error(`Could not load credentials: ${err.message}`)
          this.close()
        }
      } else {
        this.credentialSet.credential_type = this.credentialTypes[0].name
      }
    },

    watch: {
      'credentialSet.credential_type': function(newValue, oldValue) {
        this.setDefaultCredentials()
        if ( (! this.credentialSet.name) ||
             (this.credentialSet.name === this.defaultName(oldValue))) {
          this.credentialSet.name = this.defaultName(newValue)
        }
      },

      connectionUrl(val) {
        this.setCredentialsFromConnectionUrl(val)
      }
    },

    computed: {
      credentialTypes() {
        return CredentialTypes
          .allTypes()
          .filter(name => (!this.allowedTypes) || (-1 !== this.allowedTypes.indexOf(name)))
          .map(name => CredentialTypes.forType(name))
      },

      credentialType() {
        return CredentialTypes.forType(this.credentialSet.credential_type)
      },

      configFields() {
        const type = this.credentialType
        return type ? type.configFields : {}
      },

      isNew() {
        return this.value ? false : true
      },

      configActions() {
        const type = this.credentialType
        return type ? type.configActions(this.credentials) : {}
      },

      resumePath() {
        const tail = `${this.credentialType.protocolName}/${this.value || ''}`
        if (this.forAction) {
          return `action/${this.forAction.type || 'Group'}/${this.forAction.identifier}/credentials/${tail}`
        } else {
          return `vault/${tail}`
        }
      },

      ...mapState([
        'app'
      ])
    },

    methods: {

      async save() {
        try {
          this.errorMessage = null
          this.validate()
          const data = await this.saveCredentialSet({
            credential_set: this.credentialSet,
            credentials: this.credentials
          })
          if (this.isNew) {
            this.$emit('added', data)
            TrackingService.track('Added Credentials', {})
          }
          Notifications.success('Credentials saved')
          this.close()
        } catch (err) {
          console.error({err}, 'Failed to save credentials')
          this.errorMessage = `Save failed: ${err.message}`
        }
      },

      validate() {
        const errors = []
        const entries = [...Object.entries(this.configFields)]
        entries.forEach(entry => {
          const [name, def] = entry
          if (def.required && this.isBlank(this.credentials[name])) {
            errors.push(`You must enter a value for ${this.humanize(name)}`)
          }
        })
        if (errors.length > 0) {
          throw new Error(errors.join(', '))
        }
      },

      isBlank(value) {
        return undefined === value || null === value || /^\s*$/.test(String(value))
      },

      humanize(value) {
        return String(value).replaceAll('_', ' ')
      },

      setConnectionUrlFieldVisible() {
        this.connectionUrlFieldVisible = true
        this.importConnectionButtonVisible = false
        nextTick(() => {this.$refs.connectionUrlInput.focus()})
      },

      setCredentialsFromConnectionUrl(connectionUrl) {
        this.credentials = parse(connectionUrl)
        this.connectionUrlFieldVisible = false
        window.setTimeout(() => {
          this.importConnectionButtonVisible = true
        }, 3000)
      },

      async destroy() {
        try {
          if (confirm(`Are you sure you want to delete the credentials "${this.credentialSet.name}"? Once deleted, they cannot be recovered.`)) {
            this.errorMessage = null
            await this.destroyCredentialSet({id: this.credentialSet.id})
            Notifications.success('Credentials deleted')
            this.close()
          }
        } catch (err) {
          console.error({err}, 'Failed to delete credentials')
          this.errorMessage = `Could not delete: ${err.message}`
        }
      },

      setDefaultCredentials() {
        const newCreds = CredentialTypes.credentialsOfType(this.credentialSet.credential_type);
        [...Object.entries(this.credentials)].forEach(entry => {
          const [name, value] = entry
          if (newCreds.hasOwnProperty(name)) {
            newCreds[name] = this.credentials[name]
          }
        })
        this.credentials = newCreds
        if (this.isNew) {
          this.credentialType.afterCreate({app: this.app, credentials: newCreds})
        }
      },

      defaultName(typeName) {
        const type = CredentialTypes.forType(typeName)
        return type ? type.serviceName : ''
      },

      actionPerformer(action) {
        return () => action(this.credentials, {
          action: this.resumePath,
          manifest: this.$store.state.manifest,
          credentials: this.$store.state.credentials,
          credentialSet: this.credentialSet,
          store: this.$store,
          def: this.forAction,
          configName: this.configName
        })
      },

      ...mapActions([
        'destroyCredentialSet',
        'loadCredentialSetAndSecret',
        'saveCredentialSet'
      ])
    }
  }
</script>

<template>
  <div class="modal-overlay visible">
    <div class="modal modal-medium credential-editor">
      <h1 class="modal-title">{{isNew ? 'Create' : 'Update'}} Credentials</h1>
      <p>A set of credentials to make privelaged API calls. Fields with a lock icon will be encrypted and redacted from logs.</p>
      <span @click="close" class="close-icon"></span>
      <div v-if="loading">
        <p><strong>Loading...</strong></p>
      </div>
      <div v-if="!loading">
        <div class="service-row">
          <p v-if="errorMessage" class="error">{{errorMessage}}</p>
          <p class="service-section">
            <label>Service:</label>
            <select v-if="isNew" v-model="credentialSet.credential_type">
              <option v-for="type in credentialTypes" :key="type.name" :value="type.name">{{type.serviceName}}</option>
            </select>
            <span v-if="!isNew"><strong>{{credentialType.serviceName}}</strong></span>
          </p>
          <!-- TODO Pull this into the service's CredentialType -->
          <p v-if="credentialSet.credential_type == 'PostgreSQLCredentials' " class="connection-section">
            <ActionButton v-if="importConnectionButtonVisible" class="button-small" value="Import Connection URL" :action="setConnectionUrlFieldVisible" />
            <input v-if="connectionUrlFieldVisible" v-model="connectionUrl" type="text" class="connection-field" placeholder="PostgreSQL connection URL" ref="connectionUrlInput"/>
          </p>
        </div>
        <div class="field">
          <label>Name</label>
          <input type="text" v-model="credentialSet.name">
        </div>
        <CustomFields :fields="configFields" :data="credentials" :credentials="{}"></CustomFields>
        <div v-for="(action, label) in configActions" class="config-action">
          <ActionButton
            class="button-small"
            :action="actionPerformer(action)" :value="label" />
        </div>
        <div class="button-row headroom">
          <input v-if="!isNew" type="button" class="button-small delete" @click="destroy" value="Delete">
          <div class="button-group">
            <ActionButton
              class="button-medium save"
              :action="save"
              value="Save"
              working-value="Saving..."></ActionButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .credential-editor {

    .service-row {

      display: flex;
      flex-direction: row;
      justify-content: space-between;
      column-gap: 2em;

      p.service-section {
        flex-shrink: 0;
      }

      p.connection-section {
        text-align: right;

        input.connection-field {
          min-width: 18em;
        }
      }

    }

    input  {
      padding: 0.2em 0.5em;
      font-size: 1em;
      font-family: 'Lato';
      font-weight: 100;
      font-size: 1em;
    }

    .error {
      color: var(--error);
      text-align: center;
      font-weight: 400;
    }

    .button-row {
      .button-group {
        display: flex;
        justify-content: flex-end;
        flex-grow: 1;
      }
    }
  }
</style>
