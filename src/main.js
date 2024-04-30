import { createApp } from 'vue'
import "primevue/resources/themes/aura-light-green/theme.css"
import "primeicons/primeicons.css"
import 'primeflex/primeflex.scss'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Button from "primevue/button"
import Dropdown from 'primevue/dropdown';
import Image from 'primevue/image';
import router from './router'
import store from './store'

const app = createApp(App)
app.use(router)
app.use(store)
app.use(PrimeVue)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('IconField', IconField)
app.component('InputIcon', InputIcon)
app.component('InputText', InputText)
app.component('Dropdown', Dropdown)
app.component('Image', Image)
app.component('Button', Button)
app.mount('#app')
