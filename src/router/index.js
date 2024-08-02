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
import OrganizationSettings from "../components/OrganizationSettings.vue"; //THIS IS DEPRICATED FILE
import OrganizationInviteUser from "../components/OrganizationInviteUser.vue";
import Actions from "../components/Actions.vue";
import FunctionWriter from "../components/FunctionWriter.vue";
import SalesView from "@/views/SalesView.vue";
import DashboardView from "@/views/DashboardView.vue";
import OrganizationSettingsView from "@/views/OrganizationsSettingsView.vue";
import Session from "../models/Session.js";

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
    path: "/organizations/:id/edit", //THIS IS DEPRICATED ROUTE
    component: OrganizationSettings,
    name: "Edit",
  },
  {
    path: "/organizations/:id/invitations/new",
    component: OrganizationInviteUser,
    name: "Invite User",
  },
  {
    path: "/dashboard3",
    component: DashboardView,
    name: "Analytics and Real-Time Data",
  },
  {
    path: "/organization-settings/:id",
    component: OrganizationSettingsView,
    name: "Organization Settings",
  },
  {
    path: "/sales",
    component: SalesView,
    name: "Sales",
  },
  {
    path: "/organization-settings",
    redirect: "/dashboard3",
  },
  {
    path: "/organizations/:pathMatch(.*)*",
    redirect: "/settings",
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/"
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

export default router;
