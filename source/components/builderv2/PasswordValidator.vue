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
    hasClickedConfirmPassword: {
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
      return confirm_password_result;
    },
    displayPasswordMatchErr(){
      return this.hasClickedConfirmPassword && !(this.passwordMatch)
    }
  },
  watch: {
    isPasswordValid: function(){
      this.$emit("passwordValidity", this.isPasswordValid);
    },
    displayPasswordMatchErr: function(){
      this.$emit("passwordMatch", this.displayPasswordMatchErr)
    }

  },
};
</script>
<template>
  <div id="password-verify-container">
    <div v-if="enable_confirm_password" class="message-container">
      <!-- Password match should only be displayed after user has clicked on confirm_password input -->
      <span v-if="displayPasswordMatchErr">
        <span class="message">Passwords do not match</span>
      </span>
    </div>
    <p id="password-note">Password Must Contain:</p>
    <ul>
      <li :class="hasSymbol ? 'success' : 'error'">
        1 Symbol or Special Character
      </li>
      <li :class="hasUpperCase ? 'success' : 'error'">1 Uppercase</li>
      <li :class="hasLowerCase ? 'success' : 'error'">1 Lowercase</li>
      <li :class="hasDigit ? 'success' : 'error'">1 Digit</li>
      <li :class="hasLength ? 'success' : 'error'">
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
.message{
  color: var(--error);
  font-size: small;
}
</style>
