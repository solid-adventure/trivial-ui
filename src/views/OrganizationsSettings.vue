<template>
	<DataTable :value="keys" tableStyle="max-width: 100%" class="apikeys__table" :pt="{ table: 'my-table-XXX'}">
		<template #header>
			<div class="flex justify-content-between py-5">
				<h2 class="flex justify-content-between align-items-center m-0">
					API Keys

					<Button type="button" icon="pi pi-info-circle" severity="secondary" size="small" text rounded outlined aria-label="Info" @click="toggleInfoPopup" class="info__btn ml-1 p-0" />
					<OverlayPanel ref="infoPopup">
						<p class="m-0">API keys have Admin privileges. They have full read/write access to all entities belonging to the organization.</p>
					</OverlayPanel>
				</h2>
				<Button label="Add New Key" icon="pi pi-plus" @click="openModal" class="apikeys__table__add--btn" />
			</div>
		</template>
		
		<template #empty>No revenues found.</template>
		
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
		<Column class="apikeys__table__action">
			<template #body="{ data, field }">
				<Button icon="pi pi-trash" severity="danger" @click="setDeletedApiKey(data)" text rounded aria-label="Delete" />
			</template>
		</Column>
	</DataTable>

	<!-- ADD API KEY DIALOG/MODAL -->
	<Dialog v-model:visible="visible" modal @hide="closeModal" header="Add New API Key" class="apikey__dialog">
		<VForm v-slot="{ meta }">
			<div v-if="step === 1" class="flex flex-column gap-1 mb-5 mt-2">
				<label for="apikey">Description</label>
				<VField id="apikey" name="description" :rules="{ required, min: 6 }" v-slot="{ field, errors }">
					<InputText v-model="keyDescription" v-bind="field" class="flex-auto" :class="{'p-invalid': errors.length}" autocomplete="off" placeholder="ex. API Key for testing" />
					<span v-if="errors.length" class="p-error text-xs">{{ errors[0] }}</span>
				</VField>
			</div>
			<div v-else class="flex flex-column gap-1 mb-5 mt-2">
				<label for="apikey">API Key</label>
				<VField id="apikey" name="apikey" :rules="{ required, min: 6 }" v-slot="{ field, errors }">
					<IconField iconPosition="right">
						<InputIcon class="pi pi-copy apikey__dialog__copy--btn" @click="copyApiKey(apiKey)" />
						<InputText v-model="apiKey" class="flex-auto w-full" autocomplete="off" />
					</IconField>
					<span v-if="errors.length" class="p-error text-xs">{{ errors[0] }}</span>
				</VField>
				<Message severity="info" class="apikey__dialog__msg">
					This API key is displayed only once at this moment. Therefore, please copy and securely store this key in a location that is both safe and accessible. If you lose this key, you will need to delete it and generate a new one.
				</Message>
			</div>

			<div class="flex justify-content-between align-items-center gap-2">
				<span class="p-text-secondary text-sm flex">Step {{ step }} of {{ totalSteps }}</span>
				<span class="flex gap-2">
					<Button type="button" label="Cancel" text @click="closeModal" class="modal__cancel--btn" />
					<Button v-if="step === 1" type="button" label="Next" @click="modalNextStep" :disabled="!meta.valid" class="modal__next--btn" />
					<Button v-else type="button" label="Done" @click="addApiKey" class="modal__next--btn" />
				</span>
			</div>
		</VForm>
	</Dialog>

	<!-- Delete modal -->
	<Dialog v-model:visible="showDeleteModal" modal @hide="closeDeleteModal" header="Confirm API Key Deletion" class="apikey__dialog">
		<div>
			<p class="mb-0">Are you sure you want to Delete API Key</p>
			<p class="mt-1"><strong>{{ deletedApiKey.key }}</strong>?</p>
		</div>
		<div class="mt-5">
			<p class="mb-0 apikey__dialog__muted--txt">Description</p>
			<p class="mt-1">{{ deletedApiKey.description }}</p>
		</div>

		<VForm v-slot="{ meta }" class="mt-6">			
			<div class="flex flex-column gap-1 mb-5">
				<label for="apikey">Enter API Key ID</label>
				<VField id="apikey" name="apiKey" :rules="{ required }" v-slot="{ field, errors }">
					<InputText v-model="apiKey" v-bind="field" class="flex-auto" :class="{'p-invalid': errors.length}" autocomplete="off" />
					<span v-if="errors.length" class="p-error text-xs">{{ errors[0] }}</span>
				</VField>
			</div>

			<div class="flex justify-content-end align-items-center gap-2">
				<Button type="button" label="Cancel" text @click="closeDeleteModal" class="modal__cancel--btn" />
				<Button type="button" severity="danger" label="Delete API Key" @click="deleteApiKey" :disabled="!meta.valid" class="modal__next--btn delete--btn" />
			</div>
		</VForm>
	</Dialog>
