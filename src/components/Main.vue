<template>
  <div id="app" v-if="!loading">
    <!-- Navbar, sidebar, or other common components can be placed here -->
    <header v-if="this.$store.state.isAuthenticated">
      <SuperBar />
      <Breadcrumb :breadcrumbs="breadcrumbs" />
    </header>

    <!-- Main content area where router views are rendered -->
    <main>
      <router-view :key="$route.fullPath" class="clearSuperbar"></router-view>
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
      loading: true,
    };
  },
  created() {
    if (store.state.theme === "Dark") {
      import('/src/assets/stylesheets/app.scss');
    } else {
      import('/src/assets/stylesheets/app-light.scss');
    }
    // Don't love this, but it's a quick fix for now and prevents FOUC
    window.setTimeout(() => {
      this.loading = false;
    }, 300);
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
      store.dispatch("setCurrentPath", {
        currentPath: newVal,
        route: this.$route,
      });
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
      
      if(this.$route.path.indexOf("/settings") == 0){
        vars.orgs = true
      }
      if(this.$route.path.indexOf("/unauthorized") == 0){
        vars.unauthorized = true
      }
      // trying to standardize the init based on path can use this for new paths, fields, or anything going forward
      if (
        vars.appId !== this.lastVars?.appId ||
        vars.orgId !== this.lastVars?.orgId ||
        vars.orgs !== this.lastVars?.orgs ||
        vars.unauthorized !== this.lastVars?.unauthorized ||
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
        this.$router.resolve({ path: x })
      );

      this.breadcrumbs = resolvedRoutes
        .filter((x) => (x.matched && (x.matched.length ?? 0) > 0) && x.name)
        .map((x) => {
          let displayName = x.name;
          let linkPath = x.href;
          if (displayName == "Show App" && store?.state?.app?.descriptive_name) {
            displayName = store.state.app.descriptive_name;
          }
          if (
            displayName == "PanelType" &&
            (this.$route?.params?.paneltype ||
              store?.state?.app?.panels?.component || this.$route?.query?.paneltype)
          ) {
            displayName =
              this.$route?.params?.paneltype ??
              store?.state?.app?.panels?.component ?? this.$route?.query?.paneltype;
            let linkName = displayName.toLowerCase()
            displayName = `${displayName
              .charAt(0)
              .toUpperCase()}${displayName.slice(1)}`;
            // Order is important here because we want to generate the link before we make the displayName plural
            linkPath = `/${linkName}`;
            if (displayName != "All") {
              displayName = `${displayName}s`;
            }
          }
          return { display: displayName, link: linkPath };
        });
      if (!this.breadcrumbs.length) {
        this.breadcrumbs = [{ display: "Home", link: "/" }];
      }
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
