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
	        <RouterLink class ="resetPassword" to="/recoverpassword">Forgot Password?</RouterLink><br>
	        <span>New to Trivial? <RouterLink to="/register">Sign Up</RouterLink></span>
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
import { useRouter } from 'vue-router';

TrackingService.identifyLandingReferer();
export default {
    data(){
        return {
            state: null,
            errorMessage: null,
            sign_in_clicked: false,
            email: '',
            password:'',
            router: useRouter()
        }
    },
    methods: {
        async handleSubmit(e){
            e.preventDefault()
            this.sign_in_clicked = true
            try {
                let user = await this.$store.state.Session.create(this.email, this.password)
                this.sign_in_clicked = false
                this.password = ''
                let identity = {
                    'Name': user.name,
                    'Email': user.email,
                    'ID': user.id
                }
                TrackingService.identify(identity)
                TrackingService.track('User Signin', identity)

                const redirectPath = sessionStorage.getItem('redirectPath') || '/';
                sessionStorage.removeItem('redirectPath'); // Clear the saved path
                window.location.href = redirectPath
            } catch(e) {
                this.handleSignInError(e)
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