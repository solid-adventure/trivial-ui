<template>
	<Dialog v-model:visible="csvDialogOpen" modal :closable="false" class="csv__dialog">
		<div class="flex align-items-center justify-content-between gap-3 mb-3">
			<template v-if="(streamPending || streamOpen) && !cancelCSV">
				<h3 class="m-0 text-lg font-normal">Generating CSV...</h3>
				<span class="text-lg font-normal text-600">{{ streamProgress }}%</span>
			</template>

			<template v-if="cancelCSV">
				<h3 class="m-0 text-lg font-normal">Cancel Export</h3>
			</template>

			<template v-if="streamFailed">
				<h3 class="m-0 text-lg font-normal">Failed to Generate CSV</h3>
			</template>
		</div>
		<div v-if="(streamPending || streamOpen) && !cancelCSV" class="flex align-items-center justify-content-center mb-2">
			<ProgressBar :value="streamProgress" aria-label="CSV Progress Download Status" class="w-full h-1rem csv__dialog--progersbar" />
		</div>

		<div class="flex align-items-center mb-4 text-sm text-600">
			<template v-if="streamPending">
				<p class="m-0">Preparing your download now...</p>
			</template>

			<template v-if="streamOpen && !cancelCSV">
				<p class="w-full m-0 text-right">Generated <span class="csv__dialog--streamed-lines">{{ streamedLines }}</span> out of {{ streamedLinesTotal }} rows</p>
			</template>

			<template v-if="cancelCSV">
				<p class="m-0">Are you sure you want to cancel the export?</p>
			</template>

			<template v-if="streamFailed">
				<p class="m-0 text-base text-red-500">Error: {{ streamErrorMessage }}!</p>
			</template>
		</div>

		<div class="flex align-items-center justify-content-between gap-1">
			<template v-if="(streamPending || streamOpen) && !cancelCSV">
				<p class="text-xs text-600">
					<i class="pi pi-exclamation-triangle text-600" />
					This might take some time. Closing this page will cancel the download.
				</p>
				<Button type="button" label="Cancel" text class="csv__dialog--cancel-btn" @click="csvExportShow()" />
			</template>

			<template v-if="cancelCSV">
				<Button type="button" label="Stop Export" text class="csv__dialog--cancel-btn" @click="cancelStream()" />
				<Button type="button" label="Keep the Export Running" class="csv__dialog--btn" @click="csvExportHide()" />
			</template>

			<template v-if="streamFailed">
				<Button type="button" label="OK" class="csv__dialog--btn" @click="resetStreamInfo(), closeCSVDialog()" />
			</template>
		</div>

		<div v-if="streamClosed" class="flex flex-column align-items-center justify-content-center gap-2">
			<Icon icon="fa6-solid:circle-check" class="w-3rem h-3rem text-primary" />
			<h3 class="m-0 text-lg font-normal font-semibold">Success</h3>

			<p class="flex align-items-center text-sm text-600 gap-1">
				<i class="pi pi-check-circle text-green-500" />
				CSV Export completed.
			</p>

			<Button type="button" label="OK" class="csv__dialog--btn" @click="resetStreamInfo(), closeCSVDialog()" />
		</div>
	</Dialog>
</template>

<script setup>
	import { ref, onMounted, computed, watch } from 'vue'
	import { useStore } from 'vuex'
	import { Icon } from '@iconify/vue'


	const props = defineProps({
		csvDialogVisible: {
			type: Boolean,
			reqired: true,
			default: false
		},
		regId: {
			type: Number,
			required: true,
			default: 0
		},
		queryString: {
			type: String,
			reqired: true,
			default: ''
		},
		registerName: {
			type: String,
			required: false,
			default: 'CSV_Export'
		}
	})

	const emit = defineEmits(['closeCSVExportDialog'])
	
	const store = useStore(),
		streamErrorMessage = ref(''),
		cancelCSV = ref(false),
		csvDialogOpen = ref(false)


	const streamStatus = computed(() => store.getters.getStreamStatus)
	const streamProgress = computed(() => parseInt(Math.floor((streamedLines.value / streamedLinesTotal.value) * 100)))
	const streamedLines = computed(() => store.getters.getStreamedLines)
	const streamedLinesTotal = computed(() => store.getters.getStreamedLinesTotal)
	const streamPending = computed(() => streamStatus.value === 'pending')
	const streamOpen = computed(() => streamStatus.value === 'open')
	const streamClosed = computed(() => streamStatus.value === 'closed')
	const streamFailed = computed(() => streamStatus.value === 'failed')

	watch(props, newVal => {
		if (newVal.csvDialogVisible) {
			csvDialogOpen.value = newVal.csvDialogVisible
			exportCSV()
		} else {
			csvDialogOpen.value = newVal.csvDialogVisible
		}
	})

	const cancelStream = () => { 
		store.dispatch('cancelStream')
		csvExportHide()
		closeCSVDialog()
	}
	const resetStreamInfo = () => store.dispatch('resetStreamInfo')
	const csvExportShow = () => cancelCSV.value = true
	const csvExportHide = () => cancelCSV.value = false
	const openCSVDialog = () => csvDialogVisible.value = true
	const closeCSVDialog = () => emit('closeCSVExportDialog')

	const exportCSV = async () => {
		store.dispatch('setStreamValue', 'pending')

		try {
			let csvData = await store.state.Session.apiCall(
				`/register_items.csv?register_id=${props.regId}&${props.queryString}`,
				'GET',
				undefined,
				'csv',
				true
			)

			if (!streamClosed.value && csvData) {
				forceFileDownload(csvData)
			}

			resetStreamInfo()
		} catch (err) {
			console.log(err)
			streamErrorMessage.value = err.message
			store.dispatch('setStreamValue', 'failed')
		}
	}

	const forceFileDownload = response => {
		const url = window.URL.createObjectURL(
			new Blob([response]),
			{type: 'text/csv;charset=utf-8'}
		),
		link = document.createElement('a')

		link.href = url
		link.setAttribute('download', `${props.registerName}.csv`)
		document.body.appendChild(link)
		link.click()
	}
</script>