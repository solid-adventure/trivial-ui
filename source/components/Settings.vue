<template>
  <!-- <super-bar></super-bar> -->
  <div class="page-container">


    <!-- TODO make this a component and pass the items as props -->
    <!-- Once it's a component, spruce up the styling -->
    <div class="breadcrumb">
      <span class="history">Accounts</span>
      <span class="spacer">></span>

      <span class="history">{{ this.$store.state.user.name }}</span>
      <span class="spacer">></span>

      <span class="active"><strong>Account Settings</strong></span>
    </div>

    <div class="page-inset">

      <h2>Account Settings</h2>

      <a href="/changepassword">Change password</a><br />
      <a href="/signout">Sign out</a><br>
      <div class="section">
        <OrganizationsManager></OrganizationsManager>
      </div>
      <div class="section">
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

  export default {
    components: {
      CredentialsVault,
      OrganizationsManager
    },
  }
</script>
