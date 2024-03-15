class BuilderSuggestionBase {
	constructor(app, actions, nextIdentifier) {
		this.app = app || {}
		this.actions = actions || []
		this.nextIdentifier = nextIdentifier
	}

	get suggestion () {
		throw 'Your implementation must overrwride the getter: suggestion'
	}

	onAccept(index, type) {
		throw 'Your implementation must overrwride the method: onAccept'
	}

  get shouldSuggest() {
		throw 'Your implementation must overrwride the getter: shouldSuggest'
  }

  actionAtIndex(i=0) {
    let action = this.actions[i] || {}
    if (action.type == 'ActionWithTransform') {
      action = action.definition.actions[1]
    }
    return action
  }

}

module.exports = BuilderSuggestionBase