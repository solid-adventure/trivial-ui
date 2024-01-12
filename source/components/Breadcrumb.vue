<template>
  <div class="Breadcrumb">
    <span v-for="(breadcrumb, i) in breadcrumbs"
      >{{ `${i > 0 ? " > " : ""}` }} <a :href="breadcrumb.link">{{`${breadcrumb.display}` }}</a></span
    >
  </div>
</template>

<style lang="scss" scoped>
.Breadcrumb {
  background-color: var(--super-bar-background);
  color: var(--on-primary-darker);
  font-size: 1em;
  position: fixed;
  top: 80px;
  padding-left: 2em;
  // left: 0;
  width: 100%;
  height: 40px;
  line-height: 40px;
  white-space: nowrap;
  z-index: 100;
  vertical-align: middle;

  // span {
  //   padding: 0 0em;
  // }

  a {
    color: var(--on-primary-darker);
  }
}
</style>

<script>
export default {
  data() {
    return {};
  },
  props: ["breadcrumbs"],

  methods: {},
};
</script>
