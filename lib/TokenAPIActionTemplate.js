const fs = require('fs').promises
const path = require('path')

class TokenAPIActionTemplate {
	constructor(service, action) {
		this.service = service
		this.action = action
	}

	async write() {
    console.log(`TokenAPIActionTemplate`)
  	let out = {}
		let service_path = `${this.service}`
		let action_path = `${this.service}/${this.action}/`
		// let dest = '../tmp' // Convenience to view output without triggering server rebuild
		let dest = '../source/lib/actionsv2/actions'
		let base = path.resolve(__dirname, dest)
		await fs.mkdir(`${base}/${action_path}`, {recursive: true})
    await this.writeFileIfNotExists(`${base}/${service_path}/CredentialType.js`, this._CredentialType)
    await this.writeFileIfNotExists(`${base}/${service_path}/Schemas.js`, this._Schemas)
    await this.writeFileIfNotExists(`${base}/${action_path}/Action.js`, this._Action)
    await this.writeFileIfNotExists(`${base}/${action_path}/Descriptor.js`, this._Descriptor)
  	return {success: `Successfully created action`}
  }

  async writeFileIfNotExists(path, content) {
    await fs.readFile(path)
    .catch( async () => {
      await fs.writeFile(path, content, { flag: 'wx' })
    })
 }

  get _Descriptor() {
	  	const action = this.action
	  	const service = this.service
return `const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class ${action}Descriptor extends ActionDescriptorBase {

  get fullDescriptionHTML() {
    let h = \`
    
    <h2>Overview</h2>
    <p>This action allows you to do something new.</p>
    <h2>Requirements</h2>
    <ol>
      <li>Something special, like an account for the service</li>
    </ol>
    \`;
    return h;
  }

  get iconUrl() {
    return '/assets/images/action-icons/trivial.svg'
  }

  getCredentialTypes(){
    return {
      ${service}: {type: '${service}Credentials', required: true}
    }
  }

  get expectedTypeName() {
    return '${service}Record'
  }

  // Actions do not have access to these fields in perform() { this.inputValues }
  // If you need to access fields directly in the action, use expectedTypeName and set a Schema
  // getDefinitionFields() {
  //   return {
  //     example: {type: String, required: true, default: "[1,2,3]"},
  //     expression: {type: String, required: true, default: "item"}
  //   }
  // }

  // Uncomment to perform custom behavior when this action is added to the builder
  // async afterAdd({app, definition, credentials}) {
  //   return true
  // }

}
module.exports = ${action}Descriptor

`	  	
	  }

	  get _Action() {
	  	const action = this.action
	  	const service = this.service
return `const ActionBase = require('../../../base/ActionBase')

class ${action} extends ActionBase {
  async perform() {

    // let api_key = this.config.${service}.api_key
    const res = await this.fetch( this.url,
      {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(this.inputValue)
      }
    )

    this.setHTTPResponseOutput(res, await res.json())

    return true
  }

  get url() {
    return 'https://www.new-service-api.com'
  }

  static get redactPaths() {
    return ['*.headers["x-access-token"]'];
  }

}

module.exports = ${action}
`	  	
	  }

	  get _Schemas() {
	  	const service = this.service

return `const {
    schema,
  } = require('../../../Trivial/schema-utils')

  module.exports.${service}Record = schema({fields: {
    id: {type: String, required: true, example:"\`prefilled id value\`", placeholder:"shadow text when empty", help:"Tooltip on what to enter here."},
    search: {type: String, required: false, example:"\`prefilled search value\`", placeholder:"shadow text when empty", help:"Tooltip on what to enter here."},
    }})    
`	  	
	  }

	  get _CredentialType() {
	  	const service = this.service
return `const CredentialTypeBase = require('../../base/CredentialTypeBase')

class ${service}Credentials extends CredentialTypeBase {

    // Fields listed here will be manged by the Credentials Vault
    getConfigFields() {
        return {
          api_key:{type: String, required: true, secret: true},
          another_field:{type: String, required: true},
        }
    }
}
module.exports = ${service}Credentials

`
	  }


}

module.exports = TokenAPIActionTemplate