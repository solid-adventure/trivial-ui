<template>
	<aside class="menu" :class="{ 'close': close }">
		<button class="menu__close--btn" @click="closeMenu">
			<i class="fa-solid" :class="{ 'fa-angle-right': close, 'fa-angle-left': !close }"></i>
		</button>

		<RouterLink to="/">
			<img :src="menuLogoImg" alt="Logo image" class="menu__logo" />
		</RouterLink>

		<Naviagation />
	</aside>
</template>

<script setup>
	import { ref, computed } from 'vue'
	import { RouterLink } from 'vue-router'
	import LogoImg from '../../assets/images/trivial-logo-light-warm.svg'
	import LogoImgArrows from '../../assets/images/trivial-logo-arrows-warm.svg'
	import Naviagation from './Naviagation.vue'

	let close = ref(false)

	const closeMenu = () => close.value = !close.value

	const menuLogoImg = computed(() => close.value ? LogoImgArrows : LogoImg)
</script>