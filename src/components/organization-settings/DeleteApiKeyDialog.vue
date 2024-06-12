<template>
	<Dialog v-model:visible="visible" modal @hide="closeModal" header="Confirm API Key Deletion" class="org-settings__dialog">
		<div>
			<p class="mb-0">Are you sure you want to Delete API Key</p>
			<p class="mt-1"><strong>{{ deletedApiKey.key }}</strong>?</p>
		</div>
		<div class="mt-5">
			<p class="mb-0 text--muted">Description</p>
			<p class="mt-1">{{ deletedApiKey.description }}</p>
		</div>

		<VForm v-slot="{ meta }" class="mt-6">			
			<div class="flex flex-column gap-1 mb-5">
				<label for="apikey">Enter API Key ID</label>
				<VField id="apikey" name="apiKey" :rules="{ required }" v-slot="{ field, errors }">
					<InputText v-model.trim="apiKey" v-bind="field" class="flex-auto" :class="{'p-invalid': errors.length}" autocomplete="off" />
					<span v-if="errors.length" class="p-error text-xs">{{ errors[0] }}</span>
				</VField>
			</div>

			<div class="flex justify-content-end align-items-center gap-2">
				<Button type="button" label="Cancel" text @click="closeModal" class="modal__cancel--btn" />
				<Button type="button" severity="danger" label="Delete API Key" @click="emit('deleteApiKey')" :disabled="!meta.valid" class="modal__next--btn delete--btn" />
			</div>
		</VForm>
	</Dialog>
</template>

<script setup>
	import { defineRule, configure, Field as VField, Form as VForm } from 'vee-validate'
	import { required, min } from '@vee-validate/rules'
	import { ref, watch } from 'vue'

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

	const props = defineProps(['visible', 'deletedApiKey'])
	const emit = defineEmits(['closeDeleteKeyModal', 'deleteApiKey'])

	const visible = ref(false),
		apiKey = ref(null)

	watch(props, newVal => visible.value = newVal.visible)

	const closeModal = () => {
		visible.value = false
		emit('closeDeleteKeyModal')
	}
</script>