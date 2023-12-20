<template>
  <div id="app">
    <!-- Navbar, sidebar, or other common components can be placed here -->
    <header>
      <SuperBar />
    </header>

    <!-- Main content area where router views are rendered -->
    <main>
      <router-view></router-view>
    </main>

    <!-- Common footer for the app -->
    <footer>
      <!-- Footer content -->
    </footer>
  </div>
</template>

<script>
import SuperBar from "../components/SuperBar.vue";
import store from "../store";

export default {
  name: "App",
  components: {
    SuperBar,
  },
  data() {
    return { lastVars: null };
  },
  computed: {
    currentRouteName() {
      return this.$route.fullPath;
    },
  },
  provide() {
    return { ...(this.lastVars ?? {}) };
  },
  watch: {
    currentRouteName(newVal) {
      let vars = {};
      if (this.$route.path.indexOf("/apps") == 0 && this?.$route?.params?.id) {
        vars.appId = this.$route.params.id;
      }

      if (
        this.$route.path.indexOf("/organizations") == 0 &&
        this?.$route?.params?.id
      ) {
        vars.orgId = this.$route.params.id;
      }

      // trying to standardize the init based on path can use this for new paths, fields, or anything going forward
      if (
        vars.appId !== this.lastVars?.appId ||
        vars.orgId !== this.lastVars?.orgId ||
        !this.lastVars
      ) {
        store.dispatch("init", vars);
        this.lastVars = vars;
      }
    },
  },
};
</script>

<style>
/* global styles go here */
</style>
