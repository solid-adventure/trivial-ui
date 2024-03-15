const CredentialTypeBase = require('../../base/CredentialTypeBase')

class ServiceExampleCredentials extends CredentialTypeBase {
    getConfigFields() {
        return {
          api_key:{type: String, required: true, secret: true},
          another_field:{type: String, required: true},
        }
    }
}
module.exports = ServiceExampleCredentials