<template>
  <div class="overlay">
    <div class="container">
      <span class="brand"><img /></span>
      <div v-if="registrationEnabled">
        <h3>Create a new account:</h3>
        <form id="registerForm" @submit="handleSubmit">
          <div>
            <input
              type="text"
              class="text-field"
              placeholder="Name"
              v-model="name"
              required
            />
          </div>
          <div>
            <input
              type="email"
              class="text-field"
              placeholder="E-mail Address"
              v-model="email"
              required
            />
          </div>
          <div>
            <input
              type="password"
              class="text-field"
              placeholder="Password"
              v-model="password"
              required
            />
          </div>
          <div class = "password-info">
            <PasswordValidator :password = "password" @passwordValidity = "updatePasswordValidity"/>
          </div>
          <div id = "tos-container">
            <input
              type="checkbox"
              class="terms-checkbox"
              name="terms"
              v-model="termsAccepted"
              required
            />
            I agree to the
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://withtrivial.com/terms-of-service"
              >Terms of Service</a
            >
            and
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://withtrivial.com/privacy"
              >Privacy Policy</a
            >
          </div>
          <div class="message-container">
            <p v-if="errorMessage">
            <em>{{ errorMessage }}</em>
          </p>
          </div>

          <div class="submit">
            <input
              v-if="!register_clicked"
              type="submit"
              class="button"
              value="Create Account"
              :disabled="!isPasswordValid"
            />
            <input
              v-else
              type="submit"
              class="button clicked"
              value="Creating..."
            />
          </div>
        </form>
      </div>
      <div v-else>
        <h2>We're sorry, signup is currently unavailable.</h2>
        <h3>Join the waitlist to get notified</h3>
        <form id="waitlistForm" @submit="handleJoinWaitlist">
          <div>
            <input
              type="email"
              class="text-field"
              placeholder="E-mail Address"
              v-model="email"
              required
            />
          </div>
          <p v-if="this.waitlistText">{{ this.waitlistText }}</p>
          <div class="submit">
            <input
              v-if="!join_waitlist_clicked"
              type="submit"
              class="button"
              value="Join Waitlist"
            />
            <input
              v-else
              type="submit"
              class="button clicked"
              value="Adding..."
            />
          </div>
        </form>
      </div>
      <span class="signIn"
        >Already have an account? <RouterLink to="/signin">Sign In</RouterLink></span
      ><br />
      <RouterLink class="resetPassword" to="/recoverpassword">Forgot Password?</RouterLink
      ><br />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../assets/stylesheets/includes/auth";

.overlay {
  flex-direction: row;
  justify-content: center;
  align-items: center;
  align-content: space-between;

}
.overlay.clearSuperBar {
  margin-top: 20px;
}

.container {
  padding: 2em;
  width: unset;
}

.password-info {
  width: unset;
}
.container h3 {
  text-align: left;
  margin-bottom: 20px;
}

.text-field {
  margin-bottom: 30px;
}

#tos-container {
  padding-bottom: 20px;
}

.submit {
  margin: 0 0 0 266px;
}

.signIn {
  margin: 20px 0;
  display: inline-block;
}

.terms-checkbox {
  margin-right: 5px;
}

#waitlistForm {
  margin-top: 50px;
}
</style>

<script>
import store from "../store";
import TrackingService from "../../lib/TrackingService";
import FeatureManager from "trivial-core/lib/FeatureManager";
import PasswordValidator from "./builderv2/PasswordValidator.vue";

TrackingService.identifyLandingReferer();
export default {
    data() {
        return {
            errorMessage: null,
            register_clicked: false,
            name: "",
            email: "",
            isPasswordValid: false,
            password: "",
            termsAccepted: false,
            waitlistText: "",
            join_waitlist_clicked: false,
        };
    },
    computed: {
        registrationEnabled: () => {
            return FeatureManager.isEnabled("registration");
        },
    },
    methods: {
        handleSubmit(e) {
            e.preventDefault();
            this.register_clicked = true;
            this.$store.state.Session.register(this.name, this.email, this.password)
            .then(user => this.handleResponse(user))
            .catch((error) => this.handleRegisterError(error));
        },
        handleResponse(user) {
            if (!user.id) {
                this.handleSignUpError(user);
            }
            else {
                this.register_clicked = false;
                let identity = {
                    Name: user.name,
                    Email: user.email,
                    ID: user.id,
                };
                TrackingService.identify(identity);
                TrackingService.track("User Signup", identity);
                window.location.href = '/'
            }
        },
        handleRegisterError(e) {
            this.password = "";
            this.register_clicked = false;
            if (e && e.errors) {
                this.errorMessage = e.errors;
                console.log(`[SignUp] Error: ${e.errors}`);
            }
            else {
                this.errorMessage = "Unable to create account, please try again.";
                console.log(`[SignUp] Error: ${e}`);
            }
        },
        handleJoinWaitlist(e) {
            e.preventDefault();
            this.join_waitlist_clicked = true;
            TrackingService.track("User Joined Waitlist", {
                email: this.email,
                type: "waitlist",
            });
            this.waitlistText = "Successfully added email to waitlist";
            this.email = "";
            this.join_waitlist_clicked = false;
        },
        updatePasswordValidity(value){
          this.isPasswordValid = value
        }
    },
    components: { PasswordValidator }
};
</script>
