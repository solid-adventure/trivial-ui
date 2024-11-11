<template>
	<Dialog v-model:visible="visible" :draggable="false" modal @hide="closeModal" header="Add New Chart" class="flex flex-column org-settings__dialog revenue__gross org-settings__dialog__newchart">
		<!--<div class="my-3">
			<div class="flex flex-column gap-2">
				<h3 class="m-0 text-base font-normal">Can Trivial AI help you today?</h3>
				<Textarea v-model="chartForm.prompt" rows="5" cols="30" placeholder="Throw a prompt here to speed up the workflow" class="border-round border-300 p-3" />

				<p class="m-0 text-xs text-500">
					<i class="pi pi-info-circle text-sm" />
					Prompt will affect Rule Name field and When/Then areas.
				</p>
			</div>
		</div>-->

		<VForm v-slot="{ meta }">
			<div class="my-3">
				<div class="flex flex-column gap-2">
					<h3 class="text-xl font-bold">General</h3>

					<div class="flex gap-4">
						<div class="flex flex-column gap-2 w-6">
							<label for="name">Chart Name</label>
							<VField id="name" name="name" :rules="{ required, min: 6 }" v-slot="{ field, errors }">
								<InputText v-model.trim="chartForm.name" v-bind="field" placeholder="ex. Revenue Over Time" required :class="{'p-invalid': errors.length}" />
								<span v-if="errors.length" class="p-error text-xs">{{ errors[0] }}</span>
							</VField>
						</div>
						<div class="flex flex-column gap-2 w-6">
							<label for="period">Period</label>
							<Dropdown id="period" v-model="chartForm.period" :options="periods" optionLabel="name" :disabled="isTypeSummary" placeholder="--Select option--" />
						</div>
					</div>
					<div class="flex gap-4 mt-4">
						<div class="flex flex-column gap-2 w-6">
							<label for="type">Chart Type</label>
							<VField id="type" name="type" :rules="{ required }" v-slot="{ field, errors }">
								<Dropdown v-model="chartForm.type" v-bind="field" :options="types" optionLabel="name" placeholder="--Select option--" required :class="{'p-invalid': errors.length}" />
								<span v-if="errors.length" class="p-error text-xs">{{ errors[0] }}</span>
							</VField>
						</div>
						<div class="flex flex-column gap-2 w-6">
							<label for="color">Color Scheme</label>
							<Dropdown id="color" v-model="chartForm.color" :options="colors" optionLabel="name" :disabled="isTypeTable || isTypeSummary" placeholder="--Select option--" />
						</div>
					</div>
					<div class="mt-4 mb-5">
						<div class="flex align-items-center gap-2">
							<Checkbox v-model="chartForm.invertSign" inputId="invertSign" name="invertSign" binary />
							<label for="invertSign">Flip Sign</label>
						</div>
						<p class="my-1 pl-4 text-sm text-500">Multiply all values by -1 for reporting</p>
					</div>
				</div>
			</div>

			<div class="">
				<div class="flex flex-column gap-2">
					<h3 class="m-0 text-xl font-bold">Groups</h3>

					<h4 class="mt-2 font-normal font-semibold">Reporting Groups <span class="text-muted">{{ reportingGroupsCountTxt }}</span></h4>
					<p class="mt-1 mb-5 text-muted text-sm">Group up to 3 items to customize your chart</p>

					<!-- :disabled="isDraggableDisabled" -->
					<draggable :list="reportingGroups" @change="log" group="id" item-key="id"  class="flex flex-column row-gap-1 revenue__gross__draggable" :class="{'bg-none': reportingGroupsLength > 1}">
						<template #item="{ element, index }">
							<Accordion>
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

					<h4 class="mt-5 mb-2 font-normal font-semibold">My Groups</h4>

					<draggable v-if="groupsColumn" class="list-group" :list="groupsColumn" group="id" @change="log" itemKey="id">
						<template #item="{ element, index }"> 
							<Accordion>
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
					<div v-else>
						<p class="text-sm font-normal">The column list is currently empty. You can always move them back here.</p>
					</div>
				</div>
			</div>

			<div class="flex justify-content-end gap-2 mt-4">
				<Button type="button" label="Cancel" text @click="closeModal" class="modal__cancel--btn" :pt="{label: {class: 'font-semibold'}}" />
				<Button type="button" label="Add New" class="modal__next--btn" @click="addNewChart" :disabled="!meta.valid" />
			</div>
		</VForm>
	</Dialog>
</template>

