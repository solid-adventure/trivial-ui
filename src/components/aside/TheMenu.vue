<template>
	<aside class="menu" :class="{ 'close': close }">
		<button class="menu__close--btn" @click="closeMenu">
			<Icon :icon="menuBtnIcon" />
		</button>

		<RouterLink to="/" class="menu__logo" />

		<Naviagation />
	</aside>
</template>

<script setup>
	import { Icon } from '@iconify/vue'
	import { ref, computed } from 'vue'
	import { RouterLink } from 'vue-router'
	import Naviagation from './Naviagation.vue'

	let close = ref(false)

	const menuBtnIcon = computed(() => close.value ? 'fa6-solid:angle-right' : 'fa6-solid:angle-left')

	const closeMenu = () => close.value = !close.value
</script>