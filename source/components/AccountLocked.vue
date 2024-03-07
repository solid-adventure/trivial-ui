<template>
  <div class="overlay">
    <div class="container">
      <span class="brand"><img /></span>
      <h1>Account Locked</h1>
      <h4>{{ currentUserMessage }}</h4>
      <a class="contactSupport" href="mailto:support@withtrivial.com"
        >Contact Support</a
      >
      <br />
      <a href="/signin">Sign In</a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../assets/stylesheets/includes/auth";
.contactSupport {
  margin: 20px 0;
  display: inline-block;
}
</style>

<script>
  import store from '../store'
export default {
  computed: {
    currentUserMessage() {
      return this.$store?.state?.user?.account_locked_reason;
    },
  },
};
</script>
