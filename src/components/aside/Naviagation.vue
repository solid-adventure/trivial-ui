<template>
	<nav class="aside__nav">
		<RouterLink v-for="(value, index) in menuItems" :key="index" :to="value.path" class="aside__nav__link">
			<div>
				<Icon :icon="value.icon" />
				<span>{{ value.title }}</span>
			</div>
		</RouterLink>

		<template v-if="app.id">
			<template v-for="(value, index) in menuItems">
				<RouterLink v-for="(sublink, index) in value?.sublinks" :key="index" :to="`/apps/${app.name}${sublink.path}`" class="aside__nav__link aside__nav__link--sublink">
					<div>
						<Icon :icon="sublink.icon" />
						<span>{{ sublink.title }}</span>
					</div>
				</RouterLink>
			</template>
		</template>
	</nav>

	<nav class="aside__nav aside__nav--secundary">
		<RouterLink :to="orgSettingsPath" class="aside__nav__link">
			<div>
				<Icon icon="fa6-solid:gear" />
				<span>Settings</span>
			</div>
		</RouterLink>
	</nav>
</template>

<script setup>
	import { Icon } from '@iconify/vue';
	import { RouterLink } from 'vue-router'
	import { ref, computed, onMounted } from 'vue'
	import { useStore } from 'vuex'
	import { useLocalStorage } from '@vueuse/core'

	const menuItems = ref([
		{ path: "/dashboard", title: 'Dashboard', icon: 'fa6-solid:house' },
		{ path: "/sales", title: 'Sales', icon: 'fa6-solid:sack-dollar' },
		{ path: "/invoices", title: 'Invoices', icon: 'fa6-solid:shirt' },
		{ 
			path: "/contracts",
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
	]),
	store = useStore()

	onMounted(() => {})

	const app = computed(() => store.state.app)
	const orgId = computed(() => useLocalStorage('orgId').value)
	const orgSettingsPath = computed(() => `/organization-settings/${orgId.value}`)

</script>