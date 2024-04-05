import Session from './Session'
export default class Permissions {
    constructor() {
        const userPermissions = await Session.apiCall(`/users/${state.user.id}/permissions`)
    }
    static setPermissions(permissions){
        this.update = permissions.update
    }
}