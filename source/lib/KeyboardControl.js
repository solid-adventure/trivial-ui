
// Usage

// const keyboardControl = new KeyboardControl()
// keyboardControl.register('command-r', "Custom Alert", () => { alert('your function here') } )

// keyboardControl.registry()
// =>
//    {'command-r': {
//      name: "Custom Alert",
//      func: () => { alert('your function here') },
//      args: undefined
//    }
//}

// Note: key modifiers must be in alphabetical order, e.g, command-shift-n. shift-command-n will not work

class KeyboardControl {
  constructor(documentRef) {

    this.init()
    this.metaKeyIsDown = false
    this.modifiers = []
    this.registry = {}
    this.document = documentRef
  }

  init() {
    if (typeof window == 'undefined') { return false } // Skip  for tests
    this.keyDownListener = window.addEventListener('keydown', this.handlekeyDownEvent.bind(this))
    this.keyUpListener = window.addEventListener('keyup', this.handleKeyUpEvent.bind(this))
    this.blurListener = window.addEventListener('blur', this.resetModifiers.bind(this));
  }

  register(id, name, func, args) {
    this.registry[id] = {
      name: name,
      func: func,
      args: args
    }
  }

  performable(id) {
    // Always allow the Escape key
    if (id == 'Escape') { return true }

    // Always allow if there isn't an input with focus
    if (!this.inputIsActive) {
      return true
    }

    // Allow if there is at least one non-shift modifier(command, ctrl, alt)
    if (id.split('-').filter(m => m != 'shift').length > 1 ) {
      return true
    }

    // Otherwise, an editable area has focus and we ignore, i.e. the user is typing
    // console.log(`Not performable: ${id}`) // Helpful to log when a keypress is being ignored
    return false
  }

  get inputIsActive() {
    return this.inputTypes.includes(this.document.activeElement.type || ''.toLowerCase())
  }

  get inputTypes() {
    return ['text', 'textarea']
  }

  async handlekeyDownEvent(event) {
    if (event.key == 'Meta') {
      this.modifiers.push('command')
    } else {
        if (!this.performable(this.idFromEvent(event))) { return false }
        await this.perform(event, this.idFromEvent(event))
    }
  }

  collectModifiers(event) {
    if (event.altKey) { this.modifiers.push('alt') }
    if (event.shiftKey) { this.modifiers.push('shift') }
    if (event.ctrlKey) { this.modifiers.push('ctrl') }
  }

  // Alt, Shift, and Ctrl are present on the event.
  // However, the Meta/Command key has its own event, and needs to be managed manually.
  clearModifers(event) {
    this.modifiers = this.modifiers.filter(m => !['alt', 'shift', 'ctrl'].includes(m))
    if (event.key == 'Meta') {
      this.modifiers = this.modifiers.filter(m => m != 'command')
    }
  }

  resetModifiers() {
    this.modifiers = []
  }

  idFromEvent(event) {
    this.collectModifiers(event)
    let modifiers = [... new Set(this.modifiers)]
    modifiers.sort().push(event.key)
    return modifiers.join('-')
  }

  handleKeyUpEvent(event) {
    this.clearModifers(event)
  }

  async perform(event, id) {
    // console.log(id) // Prints all keypress combinations; Helpful to create new shortcuts
    let reg = this.registry[id]
    if (!reg) { return false }
    try {
      if (typeof reg.func == 'function') {
        event.preventDefault()
        await reg.func(reg.args)
      }      
    } catch(e) {
      console.log(e)
    }
  }

}

module.exports = KeyboardControl
