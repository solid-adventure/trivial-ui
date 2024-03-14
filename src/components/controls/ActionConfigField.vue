<template>
  <div :key="name" class="field" :class="{required: field.required}">
    <label :for="`action_config_${name}`" class="action-config">
      {{humanize(name)}}
      <ToolTip v-if="field.help" :value="field.help" align="left" size="medium" class="help-tip">
        <svg class="icon" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 9C9 5.49997 14.5 5.5 14.5 9C14.5 11.5 12 10.9999 12 13.9999" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 18.01L12.01 17.9989" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </ToolTip>
    </label>
    <div class="value-wrapper">
      <input :type="inputType" :id="`action_config_${name}`" class="code-entry" :value="valueOf(config[name])" @input="input">
      <span v-if="field.secret" class="show-hide" @click="reveal = ! reveal">
        <svg v-if="!reveal" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 12C19.1114 14.991 15.7183 18 12 18C8.2817 18 4.88856 14.991 3 12C5.29855 9.15825 7.99163 6 12 6C16.0084 6 18.7015 9.1582 21 12Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-if="reveal" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3L21 21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10.5 10.6771C10.1888 11.0296 10 11.4928 10 12C10 13.1045 10.8954 14 12 14C12.5072 14 12.9703 13.8112 13.3229 13.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7.36185 7.5611C5.68002 8.73968 4.27894 10.4188 3 12C4.88856 14.991 8.2817 18 12 18C13.5499 18 15.0434 17.4772 16.3949 16.6508" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 6C16.0084 6 18.7015 9.1582 21 12C20.6815 12.5043 20.3203 13.0092 19.922 13.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  label.action-config {
    text-transform: capitalize;
  }

  .value-wrapper {
    display: flex;
    flex-direction: column;
    position: relative;

    .show-hide {
      position: absolute;
      width: 1em;
      height: 1em;
      top: .75em;
      right: 2em;
      opacity: .4;
      cursor: pointer;

      svg {
        height: 1em;
        width: auto;
      }
    }
  }

  .help-tip {
    display: inline-block;
    text-transform: none;

    .icon {
      height: 1em;
      width: auto;
    }
  }
</style>

<script>
  import ToolTip from './ToolTip.vue'

  export default {
    components: {
      ToolTip
    },

    props: {
      name: String,
      field: Object,
      config: Object,
      credentials: Object
    },

    data() {
      return {
        reveal: false
      }
    },

    computed: {
      inputType() {
        if (this.field.secret) {
          return this.reveal ? 'text' : 'password'
        } else {
          return 'text'
        }
      }
    },

    methods: {
      isCredentialRef(val) {
        return val && val.hasOwnProperty('$ref')
      },

      credentialValue(ref) {
        return this.credentials[ref.$ref[0]][ref.$ref[1]]
      },

      valueOf(val) {
        return this.isCredentialRef(val) ? this.credentialValue(val) : val
      },

      setCredentialValue(ref, value) {
        return this.credentials[ref.$ref[0]][ref.$ref[1]] = value
      },

      setValue(name, val) {
        if (this.isCredentialRef(this.config[name])) {
          this.setCredentialValue(this.config[name], val)
        } else {
          this.config[name] = val
        }
      },

      humanize: function(value) {
        return String(value).replaceAll('_', ' ')
      },

      input: function(event) {
        this.setValue(this.name, event.target.value)
      }
    }
  }
</script>
