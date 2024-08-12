<template>
	<Panel header="Forecast" :pt="{root: {class: 'shadow-2'}, header: {class: 'text-lg'}}">
		<div class="flex flex-wrap1 gap-5 forecast__wrapper">
			<div v-for="(item, index) in selected" :key="index" class="pr-5 border-300 forecast__wrapper__item" :class="{'border-right-1': index !== lastItem}">
				<p class="m-0 text-md text-muted">{{ item.name }}</p>
				<div class="flex align-items-center gap-1 mt-1">
					<p class="m-0 text-xl font-semibold">{{ item.value }}</p>
					<Icon :icon="item.icon" class="indicator__icon text-xl" :class="item.class"/>
				</div>
			</div>
		</div>
	</Panel>
</template>

<script setup>
	import { computed } from "vue"
	import { Icon } from '@iconify/vue'

	const props = defineProps(['selected'])

	const lastItem = computed(() => props.selected.length - 1)
</script>