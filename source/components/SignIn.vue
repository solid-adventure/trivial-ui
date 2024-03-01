<template>
    <div class="overlay">
        <div class="container">
            <span class="brand"><img/></span>
            <form id='signInForm'>
                <div>
                    <input type='text' class='text-field' placeholder ='E-mail Address'  v-model='email'/>
                </div>
                <div>
        	        <input type='password' class='text-field' placeholder='Password' v-model='password'/>
                </div>
                <p v-if="errorMessage"><em>{{errorMessage}}</em></p>
                <div class="submit">
        	        <input v-if="!sign_in_clicked" type='submit' class='button' @click="handleSubmit" value ='Log In' />
        	        <input v-else type='submit' class='button clicked' value ='Logging In' />
                </div>
	        </form>
	        <a class ="resetPassword" href="/recoverpassword">Forgot Password?</a><br>
	        <span>New to Trivial? <a href="/register">Sign Up</a></span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "../assets/stylesheets/includes/auth";

.text-field {
    margin-bottom: 20px;
}

.submit{
    margin: 30px 0 30px 266px;
}

.resetPassword{
    margin: 20px 0;
    display: inline-block;
}
</style>

<script>
import TrackingService from '../../lib/TrackingService';
import store from '../store'

TrackingService.identifyLandingReferer();
export default {
    created() {
        store.dispatch('setIsAuthenticated', {isAuthenticated: false});
    },
    data(){
        return {
            state: null,
            errorMessage: null,
            sign_in_clicked: false,
            email: '',
            password:''
        }
    },
    methods: {
        async handleSubmit(e){
            e.preventDefault()
            this.sign_in_clicked = true

            let email = this.email
		    let password = this.password

		    let response = await fetch(`${this.$store.state.trivialApiUrl}/auth/sign_in`, {
		    	method: 'post',
                mode: 'cors',
		    	headers: {'content-type': 'application/json'},
		    	body: JSON.stringify({
		    		email: email,
		    		password: password
		    	})
		    })
            this.handleResponse(response, await response.json())
		    .catch(error => this.handleSignInError(error))
        },

        async handleResponse(response, data){
            if (!data.data.id) {
		    	this.handleSignInError(data)
		    } else {
                store.dispatch('signIn', {
                    accessToken: response.headers.get('access-token'),
                    client: response.headers.get('client'),
                    expiry: response.headers.get('expiry'),
                    uid: response.headers.get('uid'),
                    user: data.data
                })
                this.sign_in_clicked = false
                let user = {
                    'Name': data.data.name,
                    'Email': data.data.email,
                    'ID': data.data.id
                }
                TrackingService.identify(user)
                TrackingService.track('User Signin', user)
                window.location = '/'
		    }
        },

        handleSignInError(e) {
            this.password = ''
            this.sign_in_clicked = false
		    if (e && e.errors) {
                this.errorMessage = e.errors
		    	console.log(`[SignIn] Error: ${e.errors}`)
		    } else {
                this.errorMessage = 'Unable to login, please try again.'
		    	console.log(`[SignIn] Error: ${e}`)
		    }
        }
    }
}
</script>