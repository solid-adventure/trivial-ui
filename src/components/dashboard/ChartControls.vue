<!-- ChartControls.vue -->
<template>
  <div class="flex gap-3 flex-wrap">
    <!-- Group By Multi-select -->
    <div v-if="showGroupBy">
      <FloatLabel class="w-full md:w-20rem">
        <MultiSelect
          id="group-by"
          v-model="modelValue.groupBy"
          :options="reportGroupOptions"
          optionLabel="label"
          optionValue="value"
          display="chip"
          :maxSelectedLabels="4"
          class="w-full"
          @change="emitUpdate"
        />
        <label for="group-by">Select Groups</label>
      </FloatLabel>
    </div>

    <!-- Timezone Dropdown -->
    <div v-if="showTimezone">
      <FloatLabel class="w-14rem">
        <Dropdown
          id="timezone"
          v-model="modelValue.timezone"
          :options="chart.default_timezones"
          class="w-full"
          @change="emitUpdate"
        />
        <label for="timezone">Timezone</label>
      </FloatLabel>
    </div>

    <!-- Date Range Dropdown -->
    <div v-if="showDateRange">
      <FloatLabel class="w-14rem">
        <Dropdown
          id="date-range"
          v-model="modelValue.namedDateRange"
          :options="namedDateRanges()"
          optionLabel="label"
          optionValue="value"
          class="w-full"
          @change="emitUpdate"
        />
        <label for="date-range">Dates</label>
      </FloatLabel>
    </div>

    <!-- Group By Period Dropdown -->
    <div v-if="showGroupByPeriod">
      <FloatLabel class="w-14rem">
        <Dropdown
          id="group-by-period"
          v-model="modelValue.groupByPeriod"
          :options="groupByPeriodOptions()"
          class="w-full"
          @change="emitUpdate"
        />
        <label for="group-by-period">Group By</label>
      </FloatLabel>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import FloatLabel from 'primevue/floatlabel'
import MultiSelect from 'primevue/multiselect'
import Dropdown from 'primevue/dropdown'
import { groupByPeriodOptions } from '@/composable/groupByPeriodOptions'
import { namedDateRanges } from '@/composable/namedDateRanges'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  chart: {
    type: Object,
    required: true
  },
  showGroupBy: {
    type: Boolean,
    default: true
  },
  showTimezone: {
    type: Boolean,
    default: true
  },
  showDateRange: {
    type: Boolean,
    default: true
  },
  showGroupByPeriod: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const reportGroupOptions = computed(() => {
  return Object.keys(props.chart.report_groups || {}).map(key => ({
    value: key,
    label: key.replaceAll('_', ' ')
  }))
})

const emitUpdate = () => {
  emit('update:modelValue', props.modelValue)
}
</script>