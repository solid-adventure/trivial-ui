<template>
	<h2 class="mb-1 font-semibold">Dashboard</h2>
	<p class="mt-2 text-muted">The data displayed on the Dashboard page can be customized here.</p>
	
	<div class="flex flex-column row-gap-5">
		<ActualsPanel />
		<GrossRevenuePanel />
	</div>
</template>

<script setup>
	import ActualsPanel from '@/components/organization-settings/dashboard/summary-group-settings/ActualsPanel.vue'
	import GrossRevenuePanel from '@/components/organization-settings/dashboard/table-settings/GrossRevenuePanel.vue'
</script>