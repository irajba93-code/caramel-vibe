/**
 * Utility to generate and download an iCalendar (.ics) file
 * Compatible with Apple Calendar, Google Calendar, and Microsoft Outlook.
 */

interface CalendarEventParams {
  title: string
  description?: string | null
  location?: string | null
  startTime: string
  endTime: string
  bookingNumber?: string
}

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

export function generateIcsFile(params: CalendarEventParams): void {
  const startDate = new Date(params.startTime)
  const endDate = new Date(params.endTime)
  const now = new Date()

  const formattedStart = formatIcsDate(startDate)
  const formattedEnd = formatIcsDate(endDate)
  const formattedStamp = formatIcsDate(now)

  const uid = `${params.bookingNumber || `session-${Date.now()}`}@caramelvibe.com`
  const summary = `Caramel Vibe: ${params.title}`
  const description = (params.description || `Atelier session booking ref: ${params.bookingNumber || 'VIP'}`).replace(/\n/g, '\\n')
  const location = (params.location || 'Caramel Vibe Flagship Studio').replace(/\n/g, ', ')

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Caramel Vibe//Atelier Appointments//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formattedStamp}`,
    `DTSTART:${formattedStart}`,
    `DTEND:${formattedEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `caramel-vibe-${params.bookingNumber || 'appointment'}.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
