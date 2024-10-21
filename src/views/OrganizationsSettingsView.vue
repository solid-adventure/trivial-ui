<template>
	<Panel class="organization-settings">
		<TabView>
			<TabPanel header="Dashboard" :pt="tabPanelPt">
				<div class="organization-settings__dashboard">
					<IndexDashboard />
				</div>
			</TabPanel>
			<!--<TabPanel header="Sales" :disabled="true" :pt="tabPanelPt">
				<div class="organization-settings__sales">
					<IndexSales />
				</div>
			</TabPanel>
			<TabPanel header="Contracts" :disabled="true" :pt="tabPanelPt">
				<div class="organization-settings__contracts">
					<IndexContracts />
				</div>
			</TabPanel>-->
			<TabPanel header="Users" :pt="tabPanelPt">
				<div class="organization-settings__users">
					<IndexUsers />
				</div>
			</TabPanel>
			<!-- <TabPanel header="API Keys" :pt="tabPanelPt" :disabled="true" >
				<div class="organization-settings__apikeys">
					<IndexApiKeys />
				</div>
			</TabPanel> -->
			<TabPanel header="Audit Logs" :pt="tabPanelPt">
				<div class="organization-settings__audit_logs">
					<AuditLogsView />
				</div>
			</TabPanel>
		</TabView>
	</Panel>
</template>

<script setup>
	import { ref } from 'vue'
	import AuditLogsView from "@/views/AuditLogsView.vue";
	import IndexDashboard from '@/components/organization-settings/dashboard/IndexDashboard.vue'
	import IndexSales from '@/components/organization-settings/sales/IndexSales.vue'
	import IndexContracts from '@/components/organization-settings/contracts/IndexContracts.vue'
	import IndexUsers from '@/components/organization-settings/users/IndexUsers.vue'
	import IndexApiKeys from '@/components/organization-settings/apikeys/IndexApiKeys.vue'

	// TABS MENUS
	const tabPanelPt = ref({
		header: {
			class: 'header__tabs'
		}
	})
</script>