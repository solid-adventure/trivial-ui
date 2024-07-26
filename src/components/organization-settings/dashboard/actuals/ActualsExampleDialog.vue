<template>
	<Dialog v-model:visible="visible" :draggable="false" modal @hide="closeModal" header="Example of Actuals" class="org-settings__dialog w-10">
		<Actuals :selected="selected" />
	</Dialog>
</template>

<script setup>
	import { ref, watch, computed } from "vue"
	import Actuals from '@/components/dashboard/Actuals.vue'

	const props = defineProps(['visible', 'selected'])
	const emit = defineEmits(['closeExampleModal'])

	const visible = ref(false)

	watch(props, newVal => visible.value = newVal.visible)

	const closeModal = () => {
		visible.value = false
		emit('closeExampleModal')
	}
</script>