import moment from 'moment-timezone'

const titleize = (str) => {
  if (str === 'ytd') return 'YTD'
  return str
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const namedDateRanges = () => {
  const values = [
    'today',
    'yesterday',
    'last_week',
    'last_month',
    'last_year',
    'ytd',
    'last_365_days',
  ]

  return values.map(value => ({
    value,
    label: titleize(value)
  }))
}

export const getDateRangeFromNamed = name => {
  let s = null
  let e = null
  switch (name) {
    case 'today':
      return [new Date(), new Date()]
    case 'yesterday':
      s = new Date()
      s.setDate(s.getDate() - 1)
      return [s, s]
    case 'last_week':
      s = new Date()
      s.setDate(s.getDate() - (s.getDay() + 6) % 7)
      s.setDate(s.getDate() - 8)
      e = new Date(s)
      e.setDate(s.getDate() + 6)
      return [s, e]
    case 'last_month':
      s = new Date()
      s = new Date(s.getFullYear(), s.getMonth() - 1, 1)
      e = new Date()
      e = new Date(e.getFullYear(), e.getMonth(), 0)
      return [s,e]
    case 'last_year':
      s = new Date()
      s = new Date(s.getFullYear() - 1, 0, 1)
      e = new Date(new Date().getFullYear() - 1, 11, 31)
      return [s,e]
    case 'ytd':
      s = new Date()
      s = new Date(s.getFullYear(), 0)
      e = new Date()
      return [s,e]
    case 'last_365_days':
      s = new Date()
      s.setDate(s.getDate() - 364)
      e = new Date()
      return [s,e]
    default:
      return [s, e]
  }
}

export const formatDateRange = (date, timezone, isEndDate = false) => {
  if (!date || !timezone) return null
  return moment.utc(date)
    .tz(timezone)
    [isEndDate ? 'endOf' : 'startOf']('day')
    .utc()
    .toISOString()
}

export const formatDisplayDate = (date, timezone) => {
  if (!date || !timezone) return null
  return moment(date).tz(timezone).format('MM/DD/YYYY h:mm A')
}

export const useDateRange = () => {
  const getDateRange = (namedRange, timezone) => {
    if (!namedRange || !timezone) return { startAt: null, endAt: null }
    
    const [start, end] = getDateRangeFromNamed(namedRange)
    return {
      startAt: formatDateRange(start, timezone),
      endAt: formatDateRange(end, timezone, true)
    }
  }

  return {
    getDateRange,
    formatDisplayDate,
    namedDateRanges
  }
}