const App = require('../../models/App')
// const fetch = require('node-fetch')


class AppPanel {

  constructor(name, options) {
    this.name = name
    this.options = options
  }

  afterAdd(app) {
    console.log(`[AppPanel] afterAdd `)
    if (typeof this[`${this.name}AfterAdd`] !== "function") { return false } 
    return this[`${this.name}AfterAdd`](app)
  }

  afterCreatePath(id) {
    if (typeof this[`${this.name}AfterCreatePath`] !== "function") {
      return `/apps/${id}?mode=edit`
    } else {
      return this[`${this.name}AfterCreatePath`](id)
    }
  }

  get defaultOptions() {
    if (typeof this[`${this.name}DefaultOptions`] !== "function") { 
      return {
        "component": this.name,
        "options": {}
      }
    } else {
      return this[`${this.name}DefaultOptions`]()
    }
  }

  ContractAfterCreatePath(id) {
    return `/apps/${id}/builder2`
  }

  UnsetAfterCreatePath(id) {
    return `/apps/${id}/builder2`
  }

  DashboardDefaultOptions() {
    return {
      "component": this.name,
      "options": {
        "apps": []
      }
    }
  }

  WorkbookDefaultOptions() {
    return {
      "component": this.name,
      "options": {
        "app_sheets": []
      }
    }
  }

  // TODO These should live on the children of PanelBase.vue, but not sure how to easily parse the Vue files
  WorkbookAfterAdd() {

  }

  static get names() {
    return [
      {display_name: "Contract", name: "Contract"},
      {display_name: "Headline Card", name: "Headline"},
      {display_name: "Line Chart", name: "LineChart"},
      {display_name: "Dashboard", name: "Dashboard"},
      {display_name: "Workbook", name: "Workbook"},
      {display_name: "None", name: "Unset"}
    ]
  }

  static previewSrc(name) {
    return `/assets/images/panels/${name.toLowerCase().replace(' ', '')}.png`
  }

}

module.exports = AppPanel