<template>
  <main class="wrapper">
    <template v-if="this.$store.state.isAuthenticated">
      <TheHeader :title="currentHeaderTitle" :breadcrumbs="breadcrumbs" />
      <TheMenu />
    </template>

    <div class="wrapper__content">
      <Toast />
      <Suspense>
        <template #default>
          <router-view :key="$route.fullPath"></router-view>
        </template>
        <template #fallback>
          Loading
        </template>
      </Suspense>
    </div>
  </main>
</template>

<script>
import router from "./router";
import store from "./store";
import TheMenu from "@/components/aside/TheMenu.vue";
import TheHeader from "@/components/header/TheHeader.vue";

export default {
  name: "App",
  components: {
    TheMenu,
    TheHeader
  },
  data() {
    return {
      lastVars: null,
      breadcrumbs: []
    };
  },
  computed: {
    currentRouteName() {
      return this.$route.fullPath;
    },

    currentHeaderTitle() {
      return this.$route.params.paneltype || this.$route.name;
    },

    pageTitle() {
      const baseTitle = 'Trivial'

      let panelTypeOverride = null
      if (this.$route.name === 'PanelType') {
        panelTypeOverride = this.$route.params.paneltype
        // So gross, but this whole concept is on its way out
        panelTypeOverride = panelTypeOverride.charAt(0).toUpperCase() + panelTypeOverride.slice(1) + 's';
      }
      const routeTitle = panelTypeOverride ? panelTypeOverride : this.$route.name || ''
      const dynamicData = store.state.app?.descriptive_name || ''

      return `${routeTitle} ${dynamicData ? `- ${dynamicData}` : ''} | ${baseTitle}`.trim()
    }

  },
  provide() {
    return { ...(this.lastVars ?? {}) };
  },
  watch: {

    pageTitle: {
      immediate: true,
      handler(newVal) {
        document.title = newVal
      }
    },

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
      // trying to standardize the init based on path can use this for new paths, fields, or anything going forward
      if (
        vars.appId !== this.lastVars?.appId ||
        vars.orgId !== this.lastVars?.orgId ||
        vars.orgs !== this.lastVars?.orgs ||
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
          if (displayName == "Invoice") {
            displayName = `Invoice #${this.$route?.params?.id}`;
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
            if (displayName == 'Contracts') {
              linkPath = '/contracts'
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