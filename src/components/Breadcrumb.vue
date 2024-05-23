<template>
  <div class="breadcrumbs">
    <span v-for="(breadcrumb, i) in breadcrumbs" :key="i" class="breadcrumb">
      <span v-if="i > 0" class="delimiter">/</span>
      <RouterLink :to="breadcrumb.link" class="item" :class="{ 'item__last': !(i < breadcrumbs.length - 1) }">{{ breadcrumb.display }}</RouterLink>
    </span>
  </div>
</template>

<script setup>
  defineProps({
    breadcrumbs: {
      type: Array,
      required: true,
      default: []
    }
  })
</script>