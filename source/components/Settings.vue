<template>
  <div class="SettingsContainer">
    <h2>Account Settings</h2>
    <br/>
    <a href="/changepassword">Change password</a><br />
    <a href="/signout">Sign out</a><br>
    <div class="section">
      <OrganizationsManager></OrganizationsManager>
    </div>
    <div class="section">
      <CredentialsVault></CredentialsVault>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .SettingsContainer {
    padding: calc(80px + 3.625em + 1px + 1em) 4em 4em 4em;
  }

  .section {
    margin-top: 4em;      
  }
</style>

<script>
  import CredentialsVault from './builderv2/CredentialsVault.vue'
  import OrganizationsManager from './builderv2/OrganizationsManager.vue'

  export default {
    components: {
      CredentialsVault,
      OrganizationsManager
    },
  }
</script>
