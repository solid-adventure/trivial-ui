import store from "../store";

export default class Session {

  constructor() {
  }

  static apiUrl(path) {
    return new URL(path, store.state.trivialApiUrl)
  }

  static async apiCall(path, method='GET', data) {
    const session = await Session.current()

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
    .then(response => Session.handleResponse(response))
  }

  static async handleResponse(response) {
    let out = undefined
    // Catch an empty body, such as No Content after a delete
    const clonedResponse = response.clone()
    const text = await clonedResponse.text()

    if (text.replaceAll(' ','').length > 0) {
     out = await response.json()
    }

    if (response.ok) {
      return out
    } else {
      throw new Error(out.error)
    }
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
    await window.cookieStore.set("trivial-access-token", response.headers.get('access-token'))
    await window.cookieStore.set("trivial-client", response.headers.get('client'))
    await window.cookieStore.set("trivial-expiry", response.headers.get('expiry'))
    await window.cookieStore.set("trivial-uid", response.headers.get('uid'))
  }

  static async destroy() {
    await Session.apiCall('/auth/sign_out', 'DELETE')
    await window.cookieStore.delete("trivial-access-token")
    await window.cookieStore.delete("trivial-client")
    await window.cookieStore.delete("trivial-expiry")
    await window.cookieStore.delete("trivial-uid")
  }

  static async current() {
    let accessToken = await window.cookieStore.get("trivial-access-token")
    let client = await window.cookieStore.get("trivial-client")
    let expiry = await window.cookieStore.get("trivial-expiry")
    let uid = await window.cookieStore.get("trivial-uid")
    return {
      accessToken: accessToken?.value,
      client: client?.value,
      expiry: expiry?.value,
      uid: uid?.value
    }
  }

  static async validate() {
    let session = await Session.current()
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
