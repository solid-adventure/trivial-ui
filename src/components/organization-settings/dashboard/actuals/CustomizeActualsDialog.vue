<template>
	<Dialog v-model:visible="visible" modal @hide="closeModal" header="Customize Actuals" class="org-settings__dialog">

		<h4 class="mb-5">Available Data</h4>

		<div class="flex flex-wrap gap-3 mb-5">
			<div v-for="category of categories" :key="category.key" class="flex align-items-center gap-2 w-5 mb-2">
				<Checkbox v-model="selectedCategories" :inputId="category.key" name="category" :value="category.name" />
				<label :for="category.key" class="text-xs">{{ category.name }}</label>
			</div>
		</div>

		<div class="flex justify-content-end gap-2">
			<Button type="button" label="Cancel" text @click="closeModal" class="modal__cancel--btn" />
			<Button type="button" label="Save" class="modal__next--btn" />
		</div>
	</Dialog>
</template>

<script setup>
	import { ref, watch } from "vue"


	const props = defineProps(['visible'])
	const emit = defineEmits(['closeActualsModal'])

	watch(props, newVal => visible.value = newVal.visible)

	const visible = ref(false),
		categories = ref([
			{name: "Last Day Revenue", key: "1"},
			{name: "Last 7 Days Revenue", key: "2"},
			{name: "Last 30 Days Revenue", key: "3"},
			{name: "Last 90 Days Revenue", key: "4"},
			{name: "Year to Date Revenue", key: "5"},
			{name: "Data Example 1", key: "6"},
			{name: "Data Example 2", key: "7"},
			{name: "Data Example 3", key: "8"},
		]),
		selectedCategories = ref([
			'Last Day Revenue', 
			'Last 7 Days Revenue', 
			'Last 30 Days Revenue',
			'Last 90 Days Revenue',
			'Year to Date Revenue'
		])


	const closeModal = () => {
		visible.value = false
		emit('closeActualsModal')
	}
</script>