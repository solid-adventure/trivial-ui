import { formatDateRange } from '@/composable/useDateRange'
import { useDateTimeZoneOptions } from '@/composable/dateTimeZoneOptions';

const { timeZoneOptions } = useDateTimeZoneOptions()

export function searchFromFilter(filters) {
  if (!filters) return []

  // Pre-process filters to handle dateIs
  const processedFilters = preprocessFilters(filters)

  return Object.entries(processedFilters).reduce((acc, [column, filter]) => {
    // Skip if no constraints
    if (!filter.constraints?.length) return acc

    // Process each constraint
    filter.constraints.forEach(constraint => {
      // Skip null values
      if (constraint.value === null) return

      // Transform matchMode to corresponding API operator
      let operator = '='
      switch (constraint.matchMode) {
        case 'startsWith':
          operator = '='
          break
        case 'contains':
          operator = '='
          break
        case 'notContains':
          operator = '!='
          break
        case 'endsWith':
          operator = '='
          break
        case 'equals':
          operator = '='
          break
        case 'notEquals':
          operator = '!='
          break
        case 'lt':
          operator = '<'
          break
        case 'lte':
          operator = '<='
          break
        case 'gt':
          operator = '>'
          break
        case 'gte':
          operator = '>='
          break
        case 'dateAfter':
          operator = '>'
          break
        case 'dateBefore':
          operator = '<'
          break
        // Add more cases as needed
      }

      acc.push({
        c: column,
        o: operator,
        p: constraint.value
      })
    })

    return acc
  }, [])
}

function preprocessFilters(filters) {
  if (!filters) return {}
  const processedFilters = {}
  Object.entries(filters).forEach(([column, filter]) => {

    // dateIs comes as a single filter, which we expand to a midnight-midnight range
    processedFilters[column] = expandDateIsToRange(filter)
  })
  return processedFilters
}

function expandDateIsToRange(filter) {
  // Skip if no constraints
  if (!filter.constraints?.length) return filter

  // Skip if not dateIs
  if (filter.constraints[0].matchMode != 'dateIs') return filter

  // convert to pair of midnight to midnight dates in the default TZ
  return {
    constraints: [
      {
        value: formatDateRange(filter.constraints[0].value, timeZoneOptions.timeZone),
        matchMode: 'gte'
      },
      {
        value: formatDateRange(filter.constraints[0].value, timeZoneOptions.timeZone, true),
        matchMode: 'lte'
      }
    ]
  }
}