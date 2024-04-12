import Session from "./Session";
export default class Permissions {
  constructor() {}

  async load(userId) {
    try {
      this._userId = userId || this._userId;
      if (!this._userId) {
        throw new Error("User ID is required.");
      }
      this._permissions = await Session.apiCall(`/users/${this._userId}/permissions`);
    } catch (error) {
      console.error("Error loading permissions:", error.message);
    }
  }

  can(ability, model, args) {
    return this.validate(this._permissions, ability, model, args)
  }

  validate(permissions, ability, model, args) {
    if (!permissions) {
      console.error("Permissions have not been initialized.")
      return false
    }
    if (model === "App") {
      return this.validateAppAbility(permissions, ability, args);
    } else if (model === "Org") {
      return this.validateOrgAbility(permissions, ability, args);
    } else {
      console.error(`Model: ${model} not found`);
      return false;
    }
  }

  validateAppAbility(permissions, ability, { appName: appName }) {
    try {
      let abilities = ["destroy", "update", "grant", "transfer"];
      if (abilities.includes(ability)) {
        let appNames = this._permissions[ability]?.app_names;
        return appNames.includes(appName);
      } else {
        throw new Error(`Ability - ${ability} not found in App permissions`);
        return false;
      }
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  }

  validateOrgAbility(
    permissions,
    ability,
    { memberRole: memberRole, userRole: userRole, lastAdmin: isLastAdmin }
  ) {
    try {
      if (ability === "removeMember") {
        if (userRole === "admin") {
          return memberRole !== "admin" || !lastAdmin;
        }
        return false;
      } else {
        throw new Error(`Ability - ${ability} not found in Org permissions`);
        return false;
      }
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  }
}
