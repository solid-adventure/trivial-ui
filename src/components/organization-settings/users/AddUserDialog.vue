<template>
	<Dialog v-model:visible="visible" modal @hide="closeModal" header="Add New User" class="org-settings__dialog">
		<VForm v-slot="{ meta }">
			<div class="flex flex-column gap-1 my-2">
				<label for="fullname" class="mb-1">Full Name</label>
				<VField id="fullname" name="full name" :rules="{ required, min: 6 }" v-slot="{ field, errors }">
					<InputText v-model.trim="userFormData.name" v-bind="field" class="flex-auto" :class="{'p-invalid': errors.length}" autocomplete="off" placeholder="ex. John Doe" />
					<span v-if="errors.length" class="p-error text-xs mt-1">{{ errors[0] }}</span>
				</VField>
			</div>
			<div class="flex flex-column gap-1 mt-5">
				<label for="email" class="mb-1">Email Address</label>
				<VField id="email" name="email" :rules="{ required, email }" v-slot="{ field, errors }">
					<InputText v-model.trim="userFormData.email" v-bind="field" class="flex-auto w-full" autocomplete="off" placeholder="ex. johndoe@gmail.com" />
					<span v-if="errors.length" class="p-error text-xs mt-1">{{ errors[0] }}</span>
				</VField>
			</div>

			<div class="flex flex-column gap-1 my-3">
				<p class="font-normal">User's Role</p>

				<div class="flex flex-column gap-3">
					<div v-for="role in roles" :key="role.key" class="flex flex-wrap align-items-center">
						<RadioButton v-model="userFormData.invitation_metadata.role" :inputId="role.key" :value="role.name" />
						<label :for="role.key" class="ml-2 capitalize">{{ role.name }}</label>
						<p class="pl-5 mt-2 p-text-secondary line-height-3">{{ role.info }}</p>
					</div>
				</div>
			</div>

			<div class="flex justify-content-end gap-2">
				<Button type="button" label="Cancel" text @click="closeModal" class="modal__cancel--btn" />
				<Button type="button" label="Add New and Send Invite" @click="addNewUser" :disabled="!meta.valid" class="modal__next--btn" />
			</div>
		</VForm>
	</Dialog>
</template>

<script setup>
	import { ref, watch } from "vue"
	import { defineRule, configure, Field as VField, Form as VForm } from 'vee-validate'
	import { required, min, email } from '@vee-validate/rules'


	const props = defineProps(['visible'])
	const emit = defineEmits(['closeUserModal', 'addNewUser'])

	const userFormData = ref({
			name: '',
			email: '',
			invitation_metadata: {
				org_id: '', 
				role: 'member',
			},
			trivial_ui_url: ''
		}),
		roles = ref([
			{ name: 'member', key: 'member', info: 'User will have view-only privileges of all apps and users in this organization. They will only be able to update apps they have been explicitly granted permissions for, or if they are the owner of the app.' },
			{ name: 'admin', key: 'admin', info: 'User will be able to edit all apps in this organization, as well as add and remove users.' },
		]),
		visible = ref(false)

	// Define validation rules and use vee validate
	defineRule('required', required);
	defineRule('min', min)
	defineRule('email', email)

	// Configure vee-validate
	configure({
		generateMessage: context => {
			const messages = {
				required: `The field ${context.field} is required.`,
				email: `The field ${context.field} must be a valid email.`,
				min: `The field ${context.field} must be at least ${context.rule.params[0]} characters.`,
			}

			return messages[context.rule.name] ? messages[context.rule.name] : `The field ${context.field} is invalid.`;
		}
	})

	watch(props, newVal => visible.value = newVal.visible)

	const closeModal = () => {
		visible.value = false
		emit('closeUserModal')
	}

	const addNewUser = () => {
		emit('addNewUser', userFormData.value)
		closeModal()
	}
</script>