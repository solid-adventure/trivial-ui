<template>
  <th>
    <button @click.prevent="sort" :class="classes()">
      <slot></slot>
      <span>
        /
        <svg class="icon" stroke-width="1.5" viewBox="0 0 27 24" fill="none">
          <g transform="translate(-6 0)"><path d="M12.25 18.5V6M12.25 6L18.25 12M12.25 6L6.25 12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></g>
          <g transform="translate(9, 0)"><path d="M12.25 5.5V18M12.25 18L6.25 12M12.25 18L18.25 12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></g>
        </svg>
      </span>
    </button>
  </th>
</template>

<style lang="scss" scoped>
  th {
    border: none;
    padding: .5em;
    text-align: left;

    button {
      background: transparent;
      color: inherit;
      display: inline;
      cursor: pointer;
      margin-bottom: -.5em;
      padding-bottom: .5em;

      &.sorted {
        margin-bottom: calc(-.5em - 2px);
        border-bottom: 3px solid var(--on-background);
      }

      span {
        font-weight: 100;

        .icon {
          height: 1em;
          width: auto;
        }
      }
    }
  }
</style>

<script>
  export default {
    props: {
      name: {
        type: String,
        required: true
      },
      sortBy: {
        type: String,
        default: ''
      },
      sortAsc: {
        type: Boolean,
        default: false
      }
    },

    methods: {
      sort() {
        if (this.name === this.sortBy) {
          this.$emit('sort', {sortBy: this.name, sortAsc: ! this.sortAsc})
        } else {
          this.$emit('sort', {sortBy: this.name, sortAsc: true})
        }
      },

      classes() {
        return {
          sorted: this.name === this.sortBy
        }
      }
    }
  }
</script>
