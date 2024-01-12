<template>
  <div id="app">
    <!-- Navbar, sidebar, or other common components can be placed here -->
    <header v-if="this.$store.state.isAuthenticated">
      <SuperBar />
      <Breadcrumb :breadcrumbs="breadcrumbs" />
    </header>

    <!-- Main content area where router views are rendered -->
    <main>
      <router-view class="clearSuperbar"
      ></router-view>
    </main>

    <!-- Common footer for the app -->
    <footer>
      <!-- Footer content -->
    </footer>
  </div>
</template>

<script>
import SuperBar from "../components/SuperBar.vue";
import router from "../router";
import store from "../store";
import Breadcrumb from "./Breadcrumb.vue";

export default {
  name: "App",
  components: {
    SuperBar,
    Breadcrumb,
  },
  data() {
    return {
      lastVars: null,
      breadcrumbs: [],
      loading: false,
    };
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
    async currentRouteName(newVal) {
      store.dispatch('setCurrentPath', {currentPath: newVal, route: this.$route})
      let vars = {};
      this.loading = true;
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
        await store.dispatch("init", vars);
        this.lastVars = vars;
      }

      var allBreaks = [];
      let url = newVal;
      if (url.indexOf("?") >= 0) {
        url = url.slice(0, url.indexOf("?"));
      }
      for (let i = 0; i < url.length; i++) {
        if (url[i] === "/") allBreaks.push(url.substring(0, i + 1));
      }
      if (allBreaks[allBreaks.length - 1] != url) {
        allBreaks.push(url);
      }

      let resolvedRoutes = allBreaks.map((x) =>
        this.$router.resolve({ path: x, params: this.$route.params })
      );

      this.breadcrumbs = resolvedRoutes
        .filter((x) => x.matched && (x.matched.length ?? 0) > 0)
        .map((x) => {
          let displayName = x.name;
          if (displayName == 'Apps' && store?.state?.app?.descriptive_name) {
            displayName = store.state.app.descriptive_name
          }
          return { display: displayName, link: x.href };
        });

        if (!this.breadcrumbs.length) {
          this.breadcrumbs = [{display: 'Home', link: '/'}]
        }
        this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>

 .clearSuperBar {
   margin-top: 80px;
 }

/* global styles go here */
</style>
