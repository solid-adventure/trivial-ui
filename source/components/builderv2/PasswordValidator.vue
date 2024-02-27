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
      return this.hasUpperCase && this.hasLowerCase && this.hasSymbolhasSymbol && this.hasDigit & this.hasLength
    }
    },
    watch: {
      'password': function(){
        this.$emit('passwordValidity', this.isPasswordValid)
      }
  }
};
</script>
<template>
  <div id="password-verify-container">
    <p>Password Must Contain:</p>
    <p>{{ password }}</p>
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
.error {
  color: var(--error);
}
.success {
  color: var(--success);
}
</style>
