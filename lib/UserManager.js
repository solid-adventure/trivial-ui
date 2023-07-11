const APIService = require('trivial-core/lib/APIService')

class UserInfo {
  constructor(attrs) {
    this.email = attrs.email
    this.name = attrs.name
    this.color_theme = attrs.color_theme
    this.created_at = attrs.created_at
  }

  get themeName() {
    return String(this.color_theme || '').toLowerCase()
  }

  get stylesheet() {
    if (!this.color_theme) {
      return `/assets/stylesheets/app-light.css`
    } else if (this.color_theme === 'Dark') {
      return `/assets/stylesheets/app.css`
    } else {
      return `/assets/stylesheets/app-${this.themeName}.css`
    }
  }
}

class UserManager {
  static async info(req) {
    try {
      return await this._infoForRequest(req)
    } catch (err) {
      req.log.error({err}, 'failed to load user profile')
      return undefined
    }
  }

  static async _infoForRequest(req) {
    const service = new APIService('trivial', req)
    const response = await service.fetchJSON('/profile')
    return new UserInfo(response.user)
  }
}
module.exports = UserManager
