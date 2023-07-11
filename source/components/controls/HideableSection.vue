<script>
  export default {
    props: {
      initiallyHidden: {
        type: Boolean,
        default: false
      },
      displayName: {
        type: String,
        default: 'Info'
      }
    },

    data() {
      return {
        show: true,
        contentHeight: 0,
        observer: null
      }
    },

    created() {
      this.show = ! this.initiallyHidden
    },

    mounted() {
      this.updateContentHeight()
      this.observer = new ResizeObserver(() => this.updateContentHeight())
      this.observer.observe(this.$refs.inner)
    },

    beforeDestroy() {
      this.observer.disconnect()
    },

    computed: {
      blindHeight() {
        if (this.show) {
          this.updateContentHeight()
          return this.contentHeight ? `${this.contentHeight}px` : undefined
        } else {
          return '0px'
        }
      }
    },

    methods: {
      updateContentHeight() {
        if (this.$refs.inner) {
          this.contentHeight = this.$refs.inner.offsetHeight
        } else {
          this.contentHeight = 0
        }
      },

      toggle() {
        this.show = ! this.show
      }
    }
  }
</script>

<template>
  <div class="hideable">
    <button class="toggle" :class="{closed: !show}" @click="toggle">{{displayName}}</button>
    <div class="blind" :class="{open: show}" :style="{height: blindHeight}">
      <div ref="inner" class="inner-container">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .hideable {
    position: relative;
    box-sizing: border-box;
    min-height: 1em;
    margin-bottom: 2em;

    .toggle {
      position: absolute;
      top: 0;
      background-color: transparent;
      color: var(--on-secondary);
      cursor: pointer;
      padding-left: 20px;
      text-transform: uppercase;

      &:before {
        content: '';
        position: absolute;
        top: 3px;
        left: 0;
        width: 0;
        height: 0;
        border: 6px solid transparent;
        border-bottom-color: var(--accent);
        opacity: .8;
      }

      &.closed:before {
        top: 9px;
        border-bottom-color: transparent;
        border-top-color: var(--accent);
      }
    }

    .blind {
      overflow: hidden;
      transition: height 250ms ease-in-out;

      &.open {
        overflow: visible;
      }
    }

    .inner-container {
      margin-left: 8em;
      border-left: 1px solid var(--on-background-20);
      padding-left: 2em;
    }

  }
</style>
