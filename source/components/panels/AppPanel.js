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

  UnsetAfterCreatePath(id) {
    return `/apps/${id}/builder2`
  }

  PostgresPlaygroundAfterCreatePath(id) {
    return `/apps/${id}/builder2/action/Magic/Query/7?mode=playground`
  }

  // This works if we ever want to trigger a 2nd app to build, but its slow
  // PostgresPlaygroundAfterAdd(app) {
  //   return new Promise( async (resolve, reject) => {
  //     console.log(`[PostgresPlaygroundAfterAdd]`)
  //     let appRunnerName = `${app.descriptive_name} Query Runner`
  //     let appRunner = new App(app.$store)
  //     let appPanel = new AppPanel('PostgresQueryRunner')
  //     appRunner.create({name: appRunnerName, panelOptions: appPanel.defaultOptions})
  //     .then( (appRunnerInstance) => {
  //       app.setPanelOption(
  //         {queryRunnerApp: {
  //           hostname: appRunnerInstance.hostname,
  //           domain: appRunnerInstance.domain
  //           }
  //         })
  //       })
  //     .then(x => resolve())
  //     .catch(e => reject(e))
  //   })

  // }

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
      {display_name: "CSV Upload", name: "CSVUpload"},
      {display_name: "Headline Card", name: "Headline"},
      {display_name: "Line Chart", name: "LineChart"},
      {display_name: "Dashboard", name: "Dashboard"},
      {display_name: "PostgreSQL Playground", name: "PostgresPlayground"},
      {display_name: "Workbook", name: "Workbook"},
      {display_name: "None", name: "Unset"}
    ]
  }

  static previewSrc(name) {
    return `/assets/images/panels/${name.toLowerCase().replace(' ', '')}.png`
  }

}

module.exports = AppPanel