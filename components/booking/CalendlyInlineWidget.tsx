'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { buildCalendlyUrl } from '@/lib/calendly/utils'
import type { CalendlyPrefillOptions } from '@/lib/calendly/types'
import { CALENDLY_DEFAULTS } from '@/lib/calendly/config'
import { CalendlySkeleton } from './CalendlySkeleton'
import { CalendlyErrorBoundary } from './CalendlyErrorBoundary'
import { useCalendlyEvents } from '@/lib/calendly/useCalendlyEvents'
import { useToast } from '@/components/ui/ToastContext'

export interface CalendlyInlineWidgetProps {
  url?: string
  prefill?: CalendlyPrefillOptions
  minHeight?: number | string
  className?: string
  hideGdprBanner?: boolean
  hideLandingPageDetails?: boolean
  backgroundColor?: string
  textColor?: string
  primaryColor?: string
  onScheduled?: () => void
  onDateAndTimeSelected?: () => void
}

export function CalendlyInlineWidget({
  url = CALENDLY_DEFAULTS.eventUrl,
  prefill,
  minHeight = 720,
  className = '',
  hideGdprBanner = true,
  hideLandingPageDetails = false,
  backgroundColor,
  textColor,
  primaryColor,
  onScheduled,
  onDateAndTimeSelected,
}: CalendlyInlineWidgetProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const { showToast } = useToast()

  const embedUrl = useMemo(() => {
    return buildCalendlyUrl({
      baseUrl: url,
      prefill,
      hideGdprBanner,
      hideLandingPageDetails,
      backgroundColor,
      textColor,
      primaryColor,
    })
  }, [url, prefill, hideGdprBanner, hideLandingPageDetails, backgroundColor, textColor, primaryColor])


  // Subscribe to window postMessages from Calendly iframe
  useCalendlyEvents({
    onEventScheduled: () => {
      showToast('Consultation booked! Check your notifications.', 'success')
      onScheduled?.()
    },

    onDateAndTimeSelected: () => {
      onDateAndTimeSelected?.()
    },
  })

  // Timeout guard for adblockers that silently block the iframe without emitting onError
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        // If still loading after 10s, we keep the iframe visible so user can see it if it just had a slow network
      }
    }, 10000)
    return () => clearTimeout(timer)
  }, [isLoading])

  if (hasError) {
    return (
      <CalendlyErrorBoundary
        fallbackUrl={embedUrl || url}
        onRetry={() => {
          setHasError(false)
          setIsLoading(true)
        }}
      />
    )
  }

  const heightStyle = typeof minHeight === 'number' ? `${minHeight}px` : minHeight

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-border bg-background shadow-xs transition-all ${className}`}
      style={{ minHeight: heightStyle }}
    >

      {/* Skeleton Shimmer Loading State */}
      {isLoading && (
        <div className="absolute inset-0 z-10 w-full h-full">
          <CalendlySkeleton />
        </div>
      )}

      {/* Calendly Sandboxed Embed Iframe */}
      <iframe
        src={embedUrl}
        width="100%"
        height={heightStyle}
        title="Caramel Vibe Atelier Booking Calendar"
        className="w-full border-0 transition-opacity duration-500 rounded-3xl"
        style={{
          minHeight: heightStyle,
          opacity: isLoading ? 0 : 1,
        }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
        allow="camera; microphone; autoplay; encrypted-media; fullscreen;"
      />
    </div>
  )
}
