import store from "../store";

export default class Session {

  constructor() {
  }

  static apiUrl(path) {
    return new URL(path, store.state.trivialApiUrl)
  }

  static async apiCall(path, method='GET', data) {
    const session = await Session.current()
    if (!session.accessToken) { return }

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

    await Session.setCookies(
      response.headers.get('access-token'),
      response.headers.get('client'),
      response.headers.get('expiry'),
      response.headers.get('uid')
    )
    store.commit('setIsAuthenticated', true)
    store.commit('setUser', user)
    return user
  }


  static async setCookies(token, client, expiry, uid) {
    await window.cookieStore.set("trivial-access-token", token)
    await window.cookieStore.set("trivial-client", client)
    await window.cookieStore.set("trivial-expiry", expiry)
    await window.cookieStore.set("trivial-uid", uid)
  }

  static async destroy() {
    await Session.apiCall('/auth/sign_out', 'DELETE')
    await window.cookieStore.delete("trivial-access-token")
    await window.cookieStore.delete("trivial-client")
    await window.cookieStore.delete("trivial-expiry")
    await window.cookieStore.delete("trivial-uid")
    await window.cookieStore.delete("trivial-reset")
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
    console.log('session', session)

    if (store.user && store.user.account_locked) {
      return false
    }

    if (session.accessToken && session.expiry && Session.validExpiry(session.expiry)) {
      store.commit('setIsAuthenticated', true)
      return true
    }

    // if (req.path === '/resetpassword') {
    //   Session.validateForReset(req, res, next)
    // }

    return false

  }

  // Checks for valid session parameters in a redirect URL or trivial-reset
  // header. If the values are found in a the request URL, it sets a
  // trivial-reset header.
  //
  // This does not represent a true session, only permission to reset the
  // password.
  //
  // If parameteters are found, they are returned as an object. Otherwise,
  // a redirect to signin is sent and undefined is returned.
  static validateForReset(req, res, next) {
    const requiredParams = ['access-token', 'client', 'expiry', 'uid']

    if ( requiredParams.every(p => req.query.hasOwnProperty(p)) &&
        Session.validExpiry(req.query.expiry) ) {
      const headers = {}
      requiredParams.forEach(p => headers[p] = req.query[p])
      res.cookie('trivial-reset', JSON.stringify(headers), {signed: true})
      return next()
    }

    if (cookies['trivial-reset']) {
      const headers = JSON.parse(cookies['trivial-reset'])
      if (Session.validExpiry(headers.expiry)) {
        return next()
      }
    }

    res.redirect('/signin')
  }

  static validExpiry(expiry) {
    return parseInt(expiry, 10) * 1000 > Date.now()
  }

}
