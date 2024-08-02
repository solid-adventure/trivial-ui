<template>
	<aside class="menu" :class="{ 'close': close }">
		<button class="menu__close--btn" @click="closeMenu">
			<Icon :icon="menuBtnIcon" />
		</button>

		<RouterLink to="/" class="menu__logo">
			<Image :src="logo" alt="Logo image" />
		</RouterLink>

		<Naviagation />
	</aside>
</template>

<script setup>
	import { Icon } from '@iconify/vue'
	import { ref, computed } from 'vue'
	import { RouterLink } from 'vue-router'
	import Naviagation from './Naviagation.vue'

	// These files are often overridden in mirrored projects.
	// Do not modify without understanding the implications
	import LogoBig from '@/assets/images/trivial-logo-light-warm.svg'
	import LogoSmall from '@/assets/images/trivial-logo-arrows-warm.svg'

	let close = ref(false)

	const menuBtnIcon = computed(() => close.value ? 'fa6-solid:angle-right' : 'fa6-solid:angle-left')
	const logo = computed(() => close.value ? LogoSmall : LogoBig)

	const closeMenu = () => close.value = !close.value
</script>