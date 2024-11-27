<template>
	<Panel class="organization-settings">
    <TabView v-if="activeTab !== undefined" v-model:activeIndex="activeTab">
			<TabPanel :pt="tabPanelPt">
				<template #header>
					<div @click="changeTab('dashboard')">Dashboard</div>
				</template>
				<div class="organization-settings__dashboard">
          <IndexDashboard v-if="isActive('dashboard')" />
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
					<div @click="changeTab('users')">Users</div>
				</template>
				<div class="organization-settings__users">
          <IndexUsers v-if="isActive( 'users')" />
				</div>
			</TabPanel>
			<!-- <TabPanel header="API Keys" :pt="tabPanelPt" :disabled="true" >
				<div class="organization-settings__apikeys">
					<IndexApiKeys />
				</div>
			</TabPanel> -->
			<TabPanel :pt="tabPanelPt">
				<template #header>
					<div @click="changeTab('audit-logs')">Audit Logs</div>
				</template>
				<div class="organization-settings__audit_logs">
          <AuditLogsView v-if="isActive('audit-logs')" />
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

  const router = useRouter(),
        route = useRoute(),
        activeTab = ref(undefined)

  onMounted(() => {
    // Set initial tab based on current hash
    setTabFromHash(route.hash)
  })

  // Watch for route changes to set active tab
  watch(() => route.hash, (newHash) => {
    setTabFromHash(newHash)
  })

  const isActive = (tabName) => {
    if (route.hash === '' && tabName === 'dashboard') {
      return true
    }
    return route.hash === `#${tabName}`
  }

  const tabs = ['dashboard', 'users', 'audit-logs']

  const changeTab = (tabName) => {
    const tabIndex = tabs.indexOf(tabName)
    if (tabIndex !== -1) {
      activeTab.value = tabIndex
      router.replace({ hash: `#${tabName}` })
    }
  }

  const setTabFromHash = (hash) => {
    const cleanHash = hash.replace('#', '')
    const tabIndex = tabs.indexOf(cleanHash)
    activeTab.value = tabIndex !== -1 ? tabIndex : 0
  }
</script>