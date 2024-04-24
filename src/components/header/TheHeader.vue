<template>
	<header class="main__header">
		<div class="main__header__top">
			<h1>{{ title }}</h1>

			<div class="main__header__top__content">
				<select>
					<option>Ghostly International</option>
				</select>

				<router-link to="#" class="main__header__top__content--link">
					<i class="fa-regular fa-user"></i>
				</router-link>
			</div>
		</div>
		<Breadcrumb :breadcrumbs="breadcrumbs" />
	</header>
</template>

<script setup>
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