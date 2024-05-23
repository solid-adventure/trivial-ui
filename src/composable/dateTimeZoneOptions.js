export const useDateTimeZoneOptions = () => {
	const dateOptions = {
		dateStyle: 'short',
		timeZone: 'America/New_York'
	},
	timeOptions = {
		timeStyle: 'short',
		timeZone: 'America/New_York',
		hourCycle: "h12"
	},
	timeZoneOptions = {
		timeZone: 'America/New_York',
		timeZoneName: 'short'
	}

	return { dateOptions, timeOptions, timeZoneOptions }
}