<template>
  <div class="breadcrumbs">
    <span v-for="(breadcrumb, i) in breadcrumbs" :key="i" class="breadcrumb">
      <span v-if="i > 0" class="delimiter">/</span>
      <RouterLink :to="breadcrumb.link" class="item" :class="{ 'item__last': !(i < breadcrumbs.length - 1) }">{{ breadcrumb.display }}</RouterLink>
    </span>
  </div>
</template>

<style lang="scss" scoped>
/*.Breadcrumb {
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
  border-top: 1px solid var(--super-bar-background-active);

  .lastBreadcrumb {
    font-weight:700;
  }
  .littleBreadcrumb {
    font-weight:100;
  }

  a {
    color: var(--on-primary-darker);
  }
}*/
</style>

<script>
  export default {
    props: ["breadcrumbs"]
  }
</script>
