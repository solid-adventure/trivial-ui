<template>
	<Dialog v-model:visible="visible" :draggable="false" modal @hide="closeModal" header="Customize Actuals" class="org-settings__dialog">

		<!--<h4 class="mb-5 font-normal">Available Data</h4>

		<div class="flex flex-wrap justify-content-between row-gap-3 mb-5">
			<div v-for="(category, index) of categories" :key="index" class="flex align-items-center column-gap-2 w-5">
				<Checkbox v-model="selectedCategories" :inputId="index.toString()" name="category" :value="category" />
				<label :for="index.toString()" class="text-sm">{{ category.name }}</label>
			</div>
		</div>-->

		<div class="mt-4 mb-5">
			<div class="flex align-items-center gap-2">
				<Checkbox v-model="invertSign" inputId="invertSign" name="invertSign" binary />
				<label for="invertSign">Flip Sign</label>
			</div>
			<p class="my-1 pl-4 text-sm text-500">Multiply all values by -1 for reporting</p>
		</div>

		<div class="flex justify-content-end gap-2">
			<Button type="button" label="Cancel" text @click="closeModal" class="modal__cancel--btn" :pt="{label: {class: 'font-semibold'}}" />
			<Button type="button" label="Save" class="modal__next--btn" @click="saveSelected" />
		</div>
	</Dialog>
</template>

<script setup>
	import { ref, watch, onMounted } from "vue"


	const props = defineProps(['visible', 'selected', 'initInvertSign'])
	const emit = defineEmits(['closeModal', 'saveSelected'])

	watch(props, newVal => visible.value = newVal.visible)
	watch(props, newVal => invertSign.value = newVal.initInvertSign)

	const visible = ref(false),
		invertSign = ref(false),
		categories = ref([
			{ key: 'last1DayData', name: 'Last Day Revenue', value: null, icon: null, class: null },
			{ key: 'last7DaysData', name: 'Last 7 Days Revenue', value: null, icon: null, class: null },
			{ key: 'last1MonthsData', name: 'Last 30 Days Revenue', value: null, icon: null, class: null },
			{ key: 'last3MonthsData', name: 'Last 90 Days Revenue', value: null, icon: null, class: null },
			{ key: 'last1YearData', name: 'Year to Date Revenue', value: null, icon: null, class: null }
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
		let customizeOptions = {
			//selectedCategories: selectedCategories.value,
			invertSign: invertSign.value
		}

		emit('saveSelected', JSON.parse(JSON.stringify(customizeOptions)))

		closeModal()
		//customizeOptions.selectedCategories = []
		//customizeOptions.invertSign = false
		//invertSign.value = false
	}
</script>