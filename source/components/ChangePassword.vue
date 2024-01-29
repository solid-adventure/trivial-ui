<template>
    <div class="overlay">
        <a href="/settings">Return to Settings</a>
        <div class="container">
            <h2>Change Password</h2>
            <form id='resetPasswordForm'>
                <div>
                    <input type='password' class='text-field' placeholder ='Current Password' v-model='current_password'/>
                </div>
                <div>
                    <input type='password' class='text-field' placeholder ='New Password' v-model='new_password'/>
                </div>
                <div>
                    <input type='password' class='text-field' placeholder ='Confirm Password' v-model='confirm_password'/>
                </div>
                <transition name="fade">
                    <p v-if="errorMessage"><em>{{errorMessage}}</em></p>
                </transition>
                <transition name="fade">
                    <div v-if="message" class="message">{{message}}</div>
                </transition>
                <ActionButton class = "button-small submit" :action="handleSubmit" value ="Submit" working-value="Updating..."></ActionButton>
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
    margin-bottom: 20px;
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
    width: 80%;
    float: right;
}

.overlay a{
    position: absolute;
    float: left;
    left: 20%;
    top: 120px;
    font-size: 16px;
  	margin: 3.33em 2em 2em;
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
            errorMessage: null,
            message: null,
            submit_clicked: false,
            current_password: '',
            new_password: '',
            confirm_password:''
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
                  current_password: this.current_password,
                })
              })
              this.message = 'Password successfully updated!'
              setTimeout(() => { this.message = null}, 2500)
            } catch (err) {
                console.log('[ChangePassword][handleSubmit] Error: ', err)
                this.errorMessage = err.message
                setTimeout(() => { this.errorMessage = null}, 2500)
            }
            this.submit_clicked = false
            this.current_password = ''
            this.new_password = ''
            this.confirm_password = ''
        }
    }
}
</script>
