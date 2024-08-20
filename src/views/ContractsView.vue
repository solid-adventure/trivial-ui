<template>
	<h1>Contracts</h1>
</template>

<script setup>
	import { ref, computed, onMounted } from 'vue'
	import { useStore } from 'vuex'

	const store = useStore()

	let contracts = ref([]),
		apps = []

	const orgId = computed(() => store.getters.getOrgId)

	onMounted(async () => {
		apps = await getApps()
		setContracts()
	})

	const getApps = async () => {
		try {
			return await store.state.Session.apiCall('/apps')
		} catch (err) {
			console.log(err)
		}
	}

	const setContracts = () => {
		contracts.value = apps.filter(item => item.owner_id === orgId.value && item.owner_type === 'Organization' && item.panels.component === 'Contract')
	}

	//const getContracts = async type => await store.state.Session.apiCall(`apps/stats/${type}`)
</script>