<template>
	<h2 class="mb-1 font-semibold">Dashboard</h2>
	<p class="mt-2 text-muted">The data displayed on the Dashboard page can be customized here.</p>
	
	<div class="flex flex-column row-gap-5">
		<ActualsPanel />
		<ForecastPanel />
		<RevenueGrossPanel />
		<RevenueWalkPanel />
		<CashImpactsPanel />
	</div>
</template>

<script setup>
	import ActualsPanel from '@/components/organization-settings/dashboard/actuals/ActualsPanel.vue'
	import ForecastPanel from '@/components/organization-settings/dashboard/forecast/ForecastPanel.vue'
	import RevenueGrossPanel from '@/components/organization-settings/dashboard/revenue-gross/RevenueGrossPanel.vue'
	import RevenueWalkPanel from '@/components/organization-settings/dashboard/revenue-walk/RevenueWalkPanel.vue'
	import CashImpactsPanel from '@/components/organization-settings/dashboard/cash-impacts/CashImpactsPanel.vue'
</script>