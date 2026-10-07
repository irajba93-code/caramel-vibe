/**
 * Caramel Vibe luxury branding tokens and Calendly embed configuration.
 * Note: Calendly embed query parameters require HEX values WITHOUT the '#' prefix.
 */

export const CALENDLY_BRAND_COLORS = {
  // Linen Cream - canvas and widget background
  backgroundColor: 'f8f3eb',
  // Espresso - typography, headers, date text
  textColor: '3b2720',
  // Caramel Terracotta - active buttons, selected date badges
  primaryColor: 'a85d35',
  // Honey Accent - framing accents and highlights
  accentColor: 'c99555',
} as const

export const CALENDLY_DEFAULTS = {
  eventUrl:
    process.env.NEXT_PUBLIC_CALENDLY_EVENT_URL ||
    'https://calendly.com/irajba93/new-meeting',

  masterclassUrl:
    process.env.NEXT_PUBLIC_CALENDLY_MASTERCLASS_URL ||
    'https://calendly.com/caramel-vibe/leather-care',
  backgroundColor:
    process.env.NEXT_PUBLIC_CALENDLY_BG_COLOR || CALENDLY_BRAND_COLORS.backgroundColor,
  textColor:
    process.env.NEXT_PUBLIC_CALENDLY_TEXT_COLOR || CALENDLY_BRAND_COLORS.textColor,
  primaryColor:
    process.env.NEXT_PUBLIC_CALENDLY_PRIMARY_COLOR || CALENDLY_BRAND_COLORS.primaryColor,
  hideGdprBanner:
    process.env.NEXT_PUBLIC_CALENDLY_HIDE_GDPR === '0' ? false : true,
} as const

