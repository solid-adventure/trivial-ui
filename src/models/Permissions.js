import Session from "./Session";
export default class Permissions {
  constructor() {}

  async loadPermissions(userId) {
    this.userId = userId;
    this.permissions = await Session.apiCall(`/users/${userId}/permissions`);
  }

  can(ability, model, args) {
    const validateAppAbility = (ability, { appName: appName }) => {
      try {
        let abilities = ["destroy", "update", "grant", "transfer"];
        if (abilities.includes(ability)) {
          let appNames = this.permissions[ability]?.app_names;
          return appNames.includes(appName);
        } else {
          throw new Error(`Ability: ${ability} not found in App permissions`);
          return false;
        }
      } catch (error) {
        console.error("Error:", error);
        return false;
      }
    };

    const validateOrgAbility = (
      ability,
      { memberRole: memberRole, userRole: userRole, lastAdmin: isLastAdmin }
    ) => {
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
    };

    if (this.permissions) {
      if (model === "App") {
        return validateAppAbility(ability, args);
      } else if (model === "Org") {
        return validateOrgAbility(ability, args);
      } else {
        console.error(`Model: ${model} not found`);
        return false;
      }
    }
    return false;
  }
}
