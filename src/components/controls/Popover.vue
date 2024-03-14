<template>
  <div class="container" data-container="body">

    <div class="popover" :ref="id" :class="[align, size, display]">
      <slot></slot>
    </div>
    <a href="#" @click.prevent="toggle()" :class="{'trigger-open': open}">{{value}}</a>
  </div>
</template>

<style lang="scss" scoped>
  .container {
    position: relative;

    textarea.prompt {
      width: 350px;
      height:100px;
      font-weight: 100;
      outline: 0;
      border: 1px solid var(--accent);
      resize: none;
      font-size: 1em;
      display: block;
    }

    p.instructions {
      text-align: left;
    }

    .v-space {
      margin-top: 1em;
      margin-bottom: 1em;
    }

    .trigger-open::after {
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
    }

    .open {
      opacity: 100;
      visibility: visible;
    }

    .closed {
      opacity: 0;
      visibility: hidden;
    }

    .popover {
      border: 2px solid var(--accent-20);
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
      transition: opacity 300ms;
      box-sizing: border-box;
      // opacity: 0;
      // visibility: hidden;

      &.right {
        right: 0;
        transform: translate(10px, 4px);
      }

      &.left {
        left: 0;
        transform: translate(-10px, 4px);
      }

      &.medium {
        white-space: normal;
      }

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
      },
      id: {
        default: '',
        required: false
      },
      open: {
        type: Boolean,
        required: true
      }
    },

    data() {
      return {

        observer: null,
        // open: false
      }
    },

    mounted() {
      if (this.sizeTo) {
        this.observe(this.sizeTo)
      } else if (this.sizeToAncestor) {
        this.observeAncestor(this.sizeToAncestor)
      }
    },

    beforeUnmount() {
      this.disconnect()
    },

    watch: {
      sizeTo(newValue) {
        this.observe(newValue)
      }
    },

    computed: {
      display() {
        return this.open ? 'open' : 'closed'
      }
    },

    methods: {

      toggle() {
        this.$emit('toggleOpen')
      },

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
