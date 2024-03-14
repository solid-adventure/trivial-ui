const CredentialTypeBase = require('../../base/CredentialTypeBase')

export default class ServiceExampleCredentials extends CredentialTypeBase {
    getConfigFields() {
        return {
          api_key:{type: String, required: true, secret: true},
          another_field:{type: String, required: true},
        }
    }
}
