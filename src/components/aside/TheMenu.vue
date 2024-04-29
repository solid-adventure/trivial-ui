<template>
	<aside class="menu" :class="{ 'close': close }">
		<button class="menu__close--btn" @click="closeMenu">
			<Icon :icon="menuBtnIcon" />
		</button>

		<RouterLink to="/">
			<img :src="menuLogoImg" alt="Logo image" class="menu__logo" />
		</RouterLink>

		<Naviagation />
	</aside>
</template>

<script setup>
	import { Icon } from '@iconify/vue'
	import { ref, computed } from 'vue'
	import { RouterLink } from 'vue-router'
	import LogoImg from '../../assets/images/trivial-logo-light-warm.svg'
	import LogoImgArrows from '../../assets/images/trivial-logo-arrows-warm.svg'
	import Naviagation from './Naviagation.vue'

	let close = ref(false)

	const closeMenu = () => close.value = !close.value

	const menuLogoImg = computed(() => close.value ? LogoImgArrows : LogoImg)
	const menuBtnIcon = computed(() => close.value ? 'fa6-solid:angle-right' : 'fa6-solid:angle-left')
</script>