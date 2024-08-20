<template>
	<h1>Contracts</h1>
</template>

<script setup>
	import { ref, computed, onMounted } from 'vue'
	import { useStore } from 'vuex'

	const store = useStore(),
		contractsType = 'hourly'

	let contracts = ref([])

	const apps = computed(() => store.getters.getApps)
	const orgId = computed(() => store.getters.getOrgId)

	onMounted(async () => {
		
		let appsStats = await getContracts(contractsType)

		console.log('appsStats - ', appsStats)
	})

	const setContracts = () => {
		contracts.value = apps.value.filter(item => item.owner_id === orgId.value && item.owner_type === 'Organization')
	}

	const getContracts = async type => await store.state.Session.apiCall(`apps/stats/${type}`)

	setContracts()
</script>