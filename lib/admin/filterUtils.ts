/**
 * Date filtering and table sorting utility functions for Admin Console tables.
 */

export type DateFilterPresetKey = 'all' | 'today' | '7days' | 'next7days' | 'month' | '30days' | 'custom'

/**
 * Checks if a given date string or timestamp falls within the selected preset or custom date range.
 */
export function matchesDateRange(
  dateValue: string | Date | null | undefined,
  preset: string,
  customStart?: string,
  customEnd?: string
): boolean {
  if (preset === 'all' && !customStart && !customEnd) return true
  if (!dateValue) return false

  const date = new Date(dateValue)
  if (isNaN(date.getTime())) return true

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  if (preset === 'today') {
    return date >= startOfToday && date <= endOfToday
  }

  if (preset === '7days') {
    const sevenDaysAgo = new Date(startOfToday)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return date >= sevenDaysAgo && date <= endOfToday
  }

  if (preset === 'next7days') {
    const sevenDaysAhead = new Date(endOfToday)
    sevenDaysAhead.setDate(sevenDaysAhead.getDate() + 7)
    return date >= startOfToday && date <= sevenDaysAhead
  }

  if (preset === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    return date >= startOfMonth && date <= endOfMonth
  }

  if (preset === '30days') {
    const thirtyDaysAgo = new Date(startOfToday)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return date >= thirtyDaysAgo && date <= endOfToday
  }

  if (preset === 'custom' || customStart || customEnd) {
    if (customStart) {
      const start = new Date(customStart + 'T00:00:00')
      if (!isNaN(start.getTime()) && date < start) return false
    }
    if (customEnd) {
      const end = new Date(customEnd + 'T23:59:59.999')
      if (!isNaN(end.getTime()) && date > end) return false
    }
    return true
  }

  return true
}

/**
 * Generic sorting function for arrays of objects by field name.
 */
export function sortItems<T>(
  items: T[],
  sortField: string,
  sortDirection: 'asc' | 'desc',
  customGetters?: Record<string, (item: T) => string | number | boolean | Date | null | undefined>
): T[] {
  if (!sortField) return items

  return [...items].sort((a, b) => {
    let valA: any = customGetters && customGetters[sortField] ? customGetters[sortField](a) : (a as any)[sortField]
    let valB: any = customGetters && customGetters[sortField] ? customGetters[sortField](b) : (b as any)[sortField]

    // Handle null/undefined (keep at bottom)
    if (valA === undefined || valA === null) return 1
    if (valB === undefined || valB === null) return -1

    // Handle Dates
    if (valA instanceof Date || (typeof valA === 'string' && !isNaN(Date.parse(valA)) && (sortField.includes('date') || sortField.includes('time') || sortField.includes('created_at')))) {
      const timeA = new Date(valA).getTime()
      const timeB = new Date(valB).getTime()
      if (!isNaN(timeA) && !isNaN(timeB)) {
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA
      }
    }

    // Handle numbers
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDirection === 'asc' ? valA - valB : valB - valA
    }

    // Handle booleans
    if (typeof valA === 'boolean' && typeof valB === 'boolean') {
      return sortDirection === 'asc' ? (valA === valB ? 0 : valA ? 1 : -1) : valA === valB ? 0 : valA ? -1 : 1
    }

    // Handle strings
    const strA = String(valA).toLowerCase()
    const strB = String(valB).toLowerCase()
    const comp = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' })
    return sortDirection === 'asc' ? comp : -comp
  })
}
