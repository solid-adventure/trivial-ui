<template>
    <label class="switch">
      <input type="checkbox" @input="emitClick" :checked="modelValue">
      <span class="slider round" :class="{toggled: modelValue}" :style="{background: backgroundColor}">
        <Icon v-if="modelValue && onIcon" :icon="onIcon"></Icon>
        <Icon v-if="!modelValue && offIcon" :icon="offIcon"></Icon>
      </span>
      <span class="on-off-label" v-if="displayOnOff">{{ onOff }}</span>
    </label>
</template>

<style lang="scss" scoped>

.switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 20px;
  line-height: 6px;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  -webkit-transition: .3s;
  transition: .3s;
}

.slider.toggled{
  flex-direction: row-reverse;
}

.icon-wrapper{
  z-index: 1;
  height: 16px;
  width: 16px;
  margin-inline: 3px;
  fill: #ffffff;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 1px;
  background-color: var(--primary);
  -webkit-transition: .4s;
  transition: .4s;
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--primary);
}

input:checked + .slider:before {
  -webkit-transform: translateX(20px);
  -ms-transform: translateX(20px);
  transform: translateX(20px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.on-off-label {
  margin-left: 48px;
  cursor: pointer;

}

</style>

<script>
import Icon from '../Icon.vue'
export default {
  components: {
    Icon
  },

  props: {
    modelValue: {
      type: Boolean,
      default: true,
      required: true
    },
    displayOnOff: {
      type: Boolean,
      default: false,
      required: false
    },
    offIcon:{
      type: String,
      required: false
    },
    onIcon:{
      type: String,
      required: false
    },
    themeOverride: {
      type: String,
      required: false
    }
  },

  computed: {
    onOff() {
      return this.modelValue ? "ON" : "OFF"
    },

    backgroundColor() {
      if (this.themeOverride) {
        return `var(--toggle-background-${this.themeOverride})`
      }
      return 'var(--on-background-20)'
    }

  },

  methods: {
    emitClick(event){
      this.$emit('update:modelValue', event.currentTarget.checked)
    }
  }
}
</script>