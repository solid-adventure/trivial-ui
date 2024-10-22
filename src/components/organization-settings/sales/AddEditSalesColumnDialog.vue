<template>
	<Dialog v-model:visible="visible" modal @hide="closeModal" :header="`${typeFormTxt[0]} Column`" class="org-settings__dialog">
		<VForm v-slot="{ meta }">
			<div class="flex flex-column gap-1 my-2">
				<label for="name" class="mb-1">Column Name</label>
				<VField id="name" name="name" :rules="{ required, min: 2 }" v-slot="{ field, errors }">
					<InputText v-model="userFormData.name" v-bind="field" class="flex-auto capitalize" :class="{'p-invalid': errors.length}" autocomplete="off" placeholder="ex. Location" :value="userFormData.name" />
					<span v-if="errors.length" class="p-error text-xs mt-1">{{ errors[0] }}</span>
				</VField>
			</div>
			<!--<div class="flex flex-column gap-1 my-5">
				<label for="type" class="mb-1">Column Type</label>
				<VField id="type" name="type" :rules="{ required }" v-slot="{ field, errors }">
					<Dropdown v-model="userFormData.type" :options="types" v-bind="field" class="w-full" autocomplete="off" placeholder="Select Column Type" :value="userFormData.type" />
					<span v-if="errors.length" class="p-error text-xs mt-1">{{ errors[0] }}</span>
				</VField>
			</div>-->

			<div class="flex justify-content-end gap-2">
				<Button type="button" label="Cancel" text @click="closeModal" class="modal__cancel--btn" />
				<Button type="button" :label="typeFormTxt[1]" @click="addEditSalesCol" :disabled="!meta.valid" class="modal__next--btn" />
			</div>
		</VForm>
	</Dialog>
</template>

<script setup>
	import { ref, watch, computed } from "vue"
	import { defineRule, configure, Field as VField, Form as VForm } from 'vee-validate'
	import { required, min, email } from '@vee-validate/rules'


	const props = defineProps({
		visible: {
			type: Boolean,
			required: true,
			default: false
		},
		editCol: {
			type: Object,
			required: false,
			default: () => {}
		}
	})
	const emit = defineEmits(['closeAddEditSalesColModal', 'addEditSalesCol'])

	const userFormData = ref({
			name: '',
			field: '',
			key: '',
			type: ''
		}),
		visible = ref(false),
		editCol = ref({}),
		types = ref(['String', 'Decimals', 'Datetime'])

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

	const typeFormTxt = computed(() => editCol.value === null || Object.keys(editCol.value).length === 0 ? ['Add', 'Add New'] : ['Edit', 'Save'])

	watch(props, newVal => visible.value = newVal.visible)
	watch(props, newVal => {
		editCol.value = newVal.editCol
		userFormData.value = {...newVal.editCol}
	})

	const closeModal = () => {
		visible.value = false
		editCol.value = {}
		emit('closeAddEditSalesColModal')
	}

	const addEditSalesCol = () => {
		userFormData.value.field = userFormData.value.name.replaceAll(' ', '_').toLowerCase()
		emit('addEditSalesCol', userFormData.value)
		closeModal()
	}
</script>