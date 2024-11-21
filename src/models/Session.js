import store from "../store";

export default class Session {

  constructor() {
  }

  static apiUrl(path) {
    const TRIVIAL_API_URL = window.CONTAINER_TRIVIAL_API_URL || import.meta.env.VITE_TRIVIAL_API_URL || 'trivial-api-url-not-set'
    return new URL(path, TRIVIAL_API_URL)
  }

  static async apiCall(path, method='GET', data, format='json', stream=false, streamedResponse=[]) {
    const session = Session.current

    const options = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "access-token": session.accessToken,
        client: session.client,
        expiry: session.expiry,
        uid: session.uid,
      },
    }
    if (data) {
      options.body = JSON.stringify(data)
    }
    return fetch(this.apiUrl(path), options)
    .then(response => Session.handleResponse(response, format, stream, streamedResponse))
  }

  static async handleResponse(response, format, stream, streamedResponse) {
    if (!response.ok) {
      return this.handleErrorResponse(response)
    } else if (format == 'csv' && stream == true) {
      return this.handleCSVResponse(response)
    } else if (format == 'json' && stream == true) {
      this.handleStreamedJSONResponse(response, streamedResponse)
    } else {
      return this.handleJSONResponse(response)
    }
  }

  static async handleErrorResponse(response) {
    let clonedResponse = response.clone()

    let out = {}
    let error = null
    try {
      out = await response.json()
    } catch(err) {
      error = await clonedResponse.text()
      if (error.length > 0) {
        out.error = error
      }
    }

    if (out.error) {
      throw new Error(out.error)
    } else if (out.errors && Array.isArray(out.errors)) {
      throw new Error(out.errors.join(', '))
    } else if (out.errors) {
      throw new Error(out.errors)
    } else if (response.statusText) {
      throw new Error(response.statusText)
    } else {
      throw new Error("Request failed")
    }
  }

  static async handleStreamedJSONResponse(response, streamedResponse) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let partialLine = ''
    let done, value
    while (!done) {
      ({ done, value } = await reader.read())
      if (value) {
        let chunk = partialLine + decoder.decode(value)
        const lines = chunk.split('\n')
        partialLine = lines.pop()
        const message = JSON.parse(lines[0]).message
        streamedResponse.push(message)
      }
    }
  }

  static async handleCSVResponse(response) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    let streamedLines = [];
    let streamedLinesTotal = Number(response.headers.get('x-items-count'))
    store.commit("setStreamedLinesTotal", streamedLinesTotal)
    store.commit("setStreamStatus", 'open')

    let partialLine = ''
    let done, value
    while (!done && store.getters.getStreamStatus === 'open') {
      ({ done, value } = await reader.read())
      if (value) {
        let chunk = partialLine + decoder.decode(value)
        const lines = chunk.split('\n')
        partialLine = lines.pop()
        streamedLines.push(...lines)
        store.commit("setStreamedLines", streamedLines.length - 1)
      }
    }
    if (store.getters.getStreamStatus === 'cancelling') {
      reader.cancel()
    } else {
      return streamedLines.join('\n')
    }
  }

  static async handleJSONResponse(response) {
    let out = undefined
    // Catch an empty body, such as No Content after a delete
    const clonedResponse = response.clone()
    const text = await clonedResponse.text()

    if (text.replaceAll(' ','').length > 0) {
     out = await response.json()
    }

    return out
  }

  static async create(email, password) {
    let response = await fetch(this.apiUrl('/auth/sign_in'), {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({email, password})
    })
    let data = await response.json()
    let user = data.data
    if (response.ok) {
      await this.setCookies(response)
      store.commit('setUser', user)
    }
    return user
  }

  static async register(name, email, password, role='member') {
    let response = await fetch(this.apiUrl('/auth'), {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({name, email, password, role})
    })
    let data = await response.json()
    let user = data.data
    if (response.ok) {
      await this.setCookies(response)
      store.commit('setUser', user)
    }
    return user
  }

  static async resetPassword(password, confirm_password, resetToken, client, uid) {
    const options = {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        "access-token": resetToken,
        client: client,
        uid: uid,
      },
      body: JSON.stringify({
        password,
        password_confirmation: confirm_password,
      })
    }
    let response = await fetch(this.apiUrl('/auth/password'), options)
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error(response.statusText)
    }
  }

  static async setCookies(response) {
    document.cookie = `trivial-access-token=${response.headers.get('access-token')}`
    document.cookie = `trivial-client=${response.headers.get('client')}`
    document.cookie = `trivial-expiry=${response.headers.get('expiry')}`
    document.cookie = `trivial-uid=${response.headers.get('uid')}`
  }

  static getCookie(name) {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];
  }

  static async destroy() {
    for (let cookie of ['trivial-access-token', 'trivial-client', 'trivial-expiry', 'trivial-uid']) {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;;`
    }
    await Session.apiCall('/auth/sign_out', 'DELETE')
  }

  static get current() {
    return {
      accessToken: this.getCookie('trivial-access-token'),
      client: this.getCookie('trivial-client'),
      expiry: this.getCookie('trivial-expiry'),
      uid: this.getCookie('trivial-uid')
    }
  }

  static async validate() {
    let session = Session.current
    if (store.user && store.user.account_locked) {
      return false
    }
    if (session.accessToken && session.expiry && Session.validExpiry(session.expiry)) {
      store.commit('setIsAuthenticated', true)
      return true
    }
    return false
  }

  static validExpiry(expiry) {
    return parseInt(expiry, 10) * 1000 > Date.now()
  }

}
