import Session from "./Session";
export default class Permissions {
  constructor() {}

  async setUserPermits(userId) {
    this.userId = userId;
    this.permissions = await Session.apiCall(`/users/${userId}/permissions`);
  }
  canEdit(appName) {
    if (!this.permissions) {
      return false;
    } else {
      try {
        let updateAppNames = this.permissions.update.app_names;
        if (updateAppNames.includes(appName)) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error("Error:", error);
        return false;
      }
    }
  }
}
