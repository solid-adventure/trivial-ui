const ActionDescriptors = require ('trivial-core/lib/actionsv2/catalog/ActionDescriptors')
const BuilderSuggestionBase = require ('./BuilderSuggestionBase')
const ActionIterator = require ('trivial-core/lib/actionsv2/catalog/ActionIterator')


class FormatForTableView extends BuilderSuggestionBase {

	get suggestion () {
		return {
				text: "You'll typically need to format your query for the TableView. Generate a custom transform.",
				onConfirm: () => {this.onAccept(this.actions.length - 1, 'Custom')}
			}
	}

	onAccept(index, type) {
		// TODO: If we make this a specific action type, we can detect if it exists more accurately
    const newDef = ActionDescriptors.actionDefinitionAndCredentialsOfType(
      `Custom`, this.nextIdentifier
    )
		newDef.action.definition.code = "//this.logEvent('results', true, {results: payload.results})\n\nif (payload.results.length == 0) {\n    return {names: [\"No results\"], rows: []}\n}\n\nlet sample = payload.results[0]\nlet names = Object.keys(sample)\nlet rows = []\n\nfor (let row of payload.results) {\n  let cols = names.map(name => row[name]);\n  rows.push(cols)\n}\n\nreturn {names, rows}"
		this.actions.splice(index, 0, newDef.action)

		this.setTableViewTransform()

	}

	setTableViewTransform() {
		try {
      let transforms = this.actions[this.actions.length -1].definition.actions[0].definition.transformations
      transforms.find( (x) => {return  x.to == "rows"} ).from = "payload.rows"
      transforms.find( (x) => {return  x.to == "columnNames"} ).from = "payload.names"
    } catch (e) {
      console.log(`Could not assign helperAction transforms: ${e}`)
    }
	}

  get shouldSuggest() {
    try {
      return this.lastAction.type == 'Panel/TableView' && this.penultimateAction.type != 'Custom'
    } catch(e) {
      console.log(`Could not determine last action and panel type: ${e} `)
      return false
    }
  }

  // TODO: Do we want to check for the previous action type before suggesting?
  // helperActionApplies(actions) {
  //   try {
  //     let previous = actions[actions.length - 2]
  //     let prevType = previous.definition.actions[1].type
  //     return [
  //       'PostgreSQL/Query',
  //       'PostgreSQL/Upsert',
  //       'MySQL/Query'
  //       ].includes(prevType)
  //   } catch (e) {
  //     console.log(`Could not determine previous action: ${e}`)
  //   }

  // }

  get penultimateAction() {
  	return this.actionAtIndex(this.actions.length - 2) || {}
  }

  get lastAction() {
  	return this.actionAtIndex(this.actions.length - 1) || {}
  }



}

module.exports = FormatForTableView