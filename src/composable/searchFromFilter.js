export function searchFromFilter(filters) {
  if (!filters) return []

  return Object.entries(filters).reduce((acc, [column, filter]) => {
    // Skip if no constraints
    if (!filter.constraints.length) return acc

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