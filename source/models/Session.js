import store from "../store";

export default class Session {


  constructor() {
  }


  ///////// User Start //////////
  static async getProfile() {
    return Session.apiCall('/profile')
    .then(data => data.user)
  }

  static async updateProfile(user) {
    return Session.apiCall('/profile', 'PUT', user)
    .then(data => data.user)
  }
  ///////// User End //////////


  static async apiCall(path, method='GET', data) {
    const session = await Session.current()
    if (!session.accessToken) { return }
    const url = new URL(path, store.state.trivialApiUrl)

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
    let response = await fetch(url, options)
    .catch(error => Promise.reject(error))

    if (!response.ok) {
      Promise.reject(response)
    }

    // Catch an empty body, such as No content after a delete
    const clonedResponse = response.clone()
    const text = await clonedResponse.text()
    if (text.replaceAll(' ','').length > 0) { return response.json() }
  }

  static async create(token, client, expiry, uid) {
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

  static async validate(to, from, next) {

    let authorized = false
    let session = await Session.current()

    console.log('session', session)
    console.log('accessToken', session.accessToken)
    console.log('expiry', session.expiry)
    if (session.accessToken && session.expiry && Session.validExpiry(session.expiry)) {
      authorized = true
      store.commit('setIsAuthenticated', true)
    }

    let no_redirect = ['/signin', '/signout', '/acceptinvitation', '/recoverpassword', '/resetpassword','/register', '/account-locked']
    if (no_redirect.includes(to.path)) {
      authorized = true
    }

    // if (store.current_user && store.current_user.account_locked && !no_redirect.includes(to.path)) {
    //   next({
    //     path: "/account-locked",
    //     params: { nextUrl: to.fullPath },
    //   });
    // }

    // // route traffice based on results
    // if (authorized && destination == '/signin' && res.locals.current_user && !res.locals.current_user.account_locked) {
    //   destination = '/'
    // }

    // // let no_redirect = ['/signin', '/acceptinvitation', '/recoverpassword', '/resetpassword','/register', '/account-locked']
    // if (!authorized && (no_redirect.indexOf(req.path) == -1)) {
    //   destination = '/signin'
    // }

    // if (req.path === '/resetpassword') {
    //   Session.validateForReset(req, res, next)
    // }

    // // routed locked users to account locked page with reason for lock
    // if (res.locals.current_user && res.locals.current_user.account_locked && no_redirect.indexOf(destination) == -1) {
    //   destination = '/account-locked'
    // }

    // // Only redirect if we're not already there to prevent self-referential loop, e.g., on /login with no session
    // if (destination != req.originalUrl) {
    //   res.redirect(destination)
    // } else {
    //   next()
    // }
    return authorized

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

// module.exports = Session
