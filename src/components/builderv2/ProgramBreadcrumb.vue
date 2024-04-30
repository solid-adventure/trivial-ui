<script>

  export default {
    components: {
    },

    props: {
      value: {
        type: Object,
        required: true
      },
      selected: {
        type: Object,
        required: false
      }
    },

    computed: {

      shouldDisplay() {
        return !this.isSelected && this.selected.name
      },

      isSelected() {
        return this.selected && this.selected.type === this.value.type
      }

    },

    methods: {
      navigate(def) {
        this.$emit('navigate', def)
      }
    }
  }
</script>

<template>
  <div class="program-breadcrumb" v-if="shouldDisplay">
    <a href="#" @click.prevent="navigate(value)"><span class="value-type">{{ this.value.type }}</span></a>
    <span v-if="shouldDisplay" class="divider"> > </span>
    <span v-if="shouldDisplay" class="selected-type">{{ selected.name }}</span>
  </div>
</template>

<style lang="scss" scoped>
  div.program-breadcrumb {
    /*margin-left: 0;
    position: fixed;
    background: var(--secondary);
    width: 100%;
    padding-left: 2em;
    top: 11em;
    left: 23em;
    line-height: 2em;
    z-index: 1;*/
    
    width: 100%;
    line-height: 2em;
    background: var(--secondary);

    span.divider {
      margin: 0 0.25em;
    }

    span.selected-type {
      font-weight: 800;
    }


  }
</style>
