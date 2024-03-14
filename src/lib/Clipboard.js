export default class Clipboard {
  constructor(content) {
    this.content = content
  }

  copyContent() {
    let success = false
    this._withTemporaryElement(elem => {
      elem.value = this.content
      elem.select()
      elem.setSelectionRange(0, this.content.length)
      document.execCommand('copy')
      success = true
    })
    return success
  }

  _withTemporaryElement(fn) {
    let tmp
    try {
      tmp = document.createElement('textarea')
      tmp.style.fontSize = '12pt' // prevents zooming on iOS?
      tmp.style.margin = '0'
      tmp.style.border = '0'
      tmp.style.padding = '0'
      tmp.style.position = 'absolute'
      tmp.style.left = '-9999px'
      tmp.style.top = `${window.pageYOffset || document.documentElement.scrollTop}px`
      tmp.setAttribute('readonly', '')
      document.body.appendChild(tmp)
      fn(tmp)
    } catch (err) {
      console.error('[Clipboard] error while accessing clipboard:', err)
    }

    if (tmp) {
      tmp.remove()
    }
  }

  static copy(content) {
    return new Clipboard(content).copyContent()
  }
}