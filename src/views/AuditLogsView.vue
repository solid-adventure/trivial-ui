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
			No audits found.
		</template>
		<template #loading>
			<div class="flex flex-column gap-1 justify-content-center">
				<Image :src="loadingImg" alt="Loader" width="160" />
				<h3>Loading ...</h3>
			</div>
		</template>

		<Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header" sortable>
			<template #body="{ data }">
				<span>
					<Avatar v-if="col.field === 'user'" :label="data.label" class="mr-2" shape="circle" :style="`background-color: ${data.bgColor}; color: #333`" />
					<i v-if="col.field === 'action' "class="w-1rem mr-1 pi" :class="data.actionIcon" />


					<template v-if="col.field === 'audited_changes'">
							<p v-for="item in data[col.field]">
								<template v-if="item.patch">
									<!-- Iterate over the lines in the patch so we can apply styles -->
									<span class="patch-diff">
										<template v-for="line in item.patch.split('\n')">
											<span v-if="line.startsWith('+')" class="text-added">{{ line }}</span>
											<span v-else-if="line.startsWith('-')" class="text-removed">{{ line }}</span>
											<span v-else>{{ line }}</span>
										</template>
									</span>


								</template>
								<template v-else>
									{{ item.attribute }} to <strong>{{ item.new_value || '<blank>' }}</strong> from {{ item.old_value || '<blank>' }}
								</template>
							</p>

					</template>
					<template v-else>
						{{ formattedValue(data[col.field], col.field) }}
					</template>




				</span>
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

	const auditLogs = ref([]),
		columns = [
		    { field: 'id', header: 'ID' },
		    { field: 'user_name', header: 'User Name' },
		    { field: 'associated_name', header: 'Name' },
		    { field: 'action', header: 'Activity' },
		    // { field: 'associated_type', header: 'Model' },
		    // { field: 'associated_id', header: 'Model ID' },
		    { field: 'audited_changes', header: 'Description' },
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

	const formattedValue = (value, column) => {
		switch(column) {
			case 'timestamp':
				return useFormatDate(value, dateOptions) + ' at ' + useFormatDate(value, timeOptions)
				break;
			default:
				return value
		}
	}

	const appNameFromAudit = (audit) => {

		if (audit.associated_type === 'App') {
			return store.state.apps.find(app => app.id === audit.associated_id)?.descriptive_name
		}

		if (audit.auditable_type === 'App') {
			return store.state.apps.find(app => app.id === audit.auditable_id)?.descriptive_name
		}

		return 'Unknown'

	}

	const auditsInit = async () => {
		loading.value = true

		// let apps = []

		let apps = await getApps()
		apps = filteredOrgApps(apps)

		let auditPromises = apps.map(item => getAuditsLogs(item.id)),
			allAudits = await Promise.all(auditPromises)

		console.log('allAudits - ', allAudits)


		allAudits.forEach(item => {
			item?.audits.forEach(audit => {


				let dataObj = {}
				dataObj.id = audit?.id
				dataObj.user_id = audit?.user_id
				dataObj.user_name = audit?.user_name
				dataObj.action = audit?.action
				dataObj.associated_type = audit?.associated_type
				dataObj.associated_id = audit?.associated_id
				dataObj.associated_name = appNameFromAudit(audit)
				dataObj.audited_changes = audit?.audited_changes || 'No audited_changes'
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

	const getNameInitials = name => name?.toString().match(/(\b\S)?/g).join("").toUpperCase()

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

<style scoped>
	.patch-diff {
		font-family: monospace;
		font-size: 0.9rem;
		white-space: pre-wrap;


		span {
			display: block;
		}

		.text-added {
			background-color: rgb(209, 248, 217);;
			color: rgb(10, 48, 105);
		}

		.text-removed {
			background-color: rgb(255, 206, 203);
			color: rgb(10, 48, 105);
		}

	}
</style>