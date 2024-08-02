<template>
	<Dialog v-model:visible="visible" :draggable="false" modal @hide="closeModal" header="Customize Gross Revenue" class="org-settings__dialog revenue__gross">

		<h4 class="mt-5 font-normal font-semibold">Reporting Groups <span class="text-muted">{{ reportingGroupsCountTxt }}</span></h4>
		<p class="mt-1 mb-5 text-muted text-sm">Use 3 empty slots in the list below to customize your table columns.</p>

		<draggable :list="reportingGroups" @change="log" group="id" item-key="id" :disabled="isDraggableDisabled" class="flex flex-column row-gap-1 revenue__gross__draggable" :class="{'bg-none': isDraggableDisabled}">
			<template #item="{ element, index }">
				<Accordion class="border-top-1 border-200" :class="{'border-bottom-1': (index === reportingGroups.length - 1)}">
					<AccordionTab :pt="{header: {class: 'revenue__gross'}, headerAction: {class: 'revenue__gross__tab__action'}}">
						<template #header>
							<div class="flex column-gap-2 align-items-center">
								<Icon icon="fa-solid:grip-vertical" class="revenue__gross--icon draggable" />
								<span class="revenue__gross--title">{{ element.name }}</span>
								<span class="font-normal">({{ element.type }})</span>
								<Icon icon="fa-solid:check-circle" class="revenue__gross--icon" />
							</div>
						</template>
						<!--<div class="flex flex-column justify-content-between">
							<div v-for="(item, index) of element.values" :key="index" class="flex align-items-center column-gap-2 py-3 border-top-1 border-200" :class="{ 'border-bottom-1': (index === element.values.length - 1)}">
								<Checkbox v-model="element.selectedValues" :inputId="index.toString()" name="category" :value="item" />
								<label :for="index.toString()" class="text-sm font-medium">{{ item }}</label>
							</div>
						</div>-->
					</AccordionTab>
				</Accordion>
			</template>
		</draggable>

		<h4 class="my-5 font-normal font-semibold">My Groups</h4>

		<draggable class="list-group" :list="groupsColumn" group="id" @change="log" itemKey="id">
			<template #item="{ element, index }"> 
				<Accordion class="border-top-1 border-200" :class="{'border-bottom-1': (index === groupsColumnArr.length - 1)}">
					<AccordionTab :pt="{header: {class: 'revenue__gross'}}">
						<template #header>
							<div class="flex column-gap-2 align-items-center">
								<Icon icon="fa-solid:grip-vertical" class="revenue__gross--icon draggable" />
								<span class="revenue__gross--title">{{ element.name }}</span>
								<!--<span class="font-normal">({{ element.type }})</span> -->
								<Icon icon="fa-solid:check-circle" class="revenue__gross--icon" />
							</div>
						</template>
						<!--<div class="flex flex-column justify-content-between">
							<div v-for="(item, index) of element.values" :key="index" class="flex align-items-center column-gap-2 py-3 border-top-1 border-200" :class="{ 'border-bottom-1': (index === element.values.length - 1)}">
								<Checkbox v-model="element.selectedValues" :inputId="index.toString()" name="category" :value="item" />
								<label :for="index.toString()" class="text-sm font-medium">{{ item }}</label>
							</div>
						</div>-->
					</AccordionTab>
				</Accordion>
			</template>
		</draggable>

		<div class="flex justify-content-end gap-2 mt-5">
			<Button type="button" label="Cancel" text @click="closeModal" class="modal__cancel--btn" :pt="{label: {class: 'font-semibold'}}" />
			<Button type="button" label="Save" class="modal__next--btn" @click="saveSelected" />
		</div>
	</Dialog>
</template>

<script setup>
	import draggable from "vuedraggable"
	import { ref, watch, computed, onMounted, toRaw } from "vue"
	import { Icon } from '@iconify/vue'

	const props = defineProps(['visible', 'groupsColumnArr'])
	const emit = defineEmits(['closeModal', 'saveSelected'])

	const visible = ref(false),
		groupsColumn = ref([
			/*{id: 1, name: 'Customer Type', values: ['Retail', 'Wholesale', 'Services'], type: 'String', selectedValues: ['Retail', 'Wholesale', 'Services']},
			{id: 2, name: 'Location', values: ['Location 1', 'Location 2', 'Location 3'], type: 'String', selectedValues: ['Location 1', 'Location 2', 'Location 3']},
			{id: 3, name: 'Example 1', values: ['Some value 1', 'Some value 2', 'Some value 3'], type: 'Strign', selectedValues: ['Some value 1', 'Some value 2', 'Some value 3']},
			{id: 4, name: 'My Column 1', values: ['Some value 1', 'Some value 2', 'Some value 3'], type: 'String', selectedValues: ['Some value 1', 'Some value 2', 'Some value 3']},
			{id: 5, name: 'My Column 2', values: ['Some value 1', 'Some value 2', 'Some value 3'], type: 'String', selectedValues: ['Some value 1', 'Some value 2', 'Some value 3']},
			{id: 6, name: 'My Column 3', values: ['Some value 1', 'Some value 2', 'Some value 3'], type: 'Strign', selectedValues: ['Some value 1', 'Some value 2', 'Some value 3']}*/
		]),
		reportingGroups = ref([]),
		reportingGroupsLimit = 3


	watch(() => props.visible, newVal => visible.value = newVal)
	watch(() => props.groupsColumnArr, newVal => groupsColumn.value = newVal)
	const isDraggableDisabled = computed(() => reportingGroups.value.length === reportingGroupsLimit)
	const reportingGroupsCountTxt = computed(() => `(${reportingGroupsLength.value} of 3)`)
	const reportingGroupsLength = computed(() => reportingGroups.value.length)

	onMounted(async () => {
		//setSelectedReportingGropus()
		groupsColumn.value = props.groupsColumnArr
	})

	const setSelectedReportingGropus = () => reportingGroups.value = [...props.selected]

	const saveSelected = () => {
		let selectedCols = []

		reportingGroups.value.forEach(item => selectedCols.push({name: item.name, type: item.type, selectedValues: item.selectedValues, key: item.key, selected: true}))
		groupsColumn.value.forEach(item => selectedCols.push({name: item.name, type: item.type, selectedValues: item.selectedValues, key: item.key, selected: false}))

		emit('saveSelected', selectedCols)

		closeModal()
		selectedCols = []
	}

	const resetDraggableItems = () => {
		groupsColumn.value = [...reportingGroups.value, ...groupsColumn.value]
		reportingGroups.value = []
	}

	const closeModal = () => {
		resetDraggableItems()
		visible.value = false
		emit('closeModal')
	}

	const log = event => console.log('drag - ', event)
</script>