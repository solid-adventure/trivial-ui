<template>
	<Panel>
		<DataTable :value="keys" tableStyle="max-width: 100%" class="org-settings__table">
			<template #header>
				<div class="flex justify-content-between pb-5">
					<h2 class="flex justify-content-between align-items-center m-0 gap-2">
						API Keys

						<Button type="button" icon="pi pi-info-circle" severity="secondary" size="small" text rounded outlined aria-label="Info" @click="toggleInfoPopup" class="info__btn ml-1 p-0" />
						<OverlayPanel ref="infoPopup">
							<p class="m-0">API keys have Admin privileges. They have full read/write access to all entities belonging to the organization.</p>
						</OverlayPanel>
					</h2>
					<Button label="Add New Key" icon="pi pi-plus" @click="emit('openAddKeyModal')" class="org-settings__table__add--btn" />
				</div>
			</template>
			
			<template #empty>
				<h3 v-if="props.keys">Please, select an organization.</h3>
				No keys found.
			</template>
			
			<template #loading>
				<Image :src="loadingImg" alt="Loader" width="160" />
				<h3>Loading ...</h3>
			</template>
			
			<Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" sortable>
				<template #body="{ data, field }">
					<span v-if="col.field != 'created_at'">
						{{ data[field] }}
					</span>
					<span v-else>
						<div class="date">{{ useFormatDate(data.created_at) }}</div>
					</span>
				</template>
			</Column>
			<Column class="org-settings__table__action">
				<template #body="{ data, field }">
					<Button icon="pi pi-trash" severity="danger" @click="emit('openDeleteKeyModal', data)" text rounded aria-label="Delete" />
				</template>
			</Column>
		</DataTable>
	</Panel>
</template>


<script setup>
	import { ref } from 'vue'
	import { useFormatDate } from '@/composable/formatDate.js'
	import loadingImg from '@/assets/images/trivial-loading.gif'

	const props = defineProps(['keys'])
	const emit = defineEmits(['openAddKeyModal', 'openDeleteKeyModal'])

	const infoPopup = ref(),
		columns = [
			{ field: 'key', header: 'API Key ID' },
			{ field: 'description', header: 'Description' },
			{ field: 'created_at', header: 'Created On' }
		]

	const toggleInfoPopup = event => infoPopup.value.toggle(event)
</script>