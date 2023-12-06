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
                          <input type='password' class='text-field' placeholder ='Confirm Password' v-model='confirm_password'/>
                      </div>

                    </span>
                    <transition name="fade">
                        <p v-if="errorMessage"><em>{{errorMessage}}</em></p>
                    </transition>
                    <transition name="fade">
                        <div v-if="message" class="message">{{message}}</div>
                    </transition>
                    <ActionButton class = "button-small submit" :action="handleSubmit" value ="Submit" working-value="Updating..."></ActionButton>
                    <p v-if="existingUser">
                      Need to create an account? <a href="/" @click.prevent="handleNewUserClick" >Sign up</a>
                    </p>
                    <p v-else>
                      Already have an account? <a href="/" @click.prevent="handleExistingUserClick" >Sign in</a>
                    </p>
                    <p>
                      Forgot Password? <a href="/recoverpassword">Reset Password</a>
                    </p>
    	        </form>
            </span>
          </div>

        </div>
    </div>
</template>

<style lang="scss" scoped>

@import "../assets/stylesheets/includes/variables";
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
    margin: 30px 0 45px 266px;
}


</style>

<script>
  import ActionButton from './controls/ActionButton.vue'
  import { fetchJSON } from 'trivial-core/lib/component-utils'

export default {
    components: { 
        ActionButton 
    },
    
    data(){
        return {
          completed: false,
          existingUser: false,
          errorMessage: null,
          message: null,
          current_password: '',
          new_password: '',
          confirm_password:''
        }        
    },

    computed: {
        // TODO leverage
        passwordMatch(){
          return this.new_password === this.confirm_password
        },

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
              path: '/auth/invitation',
              password: this.current_password,
              password_confirmation: this.current_password,
              invitation_token: this.invitationToken
            }
          } else {
            return {
              path: '/auth/invitation',
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
              let update = await fetch('/proxy/trivial', {
                method: 'PUT',
                headers: {'content-type': 'application/json'},
                body: JSON.stringify(this.acceptInvitationPayload)
              })
              this.completed = true
            } catch (err) {
                console.log('[ChangePassword][handleSubmit] Error: ', err)
                this.errorMessage = err.message
            }
            this.current_password = ''
            this.new_password = ''
            this.confirm_password = ''
        }
    }
}
</script>