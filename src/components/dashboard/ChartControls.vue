<template>
  <div class="w-full">
    <div class="flex gap-3 flex-wrap">
      <!-- Group By Multi-select -->
      <div v-if="showGroupBy" class="headroom">
        <FloatLabel class="w-full md:w-20rem">
          <MultiSelect
            id="group-by"
            v-model="modelValue.groupBy"
            :options="modelValue.groupByOptions"
            optionLabel="label"
            optionValue="value"
            display="chip"
            :maxSelectedLabels="4"
            class="w-full"
            @change="emitUpdate"
          />
          <label for="group-by">Revenue Groups</label>
        </FloatLabel>
      </div>

      <!-- Timezone Dropdown -->
      <div v-if="showTimezone" class="headroom">
        <FloatLabel class="w-14rem">
          <Dropdown
            id="timezone"
            v-model="modelValue.timezone"
            :options="modelValue.timezoneOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            @change="emitUpdate"
          />
          <label for="timezone">Timezone</label>
        </FloatLabel>
      </div>

      <!-- Date Range Dropdown -->
      <div v-if="showDateRange" class="headroom">
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
          <label for="date-range">Date Range</label>
        </FloatLabel>
      </div>

      <!-- Group By Period Dropdown -->
      <div v-if="showGroupByPeriod" class="headroom">
        <FloatLabel class="w-14rem">
          <Dropdown
            id="group-by-period"
            v-model="modelValue.groupByPeriod"
            :options="groupByPeriodOptions()"
            class="w-full"
            @change="emitUpdate"
          />
          <label for="group-by-period">Periods</label>
        </FloatLabel>
      </div>
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

const emitUpdate = () => {
  emit('update:modelValue', props.modelValue)
}
</script>

<style scoped>
.headroom {
  margin-top: 1.5rem;
}

</style>