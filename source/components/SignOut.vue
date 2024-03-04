<template></template>

<script>

export default {
  async mounted() {
    try {
      await this.$store.state.Session.destroy();
      // TODO: This is a hacky way to get the page to refresh and update the theme
      //       to solve for login not respecting the dark theme, but using the dark logo
      window.location.reload();
      // this.$router.push("/signin"); // ideal, once the above is fixed
    } catch(e) {
      console.error(e);
    }
  }
}
</script>
