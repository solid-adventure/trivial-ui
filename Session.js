const UserManager = require('./lib/UserManager')

module.exports = class Session {

	constructor() {
	}

	// NOTE: This does not check for ownership, only a valid session.
	// We are continuing to rely on the tokened URLs to provide some small level of privacy, combined with the Rails app, which
	// does validate authorization
	static async validate(req, res, next) {
		let destination = req.originalUrl
		let authorized = false

  	let token = req.signedCookies["trivial-access-token"]
  	let expiry = req.signedCookies["trivial-expiry"]
		if (token && expiry && Session.validExpiry(expiry)) {
		  const user = await UserManager.info(req)
		  if (user) {
		    res.locals.current_user = user
		    authorized = true
		  }
		}

		// route traffice based on results
		if (authorized && destination == '/signin' && res.locals.current_user && !res.locals.current_user.account_locked) {
			destination = '/'
		}

		let no_redirect = ['/signin', '/recoverpassword', '/resetpassword','/register', '/account-locked']
   	if (!authorized && (no_redirect.indexOf(req.path) == -1)) {
      destination = '/signin'
  	}

    if (req.path === '/resetpassword') {
      Session.validateForReset(req, res, next)
    }

    // routed locked users to account locked page with reason for lock
    if (res.locals.current_user && res.locals.current_user.account_locked && no_redirect.indexOf(destination) == -1) {
      destination = '/account-locked'
    }

	 	// Only redirect if we're not already there to prevent self-referential loop, e.g., on /login with no session
		if (destination != req.originalUrl) {
			res.redirect(destination)
		} else {
      next()
    }

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

    if (req.signedCookies['trivial-reset']) {
      const headers = JSON.parse(req.signedCookies['trivial-reset'])
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