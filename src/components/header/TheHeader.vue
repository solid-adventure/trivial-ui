<template>
	<header class="main__header">
		<div class="main__header__top">
			<h1>{{ title }}</h1>

			<div class="main__header__top__content">
				<Dropdown v-model="selectedOrg" :options="organisations" optionLabel="name" placeholder="Select Organization" class="main__header__top__content__dropdown" :change="handleSelected()" />
				<!--<router-link to="#" class="main__header__top__content--link">
					<Icon icon="fa6-regular:user" />
				</router-link>-->
			</div>
		</div>
		<Breadcrumb :breadcrumbs="breadcrumbs" />
	</header>
</template>

<script setup>
	import { Icon } from '@iconify/vue'
	import Breadcrumb from '../Breadcrumb.vue'
	import { ref, watch, onMounted } from 'vue'
	import { useStore } from 'vuex'
	import notifications from '@/components/notifications'

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
	let localStorageOrgId = null

	watch(selectedOrg, async (newVal, oldVal) => {
		let org = newVal === undefined ? oldVal : newVal
		localStorage.setItem('orgId', JSON.stringify(org.id))
	})

	onMounted(async () => {
		await fetchData()

		persistSelectedOrg()
	})

	const handleSelected = () => {
		store.dispatch('selectOrgId', selectedOrg.value?.id)
	}
	
	const fetchData = async () => {
		try {
			organisations.value = await store.state.Session.apiCall('/organizations')
		} catch (err) {
			console.log(err)
			notifications.error(`Failed to fetch data: ${err}`)
		}
	}

	// Set the org. dropdown value if there is org. id in the localstorage when user refresh the page
	const persistSelectedOrg = () => {
		localStorageOrgId = JSON.parse(localStorage.getItem('orgId'))

		// Select organization dropdown value if organization ID is stored in local storage
		if (localStorageOrgId) {
			selectedOrg.value = organisations.value.find(item => item.id === parseInt(localStorageOrgId, 10))
		}
	}
</script>