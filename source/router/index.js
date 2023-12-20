import { createRouter, createWebHistory } from 'vue-router';
import AppsOverview from '../components/AppsOverview.vue'
import SignIn from '../components/SignIn.vue'
import SignOut from '../components/SignOut.vue'
import NewAppForm from '../components/NewAppForm.vue'
import ChangePassword from '../components/ChangePassword.vue'
import Panels from '../components/Panels.vue'
import AcceptInvitation from '../components/AcceptInvitation.vue'
import RecoverPassword from '../components/RecoverPassword.vue'
import ResetPassword from '../components/ResetPassword.vue'
import Register from '../components/Register.vue'
import Settings from "../components/Settings.vue";
import AccountLocked from "../components/AccountLocked.vue";
import InstanceSettings from "../components/InstanceSettings.vue";
import InstanceActivity from '../components/builderv2/InstanceActivity.vue'
import InstanceExport from '../components/InstanceExport.vue'
import Builder from '../components/builderv2/Builder.vue'
import OrganizationSettings from '../components/OrganizationSettings.vue'
import OrganizationInviteUser from '../components/OrganizationInviteUser.vue'
import WebhookDisplay from '../components/WebhookDisplay.vue'
import Actions from '../components/Actions.vue'
import FunctionWriter from '../components/FunctionWriter.vue'


const routes = [
    { path: '/', component: AppsOverview }, 
    { path: '/signin', component: SignIn, props: {hideSuperBar: true} },
    { path: '/signout', component: SignOut },
    { path: '/changepassword', component: ChangePassword },
    { path: '/acceptinvitation', component: AcceptInvitation },
    { path: '/recoverpassword', component: RecoverPassword },
    { path: '/resetpassword', component: ResetPassword },
    { path: '/register', component: Register },
    { path: '/settings', component: Settings },
    // { path: '/playground', component: Playground },
    { path: '/apps/new', component: NewAppForm },
    { path: '/account-locked', component: AccountLocked },
    { path: '/apps/:id', component: Panels },
    
    // Below path not used and has crazy templating in there
    // { path: '/apps/:id/action/:perform/:actionIdentifier', component: AppAction }, 
    { path: '/apps/:id/settings2', component: InstanceSettings }, 
    { path: '/apps/:id/activity', component: InstanceActivity }, 
    // revisit Export crazy template
    // { path: '/apps/:id/export', component: InstanceExport }, 
    { path: '/apps/:id/builder2', component: Builder }, 
    // Route below seems to be a duplicate of /apps/:id which defaults to Panels component
    { path: '/apps/:id/panels', component: Panels }, 
    { path: '/apps/:id/builder2/*', component: Builder }, 
    { path: '/organizations/:id/edit', component: OrganizationSettings }, 
    { path: '/organizations/:id/invitations/new', component: OrganizationInviteUser }, 
    // Another one where we might need to render the appManager above
    // the actual webhook display component
    // Open to discussing if we should just add the app-manager to the
    // componment, create a new component or render a custom component
    // { path: '/webhooks/:id', component: WebhookDisplay },
    
    //Dead component, API post is commented out?
    { path: '/actions', component: Actions },
    { path: '/javascript-function-writer', component: FunctionWriter },  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;