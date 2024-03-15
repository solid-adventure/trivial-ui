const { expect } = require('chai')
const KeyboardControl = require('../../source/lib/KeyboardControl')


describe('KeyboardControl', () => {
  let keyboardControl = new KeyboardControl()

  describe('registeration', () => {
    it('registers a new keyboard shorcut', () => {
      keyboardControl.register("command-s", "Save", () => { return true })
      expect(JSON.stringify(keyboardControl.registry)).to.eql('{"command-s":{"name":"Save"}}')
    })

    it('can call the passed in function', () => {
      keyboardControl.register("command-s", "Save", () => { return 23 })
      expect(keyboardControl.registry['command-s'].func()).to.eql( 23 )
    })


  })

})


describe('KeyboardControl', () => {
  let documentMock = {
    activeElement: {
      tagName: 'INPUT'
    }
  }
  let keyboardControl = new KeyboardControl(documentMock)

  describe('Caputures key presses', () => {
    it('formats a shift combo', () => {
      keyboardControl.handleKeyUpEvent({}) // Reset the test to no keys down
      expect(keyboardControl.idFromEvent({key: 'S', shiftKey: true, ctrlKey: false} )).to.eql('shift-S')
    })

    it('formats a single key', () => {
      keyboardControl.handleKeyUpEvent({})
      expect(keyboardControl.idFromEvent({key: 'x', shiftKey: false, ctrlKey: false } )).to.eql('x')
    })

    it('formats a shift-ctrl combo', () => {
      keyboardControl.handleKeyUpEvent({})
      expect(keyboardControl.idFromEvent({key: 'S', shiftKey: true, ctrlKey: true} )).to.eql('ctrl-shift-S')
    })

    it('formats a meta combo', () => {
      keyboardControl.handleKeyUpEvent({})
      keyboardControl.handlekeyDownEvent({key: 'Meta', shiftKey: false, ctrlKey: false} )
      expect(keyboardControl.idFromEvent({key: 's', shiftKey: false, ctrlKey: false} )).to.eql('command-s')
    })

    it('formats a shift-meta combo', () => {
      keyboardControl.handleKeyUpEvent({})
      keyboardControl.handlekeyDownEvent({key: 'Meta'} )
      expect(keyboardControl.idFromEvent({key: 'S', shiftKey: true, ctrlKey: false} )).to.eql('command-shift-S')
    })

  })


  describe('performable with input focused', () => {

    let documentMock = {
      activeElement: {
        tagName: 'INPUT',
        type: 'text'
      }
    }
    let keyboardControl = new KeyboardControl(documentMock)

    it('ignores single keys', () => {
      keyboardControl.handleKeyUpEvent({})
      let id = keyboardControl.idFromEvent({key: 'x', shiftKey: false, ctrlKey: false} )
      expect( id ).to.eql('x')
      expect(keyboardControl.performable(id)).to.eql(false)
    })

    it('ignores shift combo', () => {
      keyboardControl.handleKeyUpEvent({})
      let id = keyboardControl.idFromEvent({key: 'X', shiftKey: true, ctrlKey: false} )
      expect( id ).to.eql('shift-X')
      expect(keyboardControl.performable(id)).to.eql(false)
    })

    it('allows a command combo', () => {
      keyboardControl.handleKeyUpEvent({})
      keyboardControl.handlekeyDownEvent({key: 'Meta'} )
      let id = keyboardControl.idFromEvent({key: 'x', shiftKey: false, ctrlKey: false} )
      expect( id ).to.eql('command-x')
      expect(keyboardControl.performable(id)).to.eql(true)
    })


  })

  describe('performable with body (non-input) focused', () => {

    let documentMock = {
      activeElement: {
        tagName: 'BODY'
      }
    }
  let keyboardControl = new KeyboardControl(documentMock)

    it('allows single keys', () => {
      keyboardControl.handleKeyUpEvent({})
      let id = keyboardControl.idFromEvent({key: 'x', shiftKey: false, ctrlKey: false} )
      expect( id ).to.eql('x')
      expect(keyboardControl.performable(id)).to.eql(true)
    })

    it('allows a shift combo', () => {
      keyboardControl.handleKeyUpEvent({})
      let id = keyboardControl.idFromEvent({key: 'X', shiftKey: true, ctrlKey: false} )
      expect( id ).to.eql('shift-X')
      expect(keyboardControl.performable(id)).to.eql(true)
    })

    it('allows a command combo', () => {
      keyboardControl.handleKeyUpEvent({})
      keyboardControl.handlekeyDownEvent({key: 'Meta'} )
      let id = keyboardControl.idFromEvent({key: 'x', shiftKey: false, ctrlKey: false} )
      expect( id ).to.eql('command-x')
      expect(keyboardControl.performable(id)).to.eql(true)
    })

  })


})
