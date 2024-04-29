<template>
	<nav class="aside__nav">
		<RouterLink v-for="(value, index) in menuItems" :key="index" :to="value.path" class="aside__nav__link">
			<div>
				<Icon :icon="value.icon" />
				<span>{{ value.title }}</span>
			</div>
		</RouterLink>
	</nav>
</template>

<script setup>
	import { Icon } from '@iconify/vue';
	import { RouterLink } from 'vue-router'
	import { ref } from 'vue'

	const menuItems = ref([
		{ path: "/dashboard", title: 'Dashboard', icon: 'fa6-solid:house' },
		{ path: "/registers", title: 'Sales', icon: 'fa6-solid:sack-dollar' },
		{ path: "/#", title: 'Inventory', icon: 'fa6-solid:shirt' },
		{ path: "/contract", title: 'Contracts', icon: 'fa6-solid:file-pen' },
		{ path: "/#", title: 'Transactions', icon: 'fa6-solid:book-open' },
		{ path: "/settings", title: 'Settings', icon: 'fa6-solid:gear' }
	])
</script>