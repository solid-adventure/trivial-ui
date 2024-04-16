export default class Permissions {

  // Creating a Permissions instance:
  // const permissions = new Permissions()

  // Method: load()
  // Description:
  // Load the user's permissions list by making an API call. The user's ID is required for the first call,
  // and reused for subsequent calls unless a new one is specified.
  // Returns: A promise that resolves with the user's permissions list.
  // Example usage: permissions.load(userId) or permissions.load()

  // Method: can()
  // Description:
  // Validate app actions by checking ability, model, and args. Returns a boolean to verify that the user
  // can perform the specified action. Args required are specified in validateOrgAbility() and validateAppAbility().
  // Returns: A boolean indicating whether the user can perform the specified action.
  // Example usage:
  // - permissions.can('update', 'App', {appName: appName})
  // - permissions.can('removeUser', 'Org', {memberRole: memberRole, userRole: userRole, lastAdmin: lasAdmin})

  // Note:
  // validateAppAbility() and validateOrgAbility() are called in can(). It's recommended to use can() to ensure
  // that you are committing an ability towards an available/appropriate model

  constructor(Session, user) {
    this.Session = Session
    this._userId = user.id
    if (!this._userId || !this.Session) {
      throw new Error("User and Session is required.");
    }
  }

  load() {
    this._permissions = this._permissions || this.Session.apiCall(
      `/users/${this._userId}/permissions`
    );
    return this._permissions
  }

  reload(){
    this._permissions = this.Session.apiCall(
        `/users/${this._userId}/permissions`
      );
  }

  can(ability, model, args) {
    return this.load().then((permissions) => {
      return this.validate(permissions, ability, model, args)
    })
    .catch((error) => {
      return false
      console.error(error)
    })
  }

  validate(permissions, ability, model, args){
    if (!permissions) {
      console.error("Permissions have not been initialized.");
      return false;
    }
    if (model === "App") {
      return this.validateAppAbility(permissions, ability, args);
    } else if (model === "Org") {
      return this.validateOrgAbility(ability, args);
    } else {
      console.error(`Model: ${model} not found`);
      return false;
    }
  }

  validateAppAbility(permissions, ability, { appName: appName}) {
    try {
      let abilities = ['destroy', 'update', 'grant', 'transfer'];
      if (abilities.includes(ability)) {
        let appNames = permissions[ability]?.app_names;
        let response = appNames.includes(appName);
        return response
      } else {
        console.error(`Ability: ${ability} not found in App permissions`);
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  validateOrgAbility(
    ability,
    { memberRole: memberRole, userRole: userRole, lastAdmin: lastAdmin }
  ) {
    try {
      if (ability === "removeMember") {
        if (userRole === "admin") {
          return memberRole !== "admin" || !lastAdmin;
        }
        return false;
      } else {
        console.error(`Ability: ${ability} not found in Org permissions`);
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