</template>

<script setup>
	import { defineRule, configure, Field as VField, Form as VForm } from 'vee-validate'
	import { required, min } from '@vee-validate/rules'
	import { ref, computed, onMounted, toRaw } from 'vue'
	import { useClipboard } from '@vueuse/core'
	import { useFormatDate } from '@/composable/formatDate.js'
	import { useToast } from 'primevue/usetoast'
	import loadingImg from '@/assets/images/trivial-loading.gif'

	const keys = ref(),
		visible = ref(false),
		keyDescription = ref(''),
		apiKey = ref('8ghju029lkmn7jyet44-1sg440hl45n-223hjkl7uo'),
		step = ref(1),
		totalSteps = ref(2),
		showDeleteModal = ref(false),
		infoPopup = ref(),
		columns = [
			{ field: 'key', header: 'API Key ID' },
			{ field: 'description', header: 'Description' },
			{ field: 'created_at', header: 'Created On' }
		],
		{ text, copy } = useClipboard(),
		toast = useToast()

	let deletedApiKey = ref(null)

	// Define validation rules and use vee validate
	defineRule('required', required);
	defineRule('min', min)

	// Configure vee-validate
	configure({
		generateMessage: context => {
			const messages = {
				required: `The field ${context.field} is required.`,
				min: `The field ${context.field} must be at least ${context.rule.params[0]} characters.`,
			}

			return messages[context.rule.name] ? messages[context.rule.name] : `The field ${context.field} is invalid.`;
		}
	})

	const copiedApiKey = computed(() => apiKey.value.replace(apiKey.value.substring(10, 35), '...'))


	onMounted(() => {
		keys.value = [
			{ key: 'fgh145r7-b9ku44m11', description: 'Test key purpose', created_at: '2024-04-30T20:43:00.930Z' },
			{ key: 'fgh145r7-b9ku44m11', description: 'API Key for testing', created_at: '2024-04-30T20:43:00.930Z' },
			{ key: 'fgh145r7-b9ku44m11', description: 'Get API Key 111', created_at: '2024-04-30T20:43:00.930Z' },
			{ key: 'fgh145r7-b9ku44m11', description: 'API Key New Test', created_at: '2024-04-30T20:43:00.930Z' },
			{ key: 'fgh145r7-b9ku44m11', description: 'My API key', created_at: '2024-04-30T20:43:00.930Z' }
		]
	})

	const modalNextStep = () => step.value++
	const openModal = () => visible.value = true
	const openDeleteModal = () => showDeleteModal.value = true
	const closeDeleteModal = () => showDeleteModal.value = false
	const toggleInfoPopup = event => infoPopup.value.toggle(event)

	const copyApiKey = key => { 
		copy(key)
		toast.add({ severity: 'success', summary: 'Success', detail: `API key ${copiedApiKey.value} has been copied`, life: 3000 })
	}

	const closeModal = () => {
		visible.value = false
		step.value = 1
	}

	const addApiKey = () => {
		// POST API Key to the database
		console.log('API KEY - ', apiKey.value)
		toast.add({ severity: 'success', summary: 'Success', detail: 'Successfully added new API Key.', life: 3000 })

		closeModal()
	}

	const setDeletedApiKey = keyItem => {
		openDeleteModal()
		deletedApiKey = toRaw(keyItem)
	}

	const deleteApiKey = () => {
		// DELETE API Key from databse
		console.log('deletedApiKey - ', deletedApiKey)
		keys.value = keys.value.filter(item => item.description !== deletedApiKey.description)
		
		closeDeleteModal()
		toast.add({ severity: 'info', summary: 'Info', detail: 'You have just deleted API Key.', life: 3000 })
	}
</script>