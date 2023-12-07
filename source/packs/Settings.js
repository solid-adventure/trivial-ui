import SuperBar from "../components/SuperBar.vue";
import Settings from "../components/Settings.vue";
import store from "../store";
import { createApp } from "vue/dist/vue.runtime.esm-bundler";

console.log("[Settings] initializing");
store.dispatch("init", {});

let index = createApp(Settings);
index.component("super-bar", SuperBar);
index.component("settings", Settings);
index.use(store);

index.mount("#settings");
