<template>
	<Dialog v-model:visible="visible" :draggable="false" modal @hide="closeModal" header="Example of Gross Revenue" class="org-settings__dialog revenue__gross w-10">
		<GrossRevenue />
	</Dialog>
</template>

<script setup>
	import { ref, watch } from "vue"
	import GrossRevenue from '@/components/dashboard/GrossRevenue.vue'

	const props = defineProps(['visible'])
	const emit = defineEmits(['closeExampleModal'])

	const visible = ref(false)

	watch(props, newVal => visible.value = newVal.visible)

	const closeModal = () => {
		visible.value = false
		emit('closeExampleModal')
	}
</script>