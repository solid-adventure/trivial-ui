import { createApp } from 'vue';
import Main from '../components/Main.vue';
import router from '../router';
import store from '../store';

const app = createApp(Main);
app.use(router);
app.use(store);
app.mount('#app');
