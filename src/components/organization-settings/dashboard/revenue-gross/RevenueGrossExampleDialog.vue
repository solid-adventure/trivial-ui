<template>
	<Dialog v-model:visible="visible" modal @hide="closeModal" header="Example of Actuals" class="org-settings__dialog w-10">
		<Panel header="Actuals" class="shadow-2">
			<div class="flex flex-wrap gap-5">
				<div v-for="(item, index) in selectedActuals" :key="index" class="w-2 border-300" :class="{'border-right-1': index !== lastItem}">
					<p class="m-0 text-md text-muted">{{ item.name }}</p>
					<div class="flex align-items-center gap-1 mt-1">
						<p class="m-0 text-xl font-semibold">{{ item.value }}</p>
						<Icon :icon="item.icon" class="organization-settings__icon text-xl" :class="item.class"/>
					</div>
				</div>
			</div>
		</Panel>
	</Dialog>
</template>

<script setup>
	import { ref, watch, computed } from "vue"
	import { Icon } from '@iconify/vue'

	const props = defineProps(['visible', 'selectedActuals'])
	const emit = defineEmits(['closeActualsExampleModal'])

	const visible = ref(false)

	watch(props, newVal => visible.value = newVal.visible)

	const lastItem = computed(() => props.selectedActuals.length - 1)
	const closeModal = () => {
		visible.value = false
		emit('closeActualsExampleModal')
	}
</script>