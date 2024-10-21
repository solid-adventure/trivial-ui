<template>
	<DataTable
		:value="auditRows"
		:loading="loading" 
		paginator 
		:rows="rows" 
		:rowsPerPageOptions="rowsPerPageOpt"
		:totalRecords="totalRecords"
		:first="first"
		size="small"
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

		<Column v-for="col of columns" :key="col.field" :field="col.field" sortable>
	    <template #header>
	      <span class="whitespace-nowrap">
	        {{ col.header }}
	      </span>
			</template>

			<template #body="{ data }">
				<span :class="{ 'whitespace-nowrap': col.field !== 'description' }">
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
									Patch not found
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

	const auditRows = ref([]),
		columns = [
		    { field: 'id', header: 'Audit ID' },
		    { field: 'user_id', header: 'User ID' },
		    { field: 'user_name', header: 'User' },
		    { field: 'reference_type', header: 'Object' },
		    { field: 'reference_id', header: 'ID' },
		    { field: 'reference_name', header: 'Name' },
		    { field: 'audited_changes', header: 'Description' },
		    { field: 'created_at', header: 'Timestamp' }
	    ],
	    selectOrgMsgInfo = 'Please, select an organization.',
		store = useStore(),
		loading = ref(false),
		rows = ref(50), // per_page
		rowsPerPageOpt = [10, 20, 50],
		{dateOptions, timeOptions, timeZoneOptions} = useDateTimeZoneOptions(),
		first = ref(0),
		totalRecords = ref(0),
		page = ref(1)

	const orgId = computed(() => store.getters.getOrgId)
	const queryString = computed(() => `per_page=${rows.value}&page=${page.value}`)

	onMounted(async () => {
		auditsInit()
	})

	watch(orgId, async (newVal, oldVal) => {
		if (!newVal || newVal == null) {
			auditRows.value.length = 0
		} else if (newVal) {
			auditsInit()
		}
	})

	const formattedValue = (value, column) => {
		switch(column) {
			case 'timestamp':
				return useFormatDate(value, dateOptions) + ' at ' + useFormatDate(value, timeOptions)
				break;
			default:
				return value
		}
	}

	const auditsInit = async () => {
		if (!orgId.value) { return }
		loading.value = true
		auditRows.value.length = 0

		try {
			const response = await store.state.Session.apiCall(`/organizations/${orgId.value}/audits?${queryString.value}`)
			const audits = response?.audits || []
			response.audits.forEach(audit => {
				auditRows.value.push(audit)
			})
			totalRecords.value = (response?.total_pages || 0) * parseInt(rows.value) // per_page
			console.log(`totalRecords: ${totalRecords.value}`)

		}
		catch (err) {
			loading.value = false
			console.log(err)
		}
		loading.value = false
	}

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

	const onPage = async event => {
		loading.value = true

		first.value = event?.first || 0
		rows.value = event?.rows || 10
		page.value = event?.page + 1

		try {
			auditsInit()
		} catch (err) {
			loading.value = false
			console.log(err)
		}

		loading.value = false
	}
</script>

<style scoped>

	.whitespace-nowrap {
	  white-space: nowrap;
	}

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