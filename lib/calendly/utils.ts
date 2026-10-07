import { CALENDLY_DEFAULTS } from './config'
import type { CalendlyEmbedConfig } from './types'

/**
 * Builds a sanitized, luxury-branded Calendly embed URL with styling tokens,
 * authenticated user prefill data, and UTM attribution tracking.
 */
export function buildCalendlyUrl(config: Partial<CalendlyEmbedConfig> = {}): string {
  const base = config.baseUrl || CALENDLY_DEFAULTS.eventUrl
  if (!base) return ''

  try {
    const url = new URL(base)

    // 1. Luxury Color Tokens (Hex without '#')
    // background_color=f8f3eb (Linen Cream — matches page canvas)
    // text_color=3b2720 (Espresso)
    // primary_color=a85d35 (Caramel Terracotta — colors selected date circles, chevrons, and buttons)
    const bg = (config.backgroundColor || CALENDLY_DEFAULTS.backgroundColor || 'f8f3eb').replace(/^#/, '')
    const text = (config.textColor || CALENDLY_DEFAULTS.textColor || '3b2720').replace(/^#/, '')
    const primary = (config.primaryColor || CALENDLY_DEFAULTS.primaryColor || 'a85d35').replace(/^#/, '')

    url.searchParams.set('background_color', bg)
    url.searchParams.set('text_color', text)
    url.searchParams.set('primary_color', primary)
    url.searchParams.set(
      'embed_domain',
      typeof window !== 'undefined' ? window.location.hostname : 'caramelvibe.com'
    )
    url.searchParams.set('embed_type', 'Inline')

    // 2. Privacy & Layout Flags: hide_gdpr_banner=1
    const hideGdpr = config.hideGdprBanner ?? CALENDLY_DEFAULTS.hideGdprBanner
    if (hideGdpr !== false) {
      url.searchParams.set('hide_gdpr_banner', '1')
    }
    if (config.hideLandingPageDetails) {
      url.searchParams.set('hide_landing_page_details', '1')
    }


    // 3. Invitee Data Prefill
    const prefill = config.prefill
    if (prefill?.name && prefill.name.trim()) {
      url.searchParams.set('name', prefill.name.trim())
    }
    if (prefill?.email && prefill.email.trim()) {
      url.searchParams.set('email', prefill.email.trim().toLowerCase())
    }
    if (prefill?.guests && prefill.guests.length > 0) {
      url.searchParams.set('guests', prefill.guests.join(','))
    }

    // Custom questions mapping (e.g. a1, a2, etc.)
    if (prefill?.customAnswers) {
      Object.entries(prefill.customAnswers).forEach(([key, val]) => {
        if (val && typeof val === 'string' && val.trim()) {
          url.searchParams.set(key, val.trim())
        }
      })
    }

    // 4. UTM Attribution Propagation
    if (prefill?.utm) {
      if (prefill.utm.utmSource) url.searchParams.set('utm_source', prefill.utm.utmSource)
      if (prefill.utm.utmMedium) url.searchParams.set('utm_medium', prefill.utm.utmMedium)
      if (prefill.utm.utmCampaign) url.searchParams.set('utm_campaign', prefill.utm.utmCampaign)
      if (prefill.utm.utmContent) url.searchParams.set('utm_content', prefill.utm.utmContent)
      if (prefill.utm.utmTerm) url.searchParams.set('utm_term', prefill.utm.utmTerm)
    }

    return url.toString()
  } catch (err) {
    console.error('Invalid Calendly URL provided:', base, err)
    return base
  }
}
