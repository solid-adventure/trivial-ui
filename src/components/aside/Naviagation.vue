<template>
	<nav class="aside__nav">
		<RouterLink v-for="(value, index) in menuItems" :key="index" :to="value.path" class="aside__nav__link">
			<div>
				<i :class="value.icon"></i>
				<span>{{ value.title }}</span>
			</div>
		</RouterLink>
	</nav>
</template>

<script setup>
	import { RouterLink } from 'vue-router'
	import { ref } from 'vue'

	const menuItems = ref([
		{ path: "/dashboard", title: 'Dashboard', icon: 'fa-solid fa-house' },
		{ path: "/#", title: 'Sales', icon: 'fa-solid fa-sack-dollar' },
		{ path: "/#", title: 'Inventory', icon: 'fa-solid fa-shirt' },
		{ path: "/contract", title: 'Contracts', icon: 'fa-solid fa-file-pen' },
		{ path: "/#", title: 'Transactions', icon: 'fa-solid fa-book-open' },
		{ path: "/settings", title: 'Settings', icon: 'fa-solid fa-gear' }
	])
</script>