<script>
export default {
  props: {
    password: String,
    confirm_password: String,
    enable_confirm_password: {
      type: Boolean,
      required: false,
      default: false,
    },
    displayPasswordMatchErr: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    hasUpperCase() {
      return /[A-Z]/.test(this.password);
    },
    hasLowerCase() {
      return /[a-z]/.test(this.password);
    },
    hasSymbol() {
      return /[!@#$%^&*()_+{}\[\]:;<>,.?~\\\-]/.test(this.password);
    },
    hasDigit() {
      return /[1-9]/.test(this.password);
    },
    hasLength() {
      return this.password.length >= 12;
    },
    passwordMatch() {
      return this.password === this.confirm_password;
    },
    isPasswordValid() {
      let result =
        this.hasUpperCase &&
        this.hasLowerCase &&
        this.hasSymbol &&
        this.hasDigit &&
        this.hasLength;
      let confirm_password_result = this.enable_confirm_password
        ? result && this.passwordMatch
        : result;
      console.log(confirm_password_result);
      return confirm_password_result;
    },
  },
  watch: {
    isPasswordValid: function () {
      this.$emit("passwordValidity", this.isPasswordValid);
    },
  },
};
</script>
<template>
  <div id="password-verify-container">
    <div v-if="enable_confirm_password" id="password-match-container">
      <!-- Password match should only be displayed after user has clicked on confirm_password input -->
      <span class="error-icon" v-if="displayPasswordMatchErr && !passwordMatch">
        <span class="message">Passwords Must Match</span>
      </span>
    </div>
    <p id="password-note">Password Must Contain:</p>
    <ul>
      <li :class="!hasSymbol ? 'error' : 'success'">
        1 Symbol or Special Character
      </li>
      <li :class="!hasUpperCase ? 'error' : 'success'">1 Uppercase</li>
      <li :class="!hasLowerCase ? 'error' : 'success'">1 Lowercase</li>
      <li :class="!hasDigit ? 'error' : 'success'">1 Digit</li>
      <li :class="!hasLength ? 'error' : 'success'">
        Minimum Length of 12 Characters
      </li>
    </ul>
  </div>
</template>
<style lang="scss" scoped>
#password-verify-container {
  text-align: left;
}
li.error {
  background-image: var(--x-symbol-icon);
  color: var(--error);
}
li.success {
  background-image: var(--checkmark-icon);
  color: var(--success);
}
li {
  margin-bottom: 3px;
  background-repeat: no-repeat;
  background-size: 13px;
  background-position: left center;
  padding-left: 25px;
  font-weight: lighter;
}
ul {
  margin-top: 0;
  margin-bottom: 20px;
  padding-left: 0;
  list-style-type: none;
}
#password-note {
  margin-bottom: 10px;
  margin-top: 0px;
}
span.error-icon {
  background-image: var(--error-icon);
  background-repeat: no-repeat;
  background-position: left center;

  span.message {
    margin-left: 1.5em;
    line-height: 3em;
  }
}
#password-match-container {
  height: 3em;
  margin-top: 5px;
}
</style>
