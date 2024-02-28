<template>
  <div class="overlay">
    <div class="container">
      <span class="brand"><img /></span>
      <div v-if="registrationEnabled">
        <p>Create a new account:</p>
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
          <p v-if="errorMessage">
            <em>{{ errorMessage }}</em>
          </p>
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
        >Already have an account? <a href="/signin">Sign In</a></span
      ><br />
      <a class="resetPassword" href="/recoverpassword">Forgot Password?</a
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

.container {
  padding: 2em;
  width: unset;
}

.password-info {
  width: unset;
}
.container p {
  text-align: left;
  margin-bottom: 20px;
}

.text-field {
  margin-bottom: 30px;
}
#tos-container {
  padding-bottom: 20px;
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
    created() {
        store.dispatch("setIsAuthenticated", { isAuthenticated: false });
    },
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
            let name = this.name;
            let email = this.email;
            let password = this.password;
            let register = fetch(`/proxy/trivial`, {
                method: "post",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    path: "/auth",
                    name: name,
                    role: "member",
                    email: email,
                    password: password,
                }),
            })
                .then((response) => response.json())
                .then((data) => this.handleResponse(data))
                .catch((error) => this.handleRegisterError(error));
        },
        handleResponse(data) {
            if (!data.data.id) {
                this.handleSignUpError(data);
            }
            else {
                this.register_clicked = false;
                let user = {
                    Name: data.data.name,
                    Email: data.data.email,
                    ID: data.data.id,
                };
                TrackingService.identify(user);
                TrackingService.track("User Signup", user);
                window.location = "/";
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
