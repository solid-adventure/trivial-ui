const { expect } = require('chai')
const SelectionBounds = require('../../source/lib/SelectionBounds')

describe('SelectionBounds', () => {

  // let selectionBounds = new SelectionBounds([2, 5, 4, 3])
  let selectionBounds = new SelectionBounds()
  selectionBounds.update('3-2')
  selectionBounds.update('5-4')

  describe('initializes and finds edges', () => {
    it('gets minX', () => {
      expect(selectionBounds.minX).to.eql(3)
    })
    it('gets maxX', () => {
      expect(selectionBounds.maxX).to.eql(5)
    })
    it('gets minY', () => {
      expect(selectionBounds.minY).to.eql(2)
    })
    it('gets maxY', () => {
      expect(selectionBounds.maxY).to.eql(4)
    })

    it ('updates', () => {
      selectionBounds.update('7-11')
      describe('finds updated bounds', () => {
        it('gets minX', () => {
          expect(selectionBounds.minX).to.eql(3)
        })
        it('gets maxX', () => {
          expect(selectionBounds.maxX).to.eql(7)
        })
        it('gets minY', () => {
          expect(selectionBounds.minY).to.eql(2)
        })
        it('gets maxY', () => {
          expect(selectionBounds.maxY).to.eql(11)
        })
      })
    })
  })

  describe('range', () => {
    it('gets range', () => {
      expect(selectionBounds.range(5,10)).to.eql([5,6,7,8,9,10])
    })
  })

  describe('members', () => {
    it('gets members', () => {
      expect(selectionBounds.members).to.eql([
        '3-2',  '3-3',  '3-4',  '3-5',  '3-6',  '3-7',
        '3-8',  '3-9',  '3-10', '3-11', '4-2',  '4-3',
        '4-4',  '4-5',  '4-6',  '4-7',  '4-8',  '4-9',
        '4-10', '4-11', '5-2',  '5-3',  '5-4',  '5-5',
        '5-6',  '5-7',  '5-8',  '5-9',  '5-10', '5-11',
        '6-2',  '6-3',  '6-4',  '6-5',  '6-6',  '6-7',
        '6-8',  '6-9',  '6-10', '6-11', '7-2',  '7-3',
        '7-4',  '7-5',  '7-6',  '7-7',  '7-8',  '7-9',
        '7-10', '7-11'
      ])
    })
  })


})

