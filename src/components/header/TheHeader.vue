<template>
	<header class="main__header">
		<div class="main__header__top">
			<h1>{{ title }}</h1>

			<div class="main__header__top__content">
				<select>
					<option>Ghostly International</option>
				</select>

				<router-link to="#" class="main__header__top__content--link">
					<Icon icon="fa6-regular:user" />
				</router-link>
			</div>
		</div>
		<Breadcrumb :breadcrumbs="breadcrumbs" />
	</header>
</template>

<script setup>
	import { Icon } from '@iconify/vue'
	import Breadcrumb from '../Breadcrumb.vue'

	defineProps({
		title: {
			type: String,
			required: true,
			default: ''
		},
		breadcrumbs: {
			type: Array,
			required: true,
			default: []
		}
	})
</script>