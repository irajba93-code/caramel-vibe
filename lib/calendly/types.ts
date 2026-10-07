/**
 * TypeScript interfaces for Calendly embed options, data prefill, and postMessage event payloads.
 */

export interface CalendlyUtmParams {
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  utmContent?: string | null
  utmTerm?: string | null
}

export interface CalendlyPrefillOptions {
  name?: string | null
  email?: string | null
  guests?: string[]
  customAnswers?: Record<string, string | undefined>
  utm?: CalendlyUtmParams
}

export interface CalendlyEmbedConfig {
  baseUrl: string
  backgroundColor?: string
  textColor?: string
  primaryColor?: string
  hideGdprBanner?: boolean
  hideLandingPageDetails?: boolean
  prefill?: CalendlyPrefillOptions
}

export interface CalendlyEventMessageData {
  event?: {
    uri?: string
  }
  invitee?: {
    uri?: string
  }
  [key: string]: unknown
}

export interface CalendlyPostMessageEvent {
  event: 'calendly.event_type_viewed' | 'calendly.date_and_time_selected' | 'calendly.event_scheduled'
  payload?: CalendlyEventMessageData
}
