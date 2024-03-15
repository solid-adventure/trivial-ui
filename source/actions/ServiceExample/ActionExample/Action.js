const ActionBase = require('../../../base/ActionBase')

class ActionExample extends ActionBase {
  async perform() {

    // let api_key = this.config.ServiceExample.api_key
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

module.exports = ActionExample
