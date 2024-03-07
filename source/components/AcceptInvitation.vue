<template>
    <div class="overlay">
        <div class="container">
            <span class="brand"><img/></span>
            <div v-if="completed">
              Invitation accepted. Please <a href="/signin">sign in</a> to continue.
            </div>
            <div v-else>
              <span v-if="loggedIn && !loggedInAsInvited">You are logged in as <strong>{{currentUser.email}}</strong>, but this invitation is for <strong>{{ invitedEmail }}</strong>. Please <a href="/signout">sign out</a> before accepting this invitation.</span>
              <span v-else>
              <div v-if = "tokenIsValid">
                <h2>Accept Invitation</h2>
                <form>
                  <!-- User email is always locked -->
                    <div>
                        <input type='text' class='text-field disabled' v-model='invitedEmail' disabled=disabled/>
                    </div>

                    <!-- If it's an existing account, use the password to verify -->
                    <span v-if="existingUser">
                      <h3>Current Password</h3>
                      <div>
                          <input type='password' class='text-field' placeholder ='Password' v-model='current_password'/>
                      </div>
                    </span>

                    <!-- It's a new account, get and confirm a new password-->
                    <span v-else>
                      <h3>Set Password</h3>
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
                    </span>
                    <transition name="fade">
                        <div class = "message-container">
                          <span v-if="errorMessage">
                            <em>{{errorMessage}}</em>
                          </span>
                        </div>
                    </transition>
                    <transition name="fade">
                        <div v-if="message" class="message">{{message}}</div>
                    </transition>
                    <div v-if="existingUser">
                      <ActionButton class = "button-small submit" :action="handleSubmit" value ="Submit" working-value="Updating..."></ActionButton>
                      <p>
                        Need to create an account? <a href="/" @click.prevent="handleNewUserClick" >Sign up</a>
                      </p>
                      <p>
                        Forgot Password? <a href="/recoverpassword">Reset Password</a>
                      </p>
                    </div>
                    <div v-else>
                      <ActionButton class = "button-small submit" :action="handleSubmit" value ="Submit" working-value="Updating..." :disabled="!isPasswordValid"></ActionButton>
                      <span>
                        Already have an account? <a href="/" @click.prevent="handleExistingUserClick" >Sign in</a>
                      </span>
                    </div>
    	          </form>
              </div>
              <div v-else>
                <p v-if = "errorMessage != null && !tokenIsValid">{{ errorMessage }}</p>
                <p v-else>Invalid or expired invitation token. <br> Please contact the organization administrator for assistance.</p>
              </div>
            </span>
          </div>

        </div>
    </div>
</template>

<style lang="scss" scoped>

@import "../assets/stylesheets/includes/auth";

.container h2, h3{
    text-align: left;
}

.text-field {
    margin-bottom: 20px;
}

.disabled {
    color: var(--on-background-40);
}

.submit{
    margin: 0 0 20px 266px;
}
.clearSuperBar{
  margin-top: 50px !important;
}
#confirm-password-input {
  margin-bottom: 0;
}
</style>

<script>
  import ActionButton from './controls/ActionButton.vue'
  import { fetchJSON } from 'trivial-core/lib/component-utils'
  import PasswordValidator from './builderv2/PasswordValidator.vue'
export default {
    components: { 
        ActionButton, 
        PasswordValidator
    },

    data(){
        return {
          completed: false,
          existingUser: false,
          errorMessage: null,
          message: null,
          current_password: '',
          new_password: '',
          confirm_password:'',
          isPasswordValid: false,
          hasClickedConfirmPassword: false,
          isPasswordMatching: false,
          tokenIsValid: false

        }        
    },
    async created(){
        try {
          let result = await this.$store.state.Session.apiCall('/auth/invitation', 'PUT', {
            password: '',
            password_confirmation: '',
            invitation_token: this.invitationToken
          })
        } catch (err) {
          this.errorMessage = err.message
          if(!err.code){
            this.errorMessage = "An unexpected error occurred. Please try again later."
            return
          }
          // 422 refers to incorrect password, this implies that the invitaiton token exists
          if(err.code === 422) {
            this.tokenIsValid = true
            // To prevent errorMessage to populate when users inputs password
            this.errorMessage = null
          }
        }
    },

    computed: {

        invitationToken(){
          let params = new URLSearchParams(window.location.search);
          return params.get("invitation_token");
        },

        invitedEmail(){
          let params = new URLSearchParams(window.location.search);
          return params.get("email");
        },

        currentUser(){
          return this.$store.state.user
        },

        loggedIn() {
          return this.currentUser && this.currentUser.email
        },

        loggedInAsInvited() {
          return this.currentUser && this.invitedEmail === this.currentUser.email
        },

        acceptInvitationPayload() {

          if (this.existingUser) {
            return {
              password: this.current_password,
              password_confirmation: this.current_password,
              invitation_token: this.invitationToken
            }
          } else {
            return {
              password: this.new_password,
              password_confirmation: this.confirm_password,
              invitation_token: this.invitationToken
            }
          }
        }
    },

    methods: {

        handleExistingUserClick(e){
          e.preventDefault()
          this.existingUser = true
        },

        handleNewUserClick(e){
          e.preventDefault()
          this.existingUser = false
        },

        async handleSubmit(e){
            e.preventDefault()
            try {
              await this.$store.state.Session.apiCall('/auth/invitation', 'PUT', this.acceptInvitationPayload)
              this.completed = true
            } catch (err) {
              this.errorMessage = err.message
            }
            this.current_password = ''
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