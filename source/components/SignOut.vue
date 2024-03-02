<script>

export default {
  async mounted() {
    try {
      await this.$store.state.Session.destroy();
      this.$store.dispatch('setIsAuthenticated', {isAuthenticated: false});
      this.$router.push("/signin");
    } catch(e) {
      console.error(e);
    }
  }
}
</script>
