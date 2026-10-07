'use client'

import { useEffect, useRef } from 'react'
import type { CalendlyEventMessageData } from './types'
import { syncCalendlyScheduledEvent } from './syncBooking'

export interface CalendlyEventHandlers {
  onEventScheduled?: (data: CalendlyEventMessageData) => void
  onDateAndTimeSelected?: (data: CalendlyEventMessageData) => void
  onEventTypeViewed?: (data: CalendlyEventMessageData) => void
}

/**
 * Validates if an incoming MessageEvent is a valid Calendly scheduled completion event.
 */
export function isCalendlyEvent(e: MessageEvent): boolean {
  const isCalendlyOrigin =
    typeof e.origin === 'string' &&
    (e.origin === 'https://calendly.com' || e.origin.includes('calendly.com'))

  return (
    isCalendlyOrigin &&
    Boolean(e.data && typeof e.data === 'object' && e.data.event === 'calendly.event_scheduled')
  )
}

/**
 * Custom React hook that subscribes to Calendly iframe postMessage events.
 * Listens for date selection, event scheduled, and event type views.
 * On completion (`calendly.event_scheduled`), automatically synchronizes in-app notification
 * records into the Supabase database.
 */
export function useCalendlyEvents(handlers: CalendlyEventHandlers = {}) {
  const savedHandlers = useRef(handlers)
  savedHandlers.current = handlers

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (typeof event.origin !== 'string' || !event.origin.includes('calendly.com')) {
        return
      }

      const data = event.data as { event?: string; payload?: CalendlyEventMessageData } | undefined
      if (!data || typeof data !== 'object' || !data.event) {
        return
      }

      switch (data.event) {
        case 'calendly.event_scheduled':
          // Synchronize database records & in-app notifications
          syncCalendlyScheduledEvent(data.payload || {})
          savedHandlers.current.onEventScheduled?.(data.payload || {})
          break
        case 'calendly.date_and_time_selected':
          savedHandlers.current.onDateAndTimeSelected?.(data.payload || {})
          break
        case 'calendly.event_type_viewed':
          savedHandlers.current.onEventTypeViewed?.(data.payload || {})
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])
}
