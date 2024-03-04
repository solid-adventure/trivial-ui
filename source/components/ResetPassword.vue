<template>
    <div class="overlay">
        <div class="container">
            <span class="brand"><img /></span>
            <h3 id = "reset-password-title">Change password:</h3>
            <form id='resetPasswordForm'>
                <div>
                    <input type='password' class='text-field' placeholder ='New Password' v-model='new_password'/>
                </div>
                <div>
                    <input
                        id = "confirm-password-input"
                        @focus = "hasClickedConfirmPassword = true"
                        type='password' :class="isPasswordMatching? 'text-field-error' : 'text-field'"
                        placeholder ='Confirm Password'
                        v-model='confirm_password'
                    />
                </div>
                <PasswordValidator
                :password="new_password"
                :confirm_password="confirm_password"
                :enable_confirm_password="true"
                :hasClickedConfirmPassword="hasClickedConfirmPassword"
                @passwordValidity="updatePasswordValidity"
                @passwordMatch="updatePasswordMatch"
                />
                <div class = "message-container">
                    <transition name="fade">
                        <span v-if="errorMessage"><em>{{errorMessage}}</em></span>
                    </transition>
                    <transition name="fade">
                        <div v-if="message" class="message">{{message}}</div>
                    </transition>
                </div>
                <div class="submit">
        	        <input v-if="!submit_clicked" type='submit' class='button' @click="handleSubmit" value ='Submit' :disabled="!isPasswordValid"/>
        	        <input v-else type='submit' class='button clicked' value ='Updating...' />
                </div>
	        </form>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "../assets/stylesheets/includes/auth";

.container h2{
    text-align: center;
    margin: 2em 1em;
}

.text-field {
    margin-bottom: 30px;
}

.submit{
    margin: 30px 0 45px 266px;
}

.register{
    margin: 20px 0;
    display: inline-block;
}

.overlay{
    height: calc(100% - 80px);
    width: 100%;
    float: right;
}
#reset-password-title {
    text-align: left;
    margin-left: 0;
}
#confirm-password-input {
  margin-bottom: 0;
}
span.brand{
    display: block;
    margin-top: 100px;
}
</style>

<script>
import { fetchJSON } from 'trivial-core/lib/component-utils'
import PasswordValidator from './builderv2/PasswordValidator.vue'

export default {
    components: { PasswordValidator },
    data(){
        return {
            errorMessage: null,
            message: null,
            submit_clicked: false,
            new_password: '',
            confirm_password:'',
            isPasswordValid: false,
            hasClickedConfirmPassword: false,
            isPasswordMatching: false
        }        
    },

    methods: {
        
        async handleSubmit(e){
            e.preventDefault()
            this.submit_clicked = true
            try {
              let update = await fetchJSON('/proxy/trivial', {
                method: 'put',
                headers: {'content-type': 'application/json'},
                body: JSON.stringify({
                  path: '/auth/password',
                  password: this.new_password,
                  password_confirmation: this.confirm_password,
                })
              })
              this.message = 'Password successfully updated!'
              setTimeout(() => { this.message = null}, 2500)
              window.location = '/'
            } catch (err) {
                console.log('[ChangePassword][handleSubmit] Error: ', err)
                this.errorMessage = err
                setTimeout(() => { this.errorMessage = null}, 2500)
            }
            this.submit_clicked = false
            this.new_password = ''
            this.confirm_password = ''

        },
        updatePasswordValidity(value){
          this.isPasswordValid = value
        },
        updatePasswordMatch(value){
          this.isPasswordMatching = value
        }
    }
}
</script>