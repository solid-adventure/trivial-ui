<template>
	<h2 class="mb-1 font-semibold">Dashboard</h2>
	<p class="mt-2 text-muted">The data displayed on the Dashboard page can be customized here.</p>
	
	<div class="flex flex-column row-gap-5">
		<ActualsPanel />
		<!--<ForecastPanel /> -->
		<GrossRevenuePanel />
		<!--<RevenueWalkPanel />
		<CashImpactsPanel /> -->
	</div>
</template>

<script setup>
	import ActualsPanel from '@/components/organization-settings/dashboard/actuals/ActualsPanel.vue'
	import ForecastPanel from '@/components/organization-settings/dashboard/forecast/ForecastPanel.vue'
	import GrossRevenuePanel from '@/components/organization-settings/dashboard/gross-revenue/GrossRevenuePanel.vue'
	import RevenueWalkPanel from '@/components/organization-settings/dashboard/revenue-walk/RevenueWalkPanel.vue'
	import CashImpactsPanel from '@/components/organization-settings/dashboard/cash-impacts/CashImpactsPanel.vue'
</script>