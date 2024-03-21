export default class Permissions {
    constructor() {}
    static setPermissions(permissions){
        this.update = permissions.update
    }
}