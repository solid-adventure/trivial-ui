<template>
	<Dialog v-model:visible="visible" :draggable="false" modal @hide="closeModal" header="Example of Forecast" class="org-settings__dialog w-5">
		<Forecast :selected="selected" />
	</Dialog>
</template>

<script setup>
	import { ref, watch, computed } from "vue"
	import Forecast from '@/components/dashboard/Forecast.vue'

	const props = defineProps(['visible', 'selected'])
	const emit = defineEmits(['closeExampleModal'])

	const visible = ref(false)

	watch(props, newVal => visible.value = newVal.visible)

	const closeModal = () => {
		visible.value = false
		emit('closeExampleModal')
	}
</script>