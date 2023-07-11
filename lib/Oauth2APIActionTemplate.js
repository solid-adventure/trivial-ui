const fs = require('fs').promises
const path = require('path')

class Oauth2APIActionTemplate {
	constructor(service, action) {
		this.service = service
		this.action = action
	}

	async write() {
		console.log(`Oauth2APIActionTemplate`)
  	let out = {}
		let service_path = `${this.service}`
		let action_path = `${this.service}/${this.action}/`
		// let dest = '../tmp' // Convenience to view output without triggering server rebuild
		let dest = '../source/lib/actionsv2/actions'
		let base = path.resolve(__dirname, dest)
		await fs.mkdir(`${base}/${action_path}`, {recursive: true})
		await this.writeFileIfNotExists(`${base}/${service_path}/ActionBase.js`, this._ActionBase)
    await this.writeFileIfNotExists(`${base}/${service_path}/CredentialType.js`, this._CredentialType)
		await this.writeFileIfNotExists(`${base}/${service_path}/Protocol.js`, this._Protocol)
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

 get _ActionBase() {
 	let service = this.service
 	return `const OAuth2ActionBase = require('../../base/OAuth2ActionBase')

class ActionBase extends OAuth2ActionBase {
  get refreshEnabled() {
    return true;
  }

  get credentialName() {
    return '${service}'
  }

  protocolHelper() {
    return require('../../catalog/ActionProtocols').forType('${service}')
  }


}

module.exports = ActionBase
`
 }

 get _CredentialType() {
 	let service = this.service
 	return `const OAuth2CredentialTypeBase = require('../../base/OAuth2CredentialTypeBase')

class ${service}Credentials extends OAuth2CredentialTypeBase {
  get refreshEnabled() {
    return true
  }

  // Fields listed here will be managed by the Credentials Vault
  getConfigFields() {
    return {
      client_id: {type: String, required: true},
      client_secret: {type: String, required: true, secret: true}
    }
  }

  showAuthorizeAction(config) {
    return config.client_id && config.client_secret
  }
}

module.exports = ${service}Credentials

`
 }

 get _Protocol() {
 	let service = this.service
 	let action = this.action
 	return `const OAuth2ProtocolBase = require('../../base/OAuth2ProtocolBase')

class ${service}ProtocolHelper extends OAuth2ProtocolBase {
  static get authorizationUrl() {
    return 'https://authorization-url-for-this-service.com/'
  }

  static get tokenUrl() {
    return 'https://token-url-for-this-service.com/oauth/token'
  }

  static clientId(config) {
    return config.client_id
  }

  static clientSecret(config) {
    return config.client_secret
  }

  static refreshToken(config) {
    return config.code_grant.refresh_token
  }

  static scope(config) {
    return ''
  }

  // static get refreshEnabled() {
  //   return true
  // }

  // // Uncomment to override default Token Request
  // static buildAccessTokenRequest(config, req, redirect) {
  //   return [
  //     this.tokenUrl,
  //     {
  //       method: 'POST',
  //       headers: {
  //         'content-type': 'application/x-www-form-urlencoded'
  //       },
  //       body: this.buildAccessTokenRequestBody(config, req, redirect)
  //     }
  //   ]
  // }

  // static buildAccessTokenRequestBody(config, req, redirect) {
  //   const params = new URLSearchParams()
  //   params.set('grant_type', 'authorization_code')
  //   params.set('code', req.query.code)
  //   params.set('redirect_uri', redirect)
  //   params.set('client_id', this.clientId(config))
  //   this.prepareAccessTokenRequest(config, req, params)
  //   return params
  // }

  // // Uncomment to override default Token Refresh Request
  // static buildRefreshTokenRequest(config, logger) {
  //   return [
  //     this.refreshUrl,
  //     {
  //       method: 'POST',
  //       headers: {
  //         'content-type': 'application/x-www-form-urlencoded'
  //       },
  //       body: this.buildRefreshTokenRequestBody(config, logger)
  //     }
  //   ]
  // }

  // static buildRefreshTokenRequestBody(config, logger) {
  //   const params = new URLSearchParams()
  //   params.set('grant_type', 'refresh_token')
  //   params.set('refresh_token', config.code_grant.refresh_token)
  //   this.prepareRefreshTokenRequest(config, logger, params)
  //   return params
  // }

  // // If your action uses custom field editors that need to make additional backend calls, those methods can be defined here.
  // // For example, the action Google/AddToSheet uses a GoogleSheetId field editor, which fetches a list of sheets for the user to select between. That call is relayed through
  // // Oauth2Manager.proxyProtocolRequest to the method defined here.

  // static async performListSheets(protoReq) {
  //   const url = new URL('https://www.googleapis.com/drive/v3/files')
  //   url.searchParams.set('q', "mimeType='application/vnd.google-apps.spreadsheet'")
  //   url.searchParams.set('fields', 'nextPageToken, files(id, name)')
  //   const res = await this.fetchWithAuth(protoReq, url.href)
  //   if (!res.ok)
  //     throw new Error(res.statusText)
  //   return await res.json()
  // }

}

module.exports = ${service}ProtocolHelper
`
 }

 get _Schemas() {
 	let service = this.service
 	return `const {
    schema,
    arrayOf
  } = require('../../../Trivial/schema-utils')

const ${service}Field = schema({fields: {
  }})
  
module.exports.${service}Record = schema({fields: {
  id: {type: String, required: true, example:"\`prefilled id value\`", placeholder:"shadow text when empty", help:"Tooltip on what to enter here."},
  search: {type: String, required: false, example:"\`prefilled search value\`", placeholder:"shadow text when empty", help:"Tooltip on what to enter here."},
  }})
`
 }

 get _Action() {
 	let action = this.action
 	return `// Note the local inheritance
const ActionBase = require('../ActionBase')

class ${action} extends ActionBase {

  async perform() {
    const res = await this.fetchWithAuth(
      \`https://wwww.this-actions-url\`,
      {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          values: this.inputValue
        })
      }
    )

    this.setOutputValue({
      status: res.status,
      headers: res.headers,
      body: await res.json()
    })

    return true
  }
}

module.exports = ${action}
`
 }

 get _Descriptor() {
 	let action = this.action
 	let service = this.service
 	return `  const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

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

}

module.exports = ${action}Descriptor
`
 }


}

module.exports = Oauth2APIActionTemplate