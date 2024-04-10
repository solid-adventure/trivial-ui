import Session from "./Session";
export default class Permissions {
  constructor() {}

  async setUserPermits(userId) {
    this.userId = userId;
    this.permissions = await Session.apiCall(`/users/${userId}/permissions`);
  }

  can(ability, model, {appName: appName}) {
    if(this.permissions){
      if(model === 'App'){
        let abilities = ['destroy', 'update', 'grant', 'transfer']
        if (abilities.includes(ability)){
          try {
            let appNames = this.permissions[ability].app_names;
            return appNames.includes(appName)
          } catch (error) {
            console.error("Error:", error);
            return false;
          }
        } else {
          console.err(`Ability: ${ability} not found in App permissions`)
          return false
        }
      }
    }
    return false
  }
}
