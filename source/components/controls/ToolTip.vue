<template>
  <div class="tool-tip">
    <div class="tip" ref="tip" :class="[align, size]">{{value}}</div>
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
  .tool-tip {
    position: relative;

    .tip {
      background: var(--tool-tip-background);
      color: var(--tool-tip-color);
      box-shadow: 2px 2px 2px rgba(0, 0, 0, .4);
      position: absolute;
      white-space: nowrap;
      border-radius: 2px;
      padding: .5em 1em;
      bottom: 100%;
      transform-origin: top;
      margin-bottom: 10px;
      font-size: 1rem;
      z-index: 2;
      opacity: 0;
      visibility: hidden;
      transition: opacity 300ms;
      box-sizing: border-box;

      &.right {
        right: 0;
        transform: translate(10px, 4px);
      }

      &.left {
        left: 0;
        transform: translate(-10px, 4px);
      }

      &.medium {
        width: 20em;
        white-space: normal;
      }
    }

    &:after {
      width: 0;
      height: 0;
      border: 5px solid transparent;
      border-top-color: var(--tool-tip-background);
      content: '';
      position: absolute;
      top: -6px;
      transform-origin: top;
      left: 50%;
      transform: translate(-50%, 0);
      z-index: 3;
      opacity: 0;
      visibility: hidden;
      transition: opacity 300ms;
    }

    &:hover .tip, &:hover:after {
      visibility: visible;
      opacity: 1;
    }
  }
</style>

<script>
  export default {
    props: {
      value: {
        type: String,
        required: true
      },
      sizeTo: {
        type: Element,
        required: false
      },
      sizeToAncestor: {
        type: String,
        required: false
      },
      align: {
        default: 'right',
        validator: (value) => ['right', 'left'].indexOf(value) !== -1
      },
      size: {
        default: '',
        validator: (value) => ['', 'medium'].indexOf(value) !== -1
      }
    },

    data() {
      return {
        observer: null
      }
    },

    mounted() {
      if (this.sizeTo) {
        this.observe(this.sizeTo)
      } else if (this.sizeToAncestor) {
        this.observeAncestor(this.sizeToAncestor)
      }
    },

    beforeDestroy() {
      this.disconnect()
    },

    watch: {
      sizeTo(newValue) {
        this.observe(newValue)
      }
    },

    methods: {
      disconnect() {
        if (this.observer) {
          this.observer.disconnect()
          this.observer = null
        }
      },

      observe(elem) {
        this.disconnect()
        this.observer = new ResizeObserver(() => this.resized(elem))
        this.observer.observe(elem)
        this.resized(elem)
      },

      observeAncestor(name) {
        let parent = (this.$el || {}).parentNode
        while (parent && String(parent.tagName).toLowerCase() !== name) {
          parent = parent.parentNode
        }
        if (parent) {
          this.observe(parent)
        }
      },

      resized(elem) {
        if (elem) {
          this.$refs.tip.style = ''
          if (this.$refs.tip.offsetWidth > elem.offsetWidth) {
            this.$refs.tip.style =
              `width: ${elem.offsetWidth}px; white-space: normal;`
          }
        }
      }
    }
  }
</script>
