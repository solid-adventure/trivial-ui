// const ActionDescriptors = require ('trivial-core/lib/actionsv2/catalog/ActionDescriptors')
// const BuilderSuggestionBase = require ('./BuilderSuggestionBase')
import ActionDescriptors from 'trivial-core/lib/actionsv2/catalog/ActionDescriptors'
import BuilderSuggestionBase from './BuilderSuggestionBase'

export default class LastActionMatchesPanelType extends BuilderSuggestionBase {

	get suggestion () {
		return {
				text: `The display is set to ${this.app.panels.component}– set the output format to match.`,
				onConfirm: () => {this.onAccept(this.actions.length, this.app.panels.component)}
			}
	}

	onAccept(index, type) {
		// TODO If a TableView action already exists, move it to the end rather than creating one
    const newDef = ActionDescriptors.actionDefinitionAndCredentialsOfType(
      `Panel/${type}`, this.nextIdentifier
    )

		this.removeSendResponse()
		this.actions.splice(index, 0, newDef.action)

	}


	removeSendResponse() {
		if (this.lastAction.type == 'SendResponse') {
			this.actions.pop()
		}
	}


  get shouldSuggest() {
    if (!this.app.panels || !this.app.panels.component) { return false } // Ignore if no panel type set
    if (ActionDescriptors.descriptorClasses.Panel[this.app.panels.component] == undefined) { return false } // ignore of no panel exists

    try {
      return this.lastAction.type != `Panel/${this.app.panels.component}`
    } catch(e) {
      console.log(`Could not determine last action and panel type: ${e} `)
      return false
    }
  }

  get lastAction() {
  	return this.actionAtIndex(this.actions.length - 1) || {}
  }

}