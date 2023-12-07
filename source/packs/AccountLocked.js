import AccountLocked from "../components/AccountLocked.vue";
import {createApp} from 'vue/dist/vue.runtime.esm-bundler'

console.log(`[Account Locked] initializing`);

let index = createApp(AccountLocked);
index.component("account-locked", AccountLocked);


index.mount("#account_locked");