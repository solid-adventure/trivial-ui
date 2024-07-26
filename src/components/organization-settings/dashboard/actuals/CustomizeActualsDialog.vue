<template>
	<Dialog v-model:visible="visible" :draggable="false" modal @hide="closeModal" header="Customize Actuals" class="org-settings__dialog">

		<h4 class="mb-5 font-normal">Available Data</h4>

		<div class="flex flex-wrap justify-content-between row-gap-3 mb-5">
			<div v-for="(category, index) of categories" :key="index" class="flex align-items-center column-gap-2 w-5">
				<Checkbox v-model="selectedCategories" :inputId="index.toString()" name="category" :value="category" />
				<label :for="index.toString()" class="text-sm">{{ category.name }}</label>
			</div>
		</div>

		<div class="flex justify-content-end gap-2">
			<Button type="button" label="Cancel" text @click="closeModal" class="modal__cancel--btn" :pt="{label: {class: 'font-semibold'}}" />
			<Button type="button" label="Save" class="modal__next--btn" @click="saveSelected" />
		</div>
	</Dialog>
</template>

<script setup>
	import { ref, watch, onMounted } from "vue"


	const props = defineProps(['visible', 'selected'])
	const emit = defineEmits(['closeModal', 'saveSelected'])

	watch(props, newVal => visible.value = newVal.visible)

	const visible = ref(false),
		categories = ref([
			{name: 'Last Day Revenue', value: '$6,885', icon:'prime:arrow-up', class: 'up'},
			{name: 'Last 7 Days Revenue', value: '$54,903', icon:'prime:arrow-down', class: 'down'},
			{name: 'Last 30 Days Revenue', value: '$231,947', icon:'prime:arrow-up', class: 'up'},
			{name: 'Last 90 Days Revenue', value: '$657,295', icon:'prime:arrow-up', class: 'up'},
			{name: 'Year to Date Revenue', value: '$884,225', icon:'prime:arrow-down', class: 'down'}
		]),
		selectedCategories = ref([])

	onMounted(() => {
		setSelectedCategories()
	})

	const closeModal = () => {
		visible.value = false
		emit('closeModal')
	}

	const setSelectedCategories = () => selectedCategories.value = props.selected

	const saveSelected = () => {
		// Send data to the API and save to DB

		// Update data to actual section (in memory)
		emit('saveSelected', selectedCategories.value)

		closeModal()
	}
</script>