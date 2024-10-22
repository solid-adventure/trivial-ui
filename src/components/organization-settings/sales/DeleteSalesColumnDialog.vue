<template>
	<Dialog v-model:visible="visible" modal @hide="closeModal" header="Delete Column" class="org-settings__dialog">
		
		<p class="mt-1">Are you sure you want to proceed with deleting column <strong class="capitalize">{{ deletedCol.name }}</strong>? Existing data in the table will not be deleted. Re-using the column later may produce unexpected results.</p>

		<div class="flex justify-content-end align-items-center gap-2">
			<Button type="button" label="Cancel" text @click="closeModal" class="modal__cancel--btn" />
			<Button type="button" severity="danger" label="Delete" @click="deleteSalesColumn" class="modal__next--btn delete--btn" />
		</div>
	</Dialog>
</template>

<script setup>
	import { ref, watch } from 'vue'

	const props = defineProps(['visible', 'deletedCol'])
	const emit = defineEmits(['closeDeleteSalesColModal', 'deleteSalesCol'])

	const visible = ref(false)
	let deletedCol = null

	watch(props, newVal => {
		visible.value = newVal.visible
		deletedCol = newVal.deletedCol
	})

	const closeModal = () => {
		visible.value = false
		emit('closeDeleteSalesColModal')
	}

	const deleteSalesColumn = () => {
		deletedCol.field = null
		emit('deleteSalesCol', deletedCol)
		closeModal()
	}
</script>