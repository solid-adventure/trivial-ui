<template>
  <div class="typeahead" :class="{expanded: open}">
    <input :class="{'has-icon': icon}" :value="value" @input="input" @keydown="keydown" @blur="blur" @focus="focus" :placeholder="placeholder">
    <svg v-if="icon" aria-hidden="true" class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!-- Font Awesome Free 5.15.3 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) --><path fill="currentColor" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"/></svg>
    <ul class="results" :class="{show: open}" ref="list">
      <li v-for="(item, idx) in results" :class="{highlighted: idx === highlightedIndex}" @mousedown="select(item)">{{item}}</li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>

  .typeahead {
    position: relative;
    display: inline-block;

    &.expanded {
      z-index: 100;
    }

    input {
      box-sizing: border-box;
      padding: .5em .25em;
      border: 1px solid var(--accent);
      border-radius: 8px;
      width: 100%;
      font-size: inherit;

      &.has-icon {
        padding-left: 2em;
      }
    }

    .icon {
      height: 1em;
      position: absolute;
      top: .75em;
      left: .5em;
    }
  }

  .results {
    position: absolute;
    top: 2.25em;
    left: 0;
    box-sizing: border-box;
    width: 100%;
    list-style: none;
    margin: 0;
    padding: .5em 0;
    max-height: 10em;
    overflow: auto;
    background-color: var(--surface);
    color: var(--on-surface);
    box-shadow: 2px 2px 4px 1px rgba(0, 0, 0, .2);
    display: none;

    &.show {
      display: block;
    }

    > li {
      text-align: left;
      cursor: pointer;
      padding: 0 .5em;

      &.highlighted {
        background-color: var(--primary);
        color: var(--on-primary);
      }
    }
  }
</style>

<script>
  import { debounce } from 'trivial-core/lib/component-utils'

  export default {
    props: {
      value: String,
      placeholder: String,
      search: {
        type: Function,
        required: true
      },
      minSearchLength: {
        type: Number,
        default: 0
      },
      debounce: {
        type: Number,
        default: 250
      },
      icon: {
        type: Boolean,
        default: false
      },
      openOnFocus: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        open: false,
        results: [],
        highlighted: null
      }
    },

    computed: {
      highlightedIndex() {
        const idx = this.results.indexOf(this.highlighted)
        return -1 === idx ? 0 : idx
      }
    },

    updated() {
      this.scrollHighlightedIntoView()
    },

    methods: {
      focus() {
        if (this.openOnFocus && ! this.open) {
          this.open = true
          this.searchFor(this.value)
        }
      },

      input(event) {
        this.$emit('input', event.target.value)
        this.open = true
        if (event.target.value.length >= this.minSearchLength) {
          this.searchFor(event.target.value)
        }
      },

      keydown(event) {
        if (!this.open) {
          if (["Enter", "ArrowUp", "ArrowDown"].indexOf(event.code) !== -1) {
            event.preventDefault()
            this.open = true
          }
          return
        }

        switch (event.code) {
        case "Escape":
          this.open = false
          event.preventDefault()
          break

        case "ArrowDown":
          this.highlightByIndex(this.highlightedIndex + 1)
          event.preventDefault()
          break

        case "ArrowUp":
          this.highlightByIndex(this.highlightedIndex - 1)
          event.preventDefault()
          break

        case "Home":
          this.highlightByIndex(0)
          event.preventDefault()
          break

        case "End":
          this.highlightByIndex(this.results.length - 1)
          event.preventDefault()
          break

        case "Enter":
        case "Tab":
          this.select(this.results[this.highlightedIndex])
          event.preventDefault()
          break
        }
      },

      blur() {
        this.open = false
      },

      select(item) {
        this.$emit('input', item)
        this.$emit('selected', item)
        this.open = false
      },

      highlightByIndex(newIndex) {
        if (this.results.length < 1) {
          this.highlighted = null
        } else if (newIndex < 0) {
          this.highlighted = this.results[0]
        } else if (newIndex >= this.results.length) {
          this.highlighted = this.results[this.results.length - 1]
        } else {
          this.highlighted = this.results[newIndex]
        }
      },

      scrollHighlightedIntoView() {
        if (this.highlightedIndex >= 0) {
          this.scrollIndexIntoView(this.highlightedIndex)
        }
      },

      scrollIndexIntoView(idx) {
        if (this.$refs.list) {
          let elem = this.$refs.list.getElementsByTagName('li')
          elem = elem ? elem[idx] : null
          if (elem) {
            elem.scrollIntoView({block: 'nearest'})
          }
        }
      },

      searchFor: debounce(async function(value) {
          this.results = await this.search(value) || [];
      }, function() { return this.debounce })
    }
  }
</script>
