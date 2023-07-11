class SignOut{
    constructor(){
        this.state = 'loaded'
        this.init()
    }

    setState(new_state) {
		this.state = new_state
		this.init()
	}

    async init(){
        switch(this.state){
            case "loaded":
                let logout = await fetch(`proxy/trivial?path=/auth/sign_out`, {
                    method: 'delete',
                    headers: {'content-type': 'application/json'},
                })
                .then(response => response.json())
                .then(data => this.handleResponse(data))
                .catch(error => this.handleSignOutError(error))
                break
            case "success":
                let clearCookies = await fetch('proxy/trivial/cookies', {
                    method: 'post',
                    headers: {'content-type': 'application/json'},
                    body: JSON.stringify({
                        'uid': null,
                        'client': null,
                        'access-token': null,
                        'expiry': null
                    })
                })
                .then(response => response.json())
                .then(data => this.handleResponse(data))
                .catch(error => this.handleSignOutError(error))
                window.location = '/'
                break
            default: 
			    break
        }
        
    }

    handleResponse(data) {
		if (!data.success) {
			this.handleSignOutError(data)
		} else {
			this.setState('success')
		}
	}

	handleSignOutError(e) {
        console.log(e)
		if (e && e.errors) {
            console.log(`[SignOut] Error: ${e.errors}`)
			document.getElementById('#messages').html(e.errors)
		}
	}
}