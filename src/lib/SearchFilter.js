export default class SearchFilter {
  constructor(filters, session, app_id, json_column) {
    this.filters = filters
    this.session = session
    this.app_id = app_id
    this.json_column = json_column // This is a hack; we allow a single column to target for a JSON search
    this.possibleFilters = []
  }

  async setPossibleFilters() {
    // Populate with all of the first-level keys in the JSON column
    let keys = await this.session.apiCall(`/activity_entries/keys?col=${this.json_column}&app_id=${this.app_id}`)
    for (let key of keys) {
      this.possibleFilters.push({
        name: key,
        // requiresKey: true,
        column: this.json_column,
        type: 'jsonb'
      })
    }

    // Add extra columns of the table itself
    // TODO, Pass these in from the caller so the class is more flexible
    this.possibleFilters.push(
      {
        name: 'status',
        requiresKey: false,
      },
      // {
      //   name: 'register_item_id',
      //   requiresKey: false,
      // },
      // {
      //   name: 'actitivity_type',
      //   requiresKey: false,
      // },
      // {
      //   name: 'duration_ms',
      //   requiresKey: false,
      // },
      // {
      //   name: 'created_at',
      //   requiresKey: false,
      // },
      // {
      //   name: 'updated_at',
      //   requiresKey: false,
      // },
    )
  }

  async getFilterKeys(filter={}) {
    if (filter.hasOwnProperty('requiresKey') && !filter.requiresKey) { return [] }
    if (filter.name === undefined) { return [] }
    let keys = []
    try {
      keys =  await this.session.apiCall(`/activity_entries/keys?col=${this.json_column}&app_id=${this.app_id}&path={${filter.name}}`)
    } catch (error) {
      console.log(error)
    }
    return keys
  }

  // c = columnn
  // o = operator
  // p = predicate
  paramsForJSONB(key, groupedFilters) {
    return {
        c: key,
        o: '@@', // Additional JSONB_OPERATORS the API supports: %w[? ?& ?| @> @? @@]
        p: groupedFilters.map(f => {
          if (f.operator === '=') { f.operator = '==' }
          if (f.key) {
            return `$.${f.name}.${f.key} ${this.jsonPredicateFromOperator(f.operator)} ${f.value || ''}`.trim()
          } else {
            return `$.${f.name} ${f.operator} ${f.value || ''}`.trim()
          }
        }).join(' && ')
      }
  }

  jsonPredicateFromOperator(operator) {
    switch (operator) {
    case 'IS NULL':
      return `== null`
    case 'IS NOT NULL':
      return '<> null'
    case 'IS TRUE':
      return '== true'
    case 'IS FALSE':
      return '== false'
    default:
      return operator
    }
  }

  paramsForNonJSONB(key, groupedFilters) {
    let out = []
    groupedFilters.map(f => {
      out.push({
        c: key,
        o: f.operator,
        p: f.value?.trim()
      })
    })
    return out
  }

  get filtersGroupedbyColumn() {
    let grouped = {}
    this.filters.forEach(f => {
      if (f.column) {
        if (grouped.hasOwnProperty(f.column)) {
          grouped[f.column].push(f)
        } else {
          grouped[f.column] = [f]
        }
      } else {
        if (grouped.hasOwnProperty(f.name)) {
          grouped[f.name].push(f)
        } else {
          grouped[f.name] = [f]
        }
      }
    })
    return grouped
  }

  get searchParams() {
    let search = []
    for (let key of Object.keys(this.filtersGroupedbyColumn)) {
      let columnType = this.filtersGroupedbyColumn[key][0]?.type
      if (columnType === 'jsonb') {
        // By definition, we get a single object back with conditions stacked into a single predicate
        search.push(this.paramsForJSONB(key, this.filtersGroupedbyColumn[key]))
      } else {
        // With non-jSON columns, we get an array of objects, each with a single predicate
        search = search.concat(this.paramsForNonJSONB(key, this.filtersGroupedbyColumn[key]))
      }
    }
    return search
  }

}