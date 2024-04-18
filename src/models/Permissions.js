export default class Permissions {
// Creating a Permissions instance:
// const permissions = new Permissions()

// Method: can()
// Description:
// Validates whether the user can perform specific actions on apps or organizations.
// It loads permissions if they are not set and checks the provided ability, model, and args.
// Args required are specified in validateOrgAbility() and validateAppAbility().
// Returns:
// A boolean indicating whether the user can perform the specified action.
// Example usage:
// - permissions.can('update', 'App', {appName: appName})
// - permissions.can('removeUser', 'Org', {memberRole: memberRole, userRole: userRole, lastAdmin: lastAdmin})

// Note on validateAppAbility() and validateOrgAbility():
// These methods are called in validate(), which is then invoked in can().
// It's recommended to use can() to ensure the ability is assigned to an available/appropriate model.

// Note on removeMember ability: 
// In the current implementation, an admin cannot remove themselves from the organization
// if they are the last admin in the group.

  constructor(Session, user) {
    this.Session = Session;
    this._userId = user?.id;
    if (!this._userId || !this.Session) {
      throw new Error("User and Session is required.");
    }
  }

  load() {
    this._permissions =
      this._permissions ||
      this.Session.apiCall(`/users/${this._userId}/permissions`);
    return this._permissions;
  }

  reset() {
    this._permissions = null;
  }

  can(ability, model, args) {
    return this.load()
      .then((permissions) => {
        return this.validate(permissions, ability, model, args);
      })
      .catch((error) => {
        console.error(error);
        return false;
      });
  }

  validate(permissions, ability, model, args) {
    if (model === "App") {
      return this.validateAppAbility(permissions, ability, args);
    } else if (model === "Org") {
      return this.validateOrgAbility(ability, args);
    } else {
      throw new Error(`Model: ${model} not found`);
    }
  }

  validateAppAbility(permissions, ability, { appName: appName }) {
    let abilities = ["destroy", "update", "grant", "transfer"];
    if (abilities.includes(ability)) {
      if (!appName) {
        throw new Error("appName is required in args");
      } else {
        let appNames = permissions[ability]?.app_names;
        let response = appNames.includes(appName);
        return response;
      }
    } else {
      throw new Error(`Ability: ${ability} not found in App permissions`);
    }
  }

  validateOrgAbility(
    ability,
    { memberRole: memberRole, userRole: userRole, lastAdmin: lastAdmin }
  ) {
    if (ability === "removeMember") {
      if (!memberRole || !userRole || lastAdmin === undefined) {
        throw new Error(
          "memberRole, userRole, and lastAdmin are required in args"
        );
      } else {
        if (userRole === "admin") {
          if (memberRole === "member") {
            return true;
          } else {
            return memberRole === "admin" && !lastAdmin;
          }
        }
        return false;
      }
    } else {
      throw new Error(`Ability: ${ability} not found in Org permissions`);
    }
  }
}
