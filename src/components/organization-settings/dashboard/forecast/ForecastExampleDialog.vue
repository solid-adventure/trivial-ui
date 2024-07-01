<template>
	<Dialog v-model:visible="visible" :draggable="false" modal @hide="closeModal" header="Example of Forecast" class="org-settings__dialog w-6">
		<Panel header="Forecast" class="shadow-2">
			<div class="flex flex-wrap gap-5">
				<div v-for="(item, index) in selected" :key="index" class="w-3 border-300" :class="{'border-right-1': index !== lastItem}">
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

	const props = defineProps(['visible', 'selected'])
	const emit = defineEmits(['closeExampleModal'])

	const visible = ref(false)

	watch(props, newVal => visible.value = newVal.visible)

	const lastItem = computed(() => props.selected.length - 1)

	const closeModal = () => {
		visible.value = false
		emit('closeExampleModal')
	}
</script>