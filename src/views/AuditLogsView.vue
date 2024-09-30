<template>
	<DataTable
		:value="auditLogs"
		:loading="loading" 
		paginator 
		:rows="rows" 
		:rowsPerPageOptions="rowsPerPageOpt"
		:totalRecords="totalRecords"
		:first="first"
		@page="onPage"
		tableStyle="max-width: 100%"
		class="border-round-sm"
	>
		
		<template #header>
			<div class="flex justify-content-between py-5">
				<h2 class="m-0">User Activites and System Changes</h2>
			</div>
		</template>
		<template #empty>
			<h3 v-if="!orgId">{{ selectOrgMsgInfo }}</h3>
			No revenues found.
		</template>
		<template #loading>
			<div class="flex flex-column gap-1 justify-content-center">
				<Image :src="loadingImg" alt="Loader" width="160" />
				<h3>Loading ...</h3>
			</div>
		</template>

		<Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header" sortable>
			<template #body="{ data }">
				<span v-if="col.field === 'user'">
					<Avatar :label="data.label" class="mr-2" shape="circle" :style="`background-color: ${data.bgColor}; color: #333`" />
					{{ data[col.field] }}
				</span>
				<span v-else-if="col.field === 'action'" class="capitalize">
					<i class="w-1rem mr-1 pi" :class="data.actionIcon" />
					{{ data[col.field] }}
				</span>
				<span v-else-if="col.field === 'description'">{{ data[col.field] }}</span>
				<span v-else-if="col.field === 'timestamp'">{{ useFormatDate(data[col.field], dateOptions) }} at {{ useFormatDate(data[col.field], timeOptions) }}</span>
			</template>
		</Column>
	</DataTable>
</template>

<script setup>
	import { ref, onMounted, computed, watch } from 'vue'
	import { useStore } from 'vuex'
	import { useFormatDate } from '@/composable/formatDate.js'
	import { useDateTimeZoneOptions } from '@/composable/dateTimeZoneOptions.js'
	import loadingImg from '@/assets/images/trivial-loading-optimized.webp'

	const auditLogs = ref([
		  /*{
		    user: "Charles Brown",
		    action: "Edit",
		    description: "Renamed column GL Code to Income Account",
		    timestamp: "07/01/2024 12:11 AM PST"
		  },
		  {
		    user: "Charles Brown",
		    action: "Create",
		    description: "Added column GL Code",
		    timestamp: "07/01/2024 10:10 AM PST"
		  },
		  {
		    user: "Charles Brown",
		    action: "Create",
		    description: "Created Register Sales",
		    timestamp: "07/01/2024 09:00 AM PST"
		  },
		  {
		    user: "Kurt Preston",
		    action: "Create",
		    description: "Added column Location ID",
		    timestamp: "07/01/2024 08:56 AM PST"
		  },
		  {
		    user: "Chris Thorpe",
		    action: "Create",
		    description: "Added column Customer Type",
		    timestamp: "06/30/2024 04:11 PM PST"
		  },
		  {
		    user: "Edwin Brown",
		    action: "Delete",
		    description: "Deleted column Location",
		    timestamp: "06/30/2024 02:11 PM PST"
		  },
		  {
		    user: "Alonzo White",
		    action: "Edit",
		    description: "Renamed column GL Code to Income Account",
		    timestamp: "06/30/2024 01:09 PM PST"
		  },
		  {
		    user: "Albert Bell",
		    action: "Edit",
		    description: "Renamed column GL Code to Income Account",
		    timestamp: "06/30/2024 12:11 PM PST"
		  },
		  {
		    user: "John Rose",
		    action: "Delete",
		    description: "Deleted column Revenue Type",
		    timestamp: "06/30/2024 10:11 AM PST"
		  },
		  {
		    user: "John Rose",
		    action: "Edit",
		    description: "Renamed column GL Code to Income Account",
		    timestamp: "06/29/2024 12:11 AM PST"
		  }*/
		]),
		columns = [
		    { field: 'user', header: 'User Name' },
		    { field: 'action', header: 'Activity' },
		    { field: 'description', header: 'Description' },
		    { field: 'timestamp', header: 'Timestamp' }
	    ],
	    selectOrgMsgInfo = 'Please, select an organization.',
		store = useStore(),
		loading = ref(false),
		rows = ref(10), // per_page
		rowsPerPageOpt = [10, 20, 50],
		{dateOptions, timeOptions, timeZoneOptions} = useDateTimeZoneOptions(),
		first = ref(1),
		totalRecords = ref(0),
		page = ref(1)

	const orgId = computed(() => store.getters.getOrgId)
	const queryString = computed(() => updateQueryString())

	onMounted(async () => await auditsInit())

	const auditsInit = async () => {
		loading.value = true

		let apps = []

		apps = await getApps()
		apps = filteredOrgApps(apps) 

		let auditPromises = apps.map(item => getAuditsLogs(item.id)),
			allAudits = await Promise.all(auditPromises)

		console.log('allAudits - ', allAudits)


		allAudits.forEach(item => {
			item?.audits.forEach(audit => {
				let dataObj = {}

				dataObj.user = audit?.user_id
				dataObj.action = audit?.action
				dataObj.description = audit?.audited_changes || 'No description'
				dataObj.timestamp = audit?.created_at

				auditLogs.value.push(dataObj)
			})
		})

		totalRecords.value = auditLogs.value.length
		formatAuditLogs(auditLogs.value)

		loading.value = false
	}

	const getApps = async () => {
		try {
			return await store.state.Session.apiCall('/apps')
		} catch (err) {
			console.log(err)
		}
	}

	const filteredOrgApps = apps => apps.filter(item => item.owner_id === orgId.value && item.owner_type === 'Organization')

	const getAuditsLogs = async appId => {
		try {
			return await store.state.Session.apiCall(`/apps/${appId}/audits?${queryString.value}`)
		} catch (err) {
			console.log(err)
		}
	}

	const getNameInitials = name => name.toString().match(/(\b\S)?/g).join("").toUpperCase()

	const getActionIcon = action => {
		switch(action) {
			case 'update':
				return 'pi-pencil'
			break;
			case 'create':
				return 'pi-plus'
			break;
			case 'delete':
				return 'pi-times'
			break;
			default:
				return ''
		}
	}

	const generatePastelColor = () => {
		const r = Math.floor((Math.random() * 127) + 127), // values between 127 and 255
			g = Math.floor((Math.random() * 127) + 127),
			b = Math.floor((Math.random() * 127) + 127)

		return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}` // Convert to hex
	}

	const formatAuditLogs = auditLogs => {
		const userColors = {}

		auditLogs.forEach(log => {
			if (!userColors[log.user]) {
				userColors[log.user] = generatePastelColor();
			}

			log.bgColor = userColors[log.user] // Add the color to the log
			log.label = getNameInitials(log.user)
			log.actionIcon = getActionIcon(log.action)
		})

		return auditLogs
	}

	const totalPaginatorPages = (totalPages, itemsPerPage) => totalPages * itemsPerPage
	const updateQueryString = () => `per_page=${rows.value}&page=${page.value}`

	const onPage = async event => {
		loading.value = true

		first.value = event?.first || 0
		rows.value = event?.rows || 10
		page.value = event?.page + 1

		try {
			await auditsInit()
		} catch (err) {
			loading.value = false
			console.log(err)
		}

		loading.value = false
	}
</script>
