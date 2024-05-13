<template>
	<nav class="aside__nav">
		<RouterLink v-for="(value, index) in menuItems" :key="index" :to="value.path" class="aside__nav__link">
			<div>
				<Icon :icon="value.icon" />
				<span>{{ value.title }}</span>
			</div>
		</RouterLink>

		<template v-if="isAppId">
			<template v-for="(value, index) in menuItems">
				<RouterLink v-for="(sublink, index) in value?.sublinks" :key="index" :to="`/apps/${appName}${sublink.path}`" class="aside__nav__link aside__nav__link--sublink">
					<div>
						<Icon :icon="sublink.icon" />
						<span>{{ sublink.title }}</span>
					</div>
				</RouterLink>
			</template>
		</template>
	</nav>
</template>

<script setup>
	import { Icon } from '@iconify/vue';
	import { RouterLink } from 'vue-router'
	import { ref, computed } from 'vue'
	import { useStore } from 'vuex'

	const menuItems = ref([
		{ path: "/dashboard", title: 'Dashboard', icon: 'fa6-solid:house' },
		{ path: "/registers", title: 'Sales', icon: 'fa6-solid:sack-dollar' },
		//{ path: "/#", title: 'Inventory', icon: 'fa6-solid:shirt' },
		{ 
			path: "/contract", 
			title: 'Contracts', 
			icon: 'fa6-solid:file-pen',
			sublinks: [
				{
					path: "/builder2",
					title: "Editor",
					icon: 'fa6-solid:pen'
				},
				{
					path: "/activity",
					title: "Activity Log",
					icon: 'fa6-solid:clipboard-list'
				},
				{
					path: "/settings2",
					title: "Settings",
					icon: 'fa6-solid:gear'
				}
			]
		},
		//{ path: "/#", title: 'Transactions', icon: 'fa6-solid:book-open' },
		//{ path: "/settings", title: 'Settings', icon: 'fa6-solid:gear' }
	]),
	store = useStore()

	const isAppId = computed(() => store.state.app.name ? true : false)
	const appName = computed(() => store.state.app.name)
</script>