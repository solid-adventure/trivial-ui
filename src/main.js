import { createApp } from 'vue'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.scss'
import 'floating-vue/dist/style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
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
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Tag from 'primevue/tag'
import Row from 'primevue/row'
import Sidebar from 'primevue/sidebar'
import Timeline from 'primevue/timeline'
import Divider from 'primevue/divider'
import Chart from 'primevue/chart'
import ProgressSpinner from 'primevue/progressspinner'
import ProgressBar from 'primevue/progressbar'
import Skeleton from 'primevue/skeleton'
import DataView from 'primevue/dataview'
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
app.component('ColumnGroup', ColumnGroup)
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
app.component('Accordion', Accordion)
app.component('AccordionTab', AccordionTab)
app.component('Tag', Tag)
app.component('Row', Row)
app.component('Sidebar', Sidebar)
app.component('Timeline', Timeline)
app.component('Divider', Divider)
app.component('Chart', Chart)
app.component('ProgressSpinner', ProgressSpinner)
app.component('ProgressBar', ProgressBar)
app.component('Skeleton', Skeleton)
app.component('DataView', DataView)
app.directive('ripple', Ripple)

app.mount('#app')
