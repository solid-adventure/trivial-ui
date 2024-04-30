<template>
	<header class="main__header">
		<div class="main__header__top">
			<h1>{{ title }}</h1>

			<div class="main__header__top__content">
				<Dropdown v-model="selectedOrg" :options="organisations" optionLabel="name" placeholder="Select a Organisations" class="main__header__top__content__dropdown" />
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
	import { ref } from 'vue'

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

	const selectedOrg = ref(),
		organisations = ref([
			{ name: 'New York', code: 'NY' },
			{ name: 'Rome', code: 'RM' },
			{ name: 'London', code: 'LDN' },
			{ name: 'Istanbul', code: 'IST' },
			{ name: 'Paris', code: 'PRS' }
		]),
		headers = {'Content-Type': 'application/json', Authorization: `${import.meta.env.VITE_CLIENT_KEYS}`}

	const fetchData = async () => {
		try {
			//const response = await fetch(`${import.meta.env.VITE_TRIVIAL_API_URL}/organizations`, headers)
			//organisations.value = await response.json()

			//console.log(organisations.value)
		} catch (err) {
			console.log(err)
		}
	}

	fetchData()
</script>