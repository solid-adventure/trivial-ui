<template>
	<header class="main__header">
		<div class="main__header__top">
			<h1>{{ title }}</h1>

			<div class="main__header__top__content">
				<Dropdown v-model="selectedOrg" :options="organisations" optionLabel="name" placeholder="Select a Organisations" class="main__header__top__content__dropdown" :change="handleSelected()" />
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
	import { useStore } from 'vuex'

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
		organisations = ref([{name: '', id: null}]),
		store = useStore()

	const handleSelected = () => store.dispatch('selectOrgId', selectedOrg.value?.id)
	
	const fetchData = async () => {
		try {
			organisations.value = await store.state.Session.apiCall('/organizations')
		} catch (err) {
			console.log(err)
		}
	}

	fetchData()
</script>