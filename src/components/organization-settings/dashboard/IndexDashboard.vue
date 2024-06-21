<template>
	<h2 class="mb-1">Dashboard</h2>
	<p class="mt-2 text-muted">The data displayed on the Dashboard page can be customized here.</p>
	
	<div class="flex flex-column row-gap-5">
		<ActualsPanel />

		<ForecastPanel />

		<RevenueGrossPanel />
	</div>
</template>

<script setup>
	import ActualsPanel from '@/components/organization-settings/dashboard/actuals/ActualsPanel.vue'
	import ForecastPanel from '@/components/organization-settings/dashboard/forecast/ForecastPanel.vue'
	import RevenueGrossPanel from '@/components/organization-settings/dashboard/revenue-gross/RevenueGrossPanel.vue'
</script>