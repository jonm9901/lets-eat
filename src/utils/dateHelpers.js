export function getMondayOfWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

export function dateToYMD(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isDateInPast(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d < today
}

export function formatWeekRange(monday) {
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  const startStr = monday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  const endStr = sunday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  return `${startStr} – ${endStr}`
}

export function formatDisplayDate(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
