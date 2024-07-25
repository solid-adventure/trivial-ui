<template>
	<Dialog v-model:visible="visible" modal @hide="closeModal" header="Add New API Key" class="org-settings__dialog">
		<VForm v-slot="{ meta }">
			<div v-if="step === 1" class="flex flex-column gap-1 mb-5 mt-2">
				<label for="apikey">Description</label>
				<VField id="apikey" name="description" :rules="{ required, min: 6 }" v-slot="{ field, errors }">
					<InputText v-model.trim="keyDescription" v-bind="field" class="flex-auto" :class="{'p-invalid': errors.length}" autocomplete="off" placeholder="ex. API Key for testing" />
					<span v-if="errors.length" class="p-error text-xs">{{ errors[0] }}</span>
				</VField>
			</div>
			<div v-else class="flex flex-column gap-1 mb-5 mt-2">
				<label for="apikey">API Key</label>
				<VField id="apikey" name="apikey" :rules="{ required, min: 6 }" v-slot="{ field, errors }">
					<IconField iconPosition="right">
						<InputIcon class="pi pi-copy org-settings__dialog__copy--btn" @click="copyApiKey(apiKey)" />
						<InputText v-model.trim="apiKey" class="flex-auto w-full" autocomplete="off" />
					</IconField>
					<span v-if="errors.length" class="p-error text-xs">{{ errors[0] }}</span>
				</VField>
				<Message severity="info" class="org-settings__dialog__msg text-justify">
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
</template>

<script setup>
	import { defineRule, configure, Field as VField, Form as VForm } from 'vee-validate'
	import { required, min } from '@vee-validate/rules'
	import { ref, watch, computed } from 'vue'
	import { useClipboard } from '@vueuse/core'
	import { useToastNotifications } from '@/composable/toastNotification'

	const props = defineProps(['visible'])
	const emit = defineEmits(['closeAddKeyModal'])

	const keyDescription = ref(''),
		apiKey = ref('EXAMPLE_API_KEY'),
		step = ref(1),
		visible = ref(false),
		totalSteps = ref(2),		
		{ text, copy } = useClipboard(),
		{ showSuccessToast } = useToastNotifications()

	// Define validation rules and use vee validate
	defineRule('required', required)
	defineRule('min', min)

	// Configure vee-validate
	configure({
		generateMessage: context => {
			const messages = {
				required: `The field ${context.field} is required.`,
				min: `The field ${context.field} must be at least ${context.rule.params[0]} characters.`,
			}

			return messages[context.rule.name] ? messages[context.rule.name] : `The field ${context.field} is invalid.`
		}
	})

	watch(props, newVal => visible.value = newVal.visible)
	const copiedApiKey = computed(() => apiKey.value.replace(apiKey.value.substring(10, 35), '...')) // Trim the api key

	const modalNextStep = () => step.value++

	const closeModal = () => {
		visible.value = false
		step.value = 1
		emit('closeAddKeyModal')
	}

	const copyApiKey = key => { 
		copy(key)
		//showSuccessToast('Success', `API key ${copiedApiKey.value} has been copied`) // Key is trimed and it's not shown in a full length
		showSuccessToast('Success', 'API key has been copied')
	}

	const addApiKey = () => {
		// POST API Key to the database
		// console.log('API KEY - ', apiKey.value)

		closeModal()
		showSuccessToast('Success', 'Successfully added new API Key.')
	}
</script>