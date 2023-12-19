<template>
  <div class="overlay">
    <div class="container">
      <span class="brand"><img /></span>
      <h1>Account Locked</h1>
      <h4>{{ locked_reason }}</h4>
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
export default {
  data() {
    return {
      locked_reason: window.lockedReason,
    };
  },
};
</script>
