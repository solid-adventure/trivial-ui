import AccountLocked from "../components/AccountLocked.vue";
import Vue from "vue/dist/vue.esm";

console.log(`[Account Locked] initializing`);

let signIn = new Vue({
  el: "#account_locked",
  components: {
    "account-locked": AccountLocked,
  },
});
