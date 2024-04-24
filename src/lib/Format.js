export default class Format {
  constructor() {
  }

  static sanitize(token) {
    let out
    if (token === 0) { return 0 }
    if (token == null) { return null }
    if (token == '') { return null }
    if (typeof(token) == "string") { out = token.replace(/[\$\%]/g, '') }
    if (typeof(token) != "number") { out = Number(out) }
    return isNaN(out) ? token : out
  }

  static currencySymbolConversions(str) {
    let conversions = {
      "USD": "$",
      "GBP": "£",
      "CAD": "$",

      // These need to be tested before uncommenting. EUR in particular needs commas and periods swapped
      // "EUR": "€",
      // "JPY": "¥",
      // "AUD": "$",
      // "CNY": "¥",
      // "CHF": "Fr",
      // "SEK": "kr",
      // "NZD": "$",
      // "KRW": "₩",
      // "SGD": "$",
      // "NOK": "kr",
      // "MXN": "$",
      // "INR": "₹",
      // "RUB": "₽",
      // "ZAR": "R",
      // "TRY": "₺",
      // "BRL": "R$"
    }
    return conversions[str] || str
  }

  static money(token=null, places=2, symbol='$') {
    symbol = this.currencySymbolConversions(symbol)
    token = this.sanitize(token)
    if (token == null) { return '' }
    if (isNaN(token)) { return token }
    let neg = token < 0
    let out = Math.abs(token).toFixed(places)
    out = out.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    out = neg ? `-${symbol}${out}` :`${symbol}${out}`
    return out
  }

  static percent(token=null, places=1, multiplier=100) {
    token = this.sanitize(token)
    if (token == null) { return '' }
    let out = (token * multiplier).toFixed(places)
    out = `${out}%`
    return out
  }

  static link(token, template) {
    if (typeof(token) == "number") {  token = new String(token) }
    if (token == null) { return '' }
    let link = template.replace(/\$\{var\}/, token)
    return `<a href="${link}" target="_blank">${token}</a>`
  }

  static text(token=null) {
    return String(token)
  }

  static none(token) {
    return token
  }

}