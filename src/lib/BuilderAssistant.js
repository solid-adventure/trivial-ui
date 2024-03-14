import LastActionMatchesPanelType from './BuilderSuggestions/LastActionMatchesPanelType'
import FormatForTableView from './BuilderSuggestions/FormatForTableView'

export default class BuilderAssistant {
	constructor(app, actions, nextIdentifier) {
		this.suggestions = []
		this.assistants = [
			 new LastActionMatchesPanelType(app, actions, nextIdentifier),
			 new FormatForTableView(app, actions, nextIdentifier)
		]

		this.init()

	}

	init() {
		for (let assistant of this.assistants) {
			try {
				if (assistant.shouldSuggest) {
					this.suggestions.push(assistant.suggestion)
				}
			} catch (e) {
				console.log(`Could not build suggestion: ${e}`)
			}
		}
	}



}