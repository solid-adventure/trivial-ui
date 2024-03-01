import { createRouter, createWebHistory } from "vue-router";
import AppsOverview from "../components/AppsOverview.vue";
import SignIn from "../components/SignIn.vue";
import SignOut from "../components/SignOut.vue";
import NewAppForm from "../components/NewAppForm.vue";
import ChangePassword from "../components/ChangePassword.vue";
import Panels from "../components/Panels.vue";
import AcceptInvitation from "../components/AcceptInvitation.vue";
import RecoverPassword from "../components/RecoverPassword.vue";
import ResetPassword from "../components/ResetPassword.vue";
import Register from "../components/Register.vue";
import Settings from "../components/Settings.vue";
import AccountLocked from "../components/AccountLocked.vue";
import InstanceSettings from "../components/InstanceSettings.vue";
import InstanceActivity from "../components/builderv2/InstanceActivity.vue";
import InstanceExport from "../components/InstanceExport.vue";
import Builder from "../components/builderv2/Builder.vue";
import OrganizationSettings from "../components/OrganizationSettings.vue";
import OrganizationInviteUser from "../components/OrganizationInviteUser.vue";
import WebhookDisplay from "../components/WebhookDisplay.vue";
import Actions from "../components/Actions.vue";
import FunctionWriter from "../components/FunctionWriter.vue";
import Session from "../models/Session.js";

const routes = [
  { path: "/", component: AppsOverview, name: "Home" },
  { path: "/:paneltype", component: AppsOverview, name: "PanelType" },
  {
    path: "/signin",
    component: SignIn,
    props: { hideSuperBar: true },
    name: "Sign In",
  },
  { path: "/signout", component: SignOut, name: "Sign Out" },
  {
    path: "/changepassword",
    component: ChangePassword,
    name: "Change Password",
  },
  {
    path: "/acceptinvitation",
    component: AcceptInvitation,
    name: "Accept Invitation",
  },
  {
    path: "/recoverpassword",
    component: RecoverPassword,
    name: "Recover Password",
  },
  { path: "/resetpassword", component: ResetPassword, name: "Reset Password" },
  { path: "/register", component: Register, name: "Register" },
  { path: "/settings", component: Settings, name: "Account Settings" },
  { path: "/apps/new", component: NewAppForm, name: "New App" },
  { path: "/account-locked", component: AccountLocked, name: "Account Locked" },
  { path: "/apps/:id", component: Panels, name: "Show App" },
  {
    path: "/apps/:id/settings2",
    component: InstanceSettings,
    name: "Settings",
  },
  { path: "/apps/:id/activity", component: InstanceActivity, name: "Activity" },
  // revisit Export crazy template
  // { path: '/apps/:id/export', component: InstanceExport },
  { path: "/apps/:id/builder2", component: Builder, name: "Builder" },
  // Route below seems to be a duplicate of /apps/:id which defaults to Panels component
  { path: "/apps/:id/panels", component: Panels, name: "Panels" },
  { path: "/apps/:id/builder2/*", component: Builder, name: "Actions" }, //change this path
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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  let valid = await Session.validate(to, from, next);
  console.log("to", to);
  console.log("from", from);
  console.log("valid", valid);
  // Valid session, redirect away from signin
  // if (to.path === '/signin' && valid) {
  //   next({
  //     path: "/",
  //     // params: { nextUrl: to.fullPath },
  //   });
  // }
  if (!valid) {
    next({
      path: "/signin"
    });
  }
  next();
});

export default router;
