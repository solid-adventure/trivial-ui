export default class Notifications {
  static error(message, options) {
    if (this._component) {
      this._component.notice('error', message, options)
    }
  }

  static success(message, options) {
    if (this._component) {
      this._component.notice('success', message, options)
    }
  }

  static info(message, options) {
    if (this._component) {
      this._component.notice('info', message, options)
    }
  }

  static setComponent(component) {
    this._component = component
  }
}
