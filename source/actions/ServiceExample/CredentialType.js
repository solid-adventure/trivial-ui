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

// Fields listed here will be manged by the Credentials Vault


// A reference to this file must be added to source/lib/actionsv2/catalog/CredentialTypes, eg:

// ServiceExampleCredentials: require('../actions/ServiceExample/CredentialType'),
