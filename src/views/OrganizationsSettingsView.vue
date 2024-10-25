<template>
	<Panel class="organization-settings">
		<TabView v-model:activeIndex="activeTab">
			<TabPanel :pt="tabPanelPt">
				<template #header>
					<div @click="changeTab(0, 'dashboard')">Dashboard</div>
				</template>
				<div class="organization-settings__dashboard">
					<IndexDashboard />
				</div>
			</TabPanel>
			<!--<TabPanel header="Sales" :disabled="true" :pt="tabPanelPt">
				<div class="organization-settings__sales">
					<IndexSales /> :header="tabHeader(0, 'Dashboard')"
				</div>
			</TabPanel>
			<TabPanel header="Contracts" :disabled="true" :pt="tabPanelPt">
				<div class="organization-settings__contracts">
					<IndexContracts />
				</div>
			</TabPanel>-->
			<TabPanel :pt="tabPanelPt">
				<template #header>
					<div @click="changeTab(1, 'users')">Users</div>
				</template>
				<div class="organization-settings__users">
					<IndexUsers />
				</div>
			</TabPanel>
			<!-- <TabPanel header="API Keys" :pt="tabPanelPt" :disabled="true" >
				<div class="organization-settings__apikeys">
					<IndexApiKeys />
				</div>
			</TabPanel> -->
			<TabPanel :pt="tabPanelPt">
				<template #header>
					<div @click="changeTab(2, 'audit-logs')">Audit Logs</div>
				</template>
				<div class="organization-settings__audit_logs">
					<AuditLogsView />
				</div>
			</TabPanel>
		</TabView>
	</Panel>
</template>

<script setup>
	import { ref, watch, onMounted } from 'vue'
	import { useRouter, useRoute } from 'vue-router'
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

	const localStorageKey = 'activeTabIndex',
		router = useRouter(),
		route = useRoute()

	let activeTab = ref(0)

	// Watch the activeTab value and update the URL hash when it changes
    //watch(activeTab, newIndex => window.location.hash = `#${newIndex}`)

	// On mounted, check localStorage for saved active tab index
	onMounted(() => {
		//const savedIndex = localStorage.getItem(localStorageKey)
		//if (savedIndex !== null) activeTab.value = parseInt(savedIndex) // Set saved tab index on load

		//activeTab.value = getHashIndex()
	})

	const changeTab = (index, urlHash) => {
		//activeTab.value = index // Programmatically change the active tab
		//setActiveTabStorage(index)
	}

	const setActiveTabStorage = index => localStorage.setItem(localStorageKey, index)
	const getHashIndex = () => {
		//const hash = window.location.hash.replace('#', '')
		//return parseInt(hash) || 0
	}
</script>