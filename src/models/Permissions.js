import Session from './Session'
export default class Permissions {

    constructor(){}

    static async setUserPermits(user_id){
        let userPermissions = await Session.apiCall(`/users/${user_id}/permissions`)
        return userPermissions
    }

}