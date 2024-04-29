<template>
	<nav class="aside__nav">
		<template v-for="(value, index) in menuItems" :key="index" >
			<RouterLink :to="value.path" class="aside__nav__link">
				<div>
					<Icon :icon="value.icon" />
					<span>{{ value.title }}</span>
				</div>
			</RouterLink>
			<template v-for="(child, index) in (value.children || [])" :key="index" :to="child.path" >

				<!-- TODO Replace with actual style and app.descriptive_name, if present -->
				<span v-if="index === 0" style="color:white;font-size=12px;">Sample Contract - 2002</span>

				<RouterLink :to="child.path" class="aside__nav__link_child">
					<div>
						<span>{{ child.title }}</span>
					</div>
				</RouterLink>
			</template>

		</template>





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
		{ path: "/contract", title: 'Contracts', icon: 'fa6-solid:file-pen',

		// TODO Children only display if there is an app_id, e.g.: http://localhost:5173/apps/84129f6431b7d7/builder2
			children: [
				{
					path: "builder2",
					title: "Editor"
				},
				{
					path: "activity",
					title: "Activity Log"
				},
				{
					path: "settings2",
					title: "Settings"
				}

			]
		},
		{ path: "/#", title: 'Transactions', icon: 'fa6-solid:book-open' },
		{ path: "/settings", title: 'Settings', icon: 'fa6-solid:gear' }
	])

	const selected = (name) => {
		return false
	}

</script>