<script setup>
	import draggable from "vuedraggable"
	import { ref, watch, computed, onMounted, toRaw } from "vue"
	import { Icon } from '@iconify/vue'
	import { useToastNotifications } from '@/composable/toastNotification'
	import { defineRule, configure, Field as VField, Form as VForm } from 'vee-validate'
	import { required, min } from '@vee-validate/rules'
	import { useStore } from 'vuex'
	
	const props = defineProps(['visible', 'groupsColumnArr', 'dashboardId', 'selected'])
	const emit = defineEmits(['closeModal'])

	const visible = ref(false),
		periods = ref([
			{ name: 'Day', code: 'day' },
			{ name: 'Week', code: 'week' },
			{ name: 'Month', code: 'month' },
			{ name: 'Quarter', code: 'quarter' },
			{ name: 'Year', code: 'year' },
			{ name: 'Year to Date', code: 'yeartodate' },
			{ name: 'All', code: 'all' }
		]),
		types = ref([
			{ name: 'Summary Group', code: 'summarygroup' },
			{ name: 'Table', code: 'table' },
			{ name: 'Stacked Bar Chart', code: 'stackedbar' },
			{ name: 'Line Chart', code: 'linechart' },
			{ name: 'Pie Chart', code: 'piechart' },
			//{ name: 'Heatmap', code: 'heatmap' }
		]),
		colors = ref([
			{ name: 'Blue', code: 'blue' },
			{ name: 'Green', code: 'green' },
			{ name: 'Orange', code: 'orange' },
			{ name: 'Purple', code: 'purple' },
			{ name: 'Red', code: 'red' },
			{ name: 'Default', code: 'default' }
		]),
		chartForm = ref({
			//prompt: '',
			name: '',
			period: '',
			type: '',
			color: '',
			invertSign: false
		}),
		groupsColumn = ref([]),
		reportingGroups = ref([]),
		reportingGroupsLimit = 3,
		{ showSuccessToast, showErrorToast, showInfoToast } = useToastNotifications(),
		store = useStore()

	// Define validation rules and use vee validate
	defineRule('required', required)
	defineRule('min', min)

	// Configure vee-validate
	configure({
		generateMessage: context => {
			const messages = {
				required: `The field ${context.field} is required.`,
				min: `The field ${context.field} must be at least ${context.rule.params[0]} characters.`
			}

			return messages[context.rule.name] ? messages[context.rule.name] : `The field ${context.field} is invalid.`
		}
	})

	const isDraggableDisabled = computed(() => reportingGroups.value.length > reportingGroupsLimit)
	const reportingGroupsCountTxt = computed(() => `(${reportingGroupsLength.value} of 3)`)
	const reportingGroupsLength = computed(() => reportingGroups.value.length)
	const regId = computed(() => store.getters.getRegisterId)
	const isTypeTable = computed(() => chartForm.value.type.code === 'table')
	const isTypeSummary = computed(() => chartForm.value.type.code === 'summarygroup')

	watch(props, newVal => visible.value = newVal.visible)
	watch(() => props.groupsColumnArr, newVal => groupsColumn.value = toRaw(newVal))
	watch(() => props.selected, newVal => reportingGroups.value = toRaw(newVal))
	watch(isDraggableDisabled, newVal => {
		if (newVal) {
			let popedEl = reportingGroups.value.pop()
			groupsColumn.value.push(popedEl)
			showInfoToast('Info', 'Maximum of selected reporting groups is 3')
		}
	})
	watch(isTypeTable, newVal => chartForm.value.color = '')
	watch(isTypeSummary, newVal => {
		chartForm.value.period = ''
		chartForm.value.color = ''
	})

	// Set the default values
	watch(chartForm.value, newVal => {
		if (newVal.type !== '' && newVal.color === '') {
			newVal.color = { name: 'Default', code: 'default' }
		} else if (newVal.type !== '' && newVal.period === '') {
			newVal.period = { name: 'All', code: 'all' }
		}
	})


	const initColumns = () => {
		if (props.groupsColumnArr && props.selected) {
			groupsColumn.value = props.groupsColumnArr
			reportingGroups.value = props.selected
		}
	}

	const closeModal = () => {
		visible.value = false
		emit('closeModal')
	}

	const addNewChart = async () => {

		let reportGroups = {
			channel: null,
			customer_id: null,
			entity_id: null,
			entity_type: null,
			income_account: null,
			warehouse: null
		}

		reportingGroups.value.forEach(item => reportGroups[item.key] = true)

		let chartBody = {
			chart: {
				register_id: regId.value,
				name: chartForm.value.name,
				chart_type: chartForm.value.type.code,
				invert_sign: chartForm.value.invertSign,
				color_scheme: chartForm.value.color.code || 'default',
				report_period: chartForm.value.period.code || 'all',
				report_groups: reportGroups
			}
		}

		try {
			let res = await store.state.Session.apiCall(`dashboards/${props.dashboardId}/charts`, 'POST', chartBody)
			
			showSuccessToast('Success', 'Successfully created new chart.')
			closeModal()
		} catch (err) {
			console.log(err)
		}
	}
	const log = event => { /* console.log('drag - ', event) */ }
</script>