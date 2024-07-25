<template>
	<Dialog v-model:visible="visible" modal @hide="closeModal" header="Delete User" class="org-settings__dialog">
		
		<p class="mt-1">Are you sure you want to proceed with deleting User <strong>{{ deletedUser.name }}</strong>? By deleting this User, previously granted permissions will be deleted.</p>

		<div class="flex justify-content-end align-items-center gap-2">
			<Button type="button" label="Cancel" text @click="closeModal" class="modal__cancel--btn" />
			<Button type="button" severity="danger" label="Delete" @click="emit('deleteUser', deletedUser)" class="modal__next--btn delete--btn" />
		</div>
	</Dialog>
</template>

<script setup>
	import { ref, watch } from 'vue'

	const props = defineProps(['visible', 'deletedUser'])
	const emit = defineEmits(['closeDeleteUserModal', 'deleteUser'])

	const visible = ref(false)

	watch(props, newVal => visible.value = newVal.visible)

	const closeModal = () => {
		visible.value = false
		emit('closeDeleteUserModal')
	}
</script>