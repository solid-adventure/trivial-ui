const { expect } = require('chai')
const Format = require('../../source/lib/Format')

describe('Format', () => {


  describe('money', () => {
    it('handles an int', () => {
      expect(Format.money(12)).to.eql('$12.00')
    })

    it('handles a float', () => {
      expect(Format.money(12.00)).to.eql('$12.00')
    })

    it('handles a string', () => {
      expect(Format.money("12.00")).to.eql('$12.00')
    })

    it('rounds down', () => {
      expect(Format.money(12.124)).to.eql('$12.12')
    })

    it('rounds up', () => {
      expect(Format.money(12.125)).to.eql('$12.13')
    })

    it('handles a dollar sign', () => {
      expect(Format.money("$12.125")).to.eql('$12.13')
    })

    it('handles a single decimal string', () => {
      expect(Format.money("12.1")).to.eql('$12.10')
    })

    it('handles an empty string', () => {
      expect(Format.money("")).to.eql('')
    })

    it('handles zero', () => {
      expect(Format.money(0)).to.eql('$0.00')
    })

    it('handles zero as string', () => {
      expect(Format.money("0")).to.eql('$0.00')
    })

    it('handles negative', () => {
      expect(Format.money(-12.34)).to.eql('-$12.34')
    })

    it('handles obviously not money text', () => {
      expect(Format.money("random text, not money")).to.eql('random text, not money')
    })

    it('returns an array unmodified', () => {
      expect(Format.money([1,2,3])).to.eql([1,2,3])
    })

    it('adds a comma', () => {
      expect(Format.money(1000)).to.eql('$1,000.00')
    })

    it('adds a comma and a negative', () => {
      expect(Format.money(-1000)).to.eql('-$1,000.00')
    })

    it('handles a zero places option', () => {
      expect(Format.money(1000, 0)).to.eql('$1,000')
    })

    it('handles GBP', () => {
      expect(Format.money(12, 2, '£')).to.eql('£12.00')
    })


  })

  describe('percent', () => {
    it('handles a two decimal float', () => {
      expect(Format.percent(0.12)).to.eql('12.0%')
    })

    it('handles a three decimal float', () => {
      expect(Format.percent(0.962)).to.eql('96.2%')
    })

    it('handles a three decimal float with 2 places', () => {
      expect(Format.percent(0.962, 2)).to.eql('96.20%')
    })

    it('rounds up a five decimal float with 2 places', () => {
      expect(Format.percent(0.96275, 2)).to.eql('96.28%')
    })

    it('handles a string', () => {
      expect(Format.percent("0.96275", 2)).to.eql('96.28%')
    })

    it('handles a string with %', () => {
      expect(Format.percent("0.96275%", 2)).to.eql('96.28%')
    })

    it('handles 100', () => {
      expect(Format.percent(1, 2)).to.eql('100.00%')
    })

    it('handles null', () => {
      expect(Format.percent(null, 2)).to.eql('')
    })

    it('handles an empty string', () => {
      expect(Format.percent('', 2)).to.eql('')
    })

    it('handles zero', () => {
      expect(Format.percent(0)).to.eql('0.0%')
    })


  })

  describe('link', () => {
    it('handles a simple link with a number arg', () => {
      expect(Format.link(1234, "https://www.services.com/${var}")).to.eql('<a href="https://www.services.com/1234" target="_blank">1234</a>')
    })

    it('handles a simple link with a string arg', () => {
      expect(Format.link('1234', "https://www.services.com/${var}")).to.eql('<a href="https://www.services.com/1234" target="_blank">1234</a>')
    })

    it('returns an empty string with no arg', () => {
      expect(Format.link(null, "https://www.services.com/${var}")).to.eql('')
    })

    it('returns the template unchanged with an empty string', () => {
      expect(Format.link('', "https://www.services.com/${var}")).to.eql('<a href="https://www.services.com/" target="_blank"></a>')
    })


  })


})

