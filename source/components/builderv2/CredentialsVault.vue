<script>
  import { mapState, mapActions, mapMutations } from 'vuex'
  import CredentialSetEditor from './CredentialSetEditor.vue'
  import CredentialTypes from 'trivial-core/lib/actionsv2/catalog/CredentialTypes'

  export default {
    components: {
      CredentialSetEditor
    },

    async created() {
      await this.loadCredentialSets()

      if (this.currentCredentialSet) {
        this.edit({id: this.currentCredentialSet})
        this.setCurrentCredentialSet(null)
      }
    },

    data() {
      return {
        editing: false,
        editId: null
      }
    },

    computed: {
      ...mapState([
        'credentialSets',
        'currentCredentialSet',
        'user'
      ])
    },

    methods: {
      addNew() {
        this.editId = null
        this.editing = true
      },

      closeEditor() {
        this.editing = false
      },

      serviceName(credentialSet) {
        try {
          return CredentialTypes.forType(credentialSet.credential_type).serviceName
        } catch(e) {
          return `Not found: ${credentialSet.credential_type}`
        }
      },

      edit(credentialSet) {
        this.editId = credentialSet.id
        this.editing = true
      },

      ...mapMutations([
        'setCurrentCredentialSet'
      ]),
      ...mapActions([
        'loadCredentialSets'
      ])
    }
  }
</script>

<template>
  <div class="vault-body">
    <h2>Credentials Vault</h2>
    <p>The credentials vault is a place to store and manage the secret credentials for your services.</p>
    <p>
      <button class="button-medium" @click="addNew">Add New Credentials</button>
    </p>
    <table class="credential-sets">
      <thead>
        <tr>
          <th class="name">Name</th>
          <th class="credential-type">Service</th>
          <th class="owner">Owner</th>
          <th class="actions">&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="credentialSet in credentialSets" :key="credentialSet.id">
          <td>{{credentialSet.name}}</td>
          <td>{{serviceName(credentialSet)}}</td>
          <td>{{user.name}}</td>
          <td class="actions"><button class="button-small" @click="edit(credentialSet)">Edit</button></td>
        </tr>
      </tbody>
    </table>
    <CredentialSetEditor
      v-if="editing"
      :value="editId"
      @close="closeEditor"></CredentialSetEditor>
  </div>
</template>

<style lang="scss" scoped>
  .vault-body {

    .credential-sets {
      width: 100%;
      border-collapse: collapse;
      font-weight: inherit;

      thead th {
        margin: 0;
        padding: 0.25rem 0.5rem;
        font-size: 1.25em;
        font-weight: bold;
        border-bottom: 1px solid var(--on-background);
        text-align: left;

        &.name { width: 40%; }
        &.credential-type { width: 20%; }
        &.owner { width: 20%; }
        &.actions { width: 20%; }
      }

      tbody {
        tr:nth-child(even) {
          background-color: var(--on-background-20);
        }

        tr:hover {
          background-color: var(--primary);

          td {
            color: var(--on-primary);

            &.actions button {
              visibility: visible;
            }
          }
        }

        td {
          margin: 0;
          padding: 0.25em 0.5em;

          &.actions button {
            text-transform: none;
            background-color: transparent;
            color: inherit;
            border: 1px solid var(--on-primary);
            visibility: hidden;
          }
        }
      }
    }
  }
</style>
