<template>
  <div class="overlay">
    <div class="container">
      <span class="brand"><img /></span>
      <p>
        Enter the email associated with your Trivial account and we'll send you
        a link to reset your password.
      </p>
      <form id="resetPasswordForm">
        <div>
          <input
            type="text"
            class="text-field"
            placeholder="E-mail Address"
            v-model="email"
          />
        </div>
        <transition name="fade">
          <p v-if="errorMessage">
            <em>{{ errorMessage }}</em>
          </p>
        </transition>
        <transition name="fade">
          <div v-if="message" class="message">{{ message }}</div>
        </transition>
        <ActionButton
          class="button-small submit"
          :action="handleSubmit"
          value="Submit"
          working-value="Creating..."
        ></ActionButton>
      </form>
      <span class="register"
        >New to Trivial? <RouterLink to="/register">Sign Up</RouterLink></span
      ><br />
      <span>Already have an account? <RouterLink to="/signin">Sign In</RouterLink></span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../assets/stylesheets/includes/auth";

.container p {
  text-align: left;
}

.text-field {
  margin-bottom: 20px;
}

.submit {
  margin: 30px 0 45px 266px;
}

.register {
  margin: 20px 0;
  display: inline-block;
}
</style>

<script>
import ActionButton from "./controls/ActionButton.vue";

export default {
  components: {
    ActionButton,
  },

  data() {
    return {
      errorMessage: null,
      message: null,
      submit_clicked: false,
      email: "",
    };
  },

  methods: {
    async handleSubmit(e) {
      let email = this.email;
      console.log(`email ${email} submitted for new password`);
      e.preventDefault();
      this.submit_clicked = true;
      try {
        await this.$store.state.Session.apiCall('/auth/password', 'POST', {
          email,
          redirect_url: `${window.location.origin}/resetpassword`,
        });
        this.message = `An email has been sent to ${email} with instructions on how to reset the password.`;
        setTimeout(() => {
          this.message = null;
        }, 4000);
      } catch (err) {
        console.log("[RecoverPassword][handleSubmit] Error: ", err);
        this.errorMessage = err.message;
        setTimeout(() => {
          this.errorMessage = null;
        }, 2500);
      }
      this.submit_clicked = false;
      this.email = "";
    },
  },
};
</script>
