<script>

export default {
  props: {
    password: String,
  },
  computed: {
    hasUpperCase(){
      return /[A-Z]/.test(this.password)
    },
    hasLowerCase(){
      return /[a-z]/.test(this.password)
    },
    hasSymbol(){
      return /[^A-Za-z0-9]/.test(this.password)
    },
    hasDigit(){
      return/[1-9]/.test(this.password)
    },
    hasLength(){
      return this.password.length >= 12
    },
    isPasswordValid(){
      let result = this.hasUpperCase && this.hasLowerCase && this.hasSymbol && this.hasDigit && this.hasLength
      return result
    }
    },
    watch: {
      'isPasswordValid': function(){
        this.$emit('passwordValidity', this.isPasswordValid)
      }
  }
};
</script>
<template>
  <div id="password-verify-container">
    <p id = "password-note">Password Must Contain:</p>
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
li.error{
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

</style>
