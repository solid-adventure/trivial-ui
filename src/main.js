import { createApp } from 'vue'
import "primeicons/primeicons.css"
import 'primeflex/primeflex.scss'
import 'floating-vue/dist/style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Button from "primevue/button"
import Dropdown from 'primevue/dropdown'
import Image from 'primevue/image'
import Calendar from 'primevue/calendar'
import OverlayPanel from 'primevue/overlaypanel'
import Menu from 'primevue/menu'
import Avatar from 'primevue/avatar'
import ToggleButton from 'primevue/togglebutton'
import Breadcrumb from 'primevue/breadcrumb'
import Ripple from 'primevue/ripple'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import Card from 'primevue/card'
import RadioButton from 'primevue/radiobutton'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Panel from 'primevue/panel'
import Checkbox from 'primevue/checkbox'
import router from './router'
import store from './store'
import FloatingVue from 'floating-vue'


const app = createApp(App)
app.use(router)
app.use(store)
app.use(PrimeVue)
app.use(FloatingVue)
app.use(ToastService)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('IconField', IconField)
app.component('InputIcon', InputIcon)
app.component('InputText', InputText)
app.component('Dropdown', Dropdown)
app.component('Image', Image)
app.component('Button', Button)
app.component('Calendar', Calendar)
app.component('OverlayPanel', OverlayPanel)
app.component('Menu', Menu)
app.component('Avatar', Avatar)
app.component('ToggleButton', ToggleButton)
app.component('Breadcrumb', Breadcrumb)
app.component('Toast', Toast)
app.component('Dialog', Dialog)
app.component('Message', Message)
app.component('Card', Card)
app.component('RadioButton', RadioButton)
app.component('TabView', TabView)
app.component('TabPanel', TabPanel)
app.component('Panel', Panel)
app.component('Checkbox', Checkbox)
app.directive('ripple', Ripple)

app.mount('#app')
