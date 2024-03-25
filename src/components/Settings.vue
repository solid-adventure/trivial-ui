<template>
  <div class="page-container">

    <div class="page-inset">

      <h2>Account Settings</h2>

      <RouterLink to="/signout">Sign out</RouterLink><br>
      <div class="section">
        <OrganizationsManager></OrganizationsManager>
      </div>
      
      <div v-if = "isCredentialsEnabled" class="section">
        <CredentialsVault></CredentialsVault>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

  .section {
    margin-top: 4em;      
  }

  .section:last-child {
    margin-bottom: 4em;
  }


</style>

<script>
  import CredentialsVault from './builderv2/CredentialsVault.vue'
  import OrganizationsManager from './builderv2/OrganizationsManager.vue'
  import store from '../store'

  export default {
    components: {
      CredentialsVault,
      OrganizationsManager
    },
    computed: {
      isCredentialsEnabled() {
        return this.$store?.state?.enableSaveCredentials;
      },
    },
  }
</script>
