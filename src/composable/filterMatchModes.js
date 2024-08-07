import { FilterMatchMode, FilterOperator } from 'primevue/api'

export const useFilterMatchModes = () => {
	// Define custom match modes for the date field
	const dateFilterMatchModes = [
		{ label: 'Date is', value: FilterMatchMode.DATE_IS },
		{ label: 'Date is before', value: FilterMatchMode.DATE_BEFORE },
		{ label: 'Date is after', value: FilterMatchMode.DATE_AFTER },
		// { label: 'Date is not', value: FilterMatchMode.DATE_IS_NOT } // 1. Commented because API don't support it yet
	],
	// Define custom match modes for the int field
	numericFilterMatchModes = [
		{ label: 'Equals', value: FilterMatchMode.EQUALS },
		{ label: 'Not Equals', value: FilterMatchMode.NOT_EQUALS },
		{ label: 'Less Than Or Equal To', value: FilterMatchMode.LESS_THAN_OR_EQUAL_TO },
		{ label: 'Less Than', value: FilterMatchMode.LESS_THAN },
		{ label: 'Greater Than Or Equal To', value: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO },
		{ label: 'Greater Than', value: FilterMatchMode.GREATER_THAN }
	],
	// Define custom filter match modes for text fields
	textFilterMatchModes = [
		//{ label: 'Contains', value: FilterMatchMode.CONTAINS },
		//{ label: 'Does not contain', value: FilterMatchMode.NOT_CONTAINS }
		//{ label: 'Starts with', value: FilterMatchMode.STARTS_WITH },
		//{ label: 'Ends with', value: FilterMatchMode.ENDS_WITH },
		{ label: 'Equals', value: FilterMatchMode.EQUALS },
		{ label: 'Not equals', value: FilterMatchMode.NOT_EQUALS }
	],
	// Mapping filter match modes to their corresponding textual or mathematical signs
	filterMatchModeMapping = {
		between: 'between',
		contains: 'contains',
		endsWith: 'ends with',
		notContains: 'does not contain',
		startsWith: 'starts with',
		dateAfter: '>',
		dateBefore: '<',
		dateIs: '=',
		// dateIsNot: '!=', // 2. Commented because API don't support it yet
		equals: '=',
		gt: '>',
		gte: '>=',
		in: 'in',
		lt: '<',
		lte: '<=',
		notEquals: '!=',
	},
	// Fixed colums filters and constrains - implementation when API is finished
	defaultFilters = {
		//global: { constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
		originated_at: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
		description: { constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
	},
	defaultMatchMode = FilterMatchMode.EQUALS,
	globalFilterFields = []

	return { dateFilterMatchModes, numericFilterMatchModes, textFilterMatchModes, filterMatchModeMapping, defaultFilters, defaultMatchMode, globalFilterFields }
}
