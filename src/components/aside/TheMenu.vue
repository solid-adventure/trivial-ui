<template>
	<aside class="menu" :class="{ 'close': close, 'open': openMobileMenu }">
		<button class="menu__close--btn desktop" @click="closeMenu">
			<Icon :icon="menuBtnIcon" class="desktop__icon" />
		</button>

		<button class="menu__close--btn mobile" @click="closeMobileMenu">
			<Icon icon="fa6-solid:xmark" />
		</button>

		<RouterLink to="/" class="menu__logo">
			<Image :src="logo" alt="Logo image" />
		</RouterLink>

		<Naviagation />
	</aside>
</template>

<script setup>
	import { Icon } from '@iconify/vue'
	import { ref, computed, watch, onMounted } from 'vue'
	import { useStore } from 'vuex'
	import { RouterLink } from 'vue-router'
	import Naviagation from './Naviagation.vue'

	// These files are often overridden in mirrored projects.
	// Do not modify without understanding the implications
	import LogoBig from '@/assets/images/trivial-logo-light-warm.svg'
	import LogoSmall from '@/assets/images/trivial-logo-arrows-warm.svg'

	const store = useStore()

	let close = ref(false),
		openMobileMenu = ref(false)

	watch(() => store.getters.getOpenMobileMenu, (newVal, oldVal) => openMobileMenu.value = newVal)

	const menuBtnIcon = computed(() => close.value ? 'fa6-solid:angle-right' : 'fa6-solid:angle-left')
	const logo = computed(() => close.value ? LogoSmall : LogoBig)

	onMounted(() => openMobileMenu.value = store.getters.getOpenMobileMenu)

	const closeMenu = () => close.value = !close.value
	const closeMobileMenu = () => {
		store.dispatch('mobileMenu', false)
		openMobileMenu.value = !openMobileMenu.value
	}
</script>