import { createRouter, createWebHistory } from "vue-router";
import AppsOverview from "../components/AppsOverview.vue";
import SignIn from "../components/SignIn.vue";
import SignOut from "../components/SignOut.vue";
import NewAppForm from "../components/NewAppForm.vue";
import Panels from "../components/Panels.vue";
import AcceptInvitation from "../components/AcceptInvitation.vue";
import RecoverPassword from "../components/RecoverPassword.vue";
import ResetPassword from "../components/ResetPassword.vue";
import Register from "../components/Register.vue";
import Settings from "../components/Settings.vue";
import AccountLocked from "../components/AccountLocked.vue";
import InstanceSettings from "../components/InstanceSettings.vue";
import InstanceActivity from "../components/builderv2/InstanceActivity.vue";
import Builder from "../components/builderv2/Builder.vue";
import OrganizationSettings from "../components/OrganizationSettings.vue";
import OrganizationInviteUser from "../components/OrganizationInviteUser.vue";
import Actions from "../components/Actions.vue";
import FunctionWriter from "../components/FunctionWriter.vue";
import Session from "../models/Session.js";
import Unauthorized from "../components/Unauthorized.vue";
import store from "../store/index.js";

const routes = [
  { path: "/",
    component: AppsOverview,
    name: "Home"
  },
  { path: "/:paneltype",
    component: AppsOverview,
    name: "PanelType"
  },
  {
    path: "/signin",
    component: SignIn,
    props: { hideSuperBar: true },
    name: "Sign In",
  },
  { path: "/signout",
    component: SignOut, name: "Sign Out",
  },
  {
    path: "/acceptinvitation",
    component: AcceptInvitation,
    name: "Accept Invitation",
    meta: { requiresAuth: false }
  },
  {
    path: "/recoverpassword",
    component: RecoverPassword,
    name: "Recover Password",
    meta: { requiresAuth: false }
  },
  { path: "/resetpassword",
    component: ResetPassword,
    name: "Reset Password",
    meta: { requiresAuth: false }
  },
  { path: "/register",
    component: Register,
    name: "Register",
    meta: { requiresAuth: false }
  },
  { path: "/settings",
    component: Settings,
    name: "Account Settings"
  },
  { path: "/apps/new",
    component: NewAppForm,
    name: "New App"
  },
  { path: "/account-locked",
    component: AccountLocked,
    name: "Account Locked"
  },
  { path: "/apps/:id",
    component: Panels,
    name: "Show App"
  },
  {
    path: "/apps/:id/settings2",
    component: InstanceSettings,
    name: "Settings",
  },
  { path: "/apps/:id/activity",
    component: InstanceActivity,
    name: "Activity"
  },
  { path: "/apps/:id/builder2",
    component: Builder,
    name: "Builder"
  },
  { path: "/apps/:id/builder2/*",
    component: Builder,
    name: "Actions" }, //change this path
  {
    path: "/organizations",
    redirect: "/settings",
    name: "Organizations",
  },
  {
    path: "/organizations/:id/edit",
    component: OrganizationSettings,
    name: "Edit",
  },
  {
    path: "/organizations/:id/invitations/new",
    component: OrganizationInviteUser,
    name: "Invite User",
  },
  {
    path: "/organizations/:pathMatch(.*)*",
    redirect: "/settings",
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/"
  },
  {
    path: "/unauthorized",
    component: Unauthorized,
    name: "Unauthorized",
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const redirectToSignIn = (to, loggedIn) => {
  if (to.path === "/signin") { return false }
  if (to.meta.requiresAuth === false) { return false }
  return !loggedIn
}

const redirectToUnAuth = async (to) => {
    let permissions = await getPermissionState()
    console.log(permissions)
    const result = await permissions.can("update", "App", { appName: to.params.id });
    console.log("this is the result: ", result)
    return result
};

function getPermissionState(){
  return new Promise((resolve, reject) => {
    if (!store.state.Permissions) {
      const unwatch = store.watch(
        () => store.state.Permissions,
        (value) => {
          unwatch()
          resolve(value)
        }
      )
    } else {
      resolve(store.state.Permissions)
    }
  })
}

router.beforeEach(async (to, from) => {
  let loggedIn = await Session.validate();
  if (redirectToSignIn(to, loggedIn)) {
    return {
      path: "/signin"
    }
  }
  if (loggedIn && to.path === "/signin") {
    return {
      path: "/"
    }
  }
})

router.afterEach(async (to, from) => {
  if (to.name === "Settings") {
    let result = await redirectToUnAuth(to)
    if(!result){
      router.push({ name: 'Unauthorized' });
    }
  }
});

export default router;
