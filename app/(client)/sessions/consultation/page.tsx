'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CalendlyInlineWidget } from '@/components/booking/CalendlyInlineWidget'
import { CALENDLY_DEFAULTS } from '@/lib/calendly/config'
import type { CalendlyPrefillOptions } from '@/lib/calendly/types'
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Clock,
  MapPin,
  CalendarCheck,
  MessageCircle,
  Award,
  Crown,
  CheckCircle2,
} from 'lucide-react'

function ConsultationBookingContent() {
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const [prefill, setPrefill] = useState<CalendlyPrefillOptions>({})
  const [isAuthLoaded, setIsAuthLoaded] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)

  // Load user profile for prefill
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const utm = {
          utmSource: searchParams.get('utm_source') || undefined,
          utmMedium: searchParams.get('utm_medium') || undefined,
          utmCampaign: searchParams.get('utm_campaign') || undefined,
          utmContent: searchParams.get('utm_content') || undefined,
          utmTerm: searchParams.get('utm_term') || undefined,
        }

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', user.id)
            .single()

          const fullName = profile?.full_name || user.user_metadata?.full_name || ''
          const email = profile?.email || user.email || ''

          if (fullName) setUserName(fullName)

          setPrefill({
            name: fullName || undefined,
            email: email || undefined,
            utm,
          })
        } else {
          setPrefill({ utm })
        }
      } catch (err) {
        console.error('Error fetching user for Calendly prefill:', err)
      } finally {
        setIsAuthLoaded(true)
      }
    }

    loadUserProfile()
  }, [supabase, searchParams])

  return (
    <div className="container-cv space-y-8 max-w-5xl pb-20">
      {/* Back Link */}
      <div>
        <Link
          href="/sessions"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Atelier Sessions</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Private Atelier Appointment</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Book 1-on-1 Atelier Consultation
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Schedule a private session with our master curators in Kabul or via secure video salon.
            Receive bespoke styling advice, verify archival leather provenance, or discuss custom restorations.
          </p>

          {userName && (
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full border border-border">
                <Crown className="w-3.5 h-3.5 text-accent" />
                <span>Booking as <strong className="text-foreground">{userName}</strong> (credentials prefilled)</span>
              </span>
            </div>
          )}
        </div>

        {/* Feature Highlights Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-8 mt-8 border-t border-border/80 text-xs">
          <div className="p-3.5 rounded-2xl bg-background/60 border border-border/60 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-foreground">Archival Authentication</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Physical hardware and leather stamp inspection
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-background/60 border border-border/60 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-accent/15 text-accent shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-foreground">Bespoke Styling</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Curated silhouette matching for your heirloom collection
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-background/60 border border-border/60 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-foreground">45-Minute Dedicated Salon</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Direct one-on-one time with master curators
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendly Embed Widget */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="font-display text-xl font-bold text-foreground">
            Select Your Date &amp; Preferred Time Slot
          </h2>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Local timezone automatically detected
          </span>
        </div>

        <CalendlyInlineWidget
          url={CALENDLY_DEFAULTS.eventUrl}
          prefill={prefill}
          minHeight={740}
        />
      </div>

      {/* Concierge Assistance Footer Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5" />
            <span>Need Custom Arrangements?</span>
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">
            Connect with our Private Client Desk
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
            For urgent authentication requests or international private salon bookings, our WhatsApp concierge is available 7 days a week.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
          <a
            href="https://wa.me/93700000000?text=Hello%20Caramel%20Vibe%20Concierge,%20I%20would%20like%20to%20inquire%20about%20a%20private%201-on-1%20consultation."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <MessageCircle className="w-4 h-4 text-accent" />
            <span>WhatsApp Concierge</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default function ConsultationBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="container-cv py-20 text-center text-xs uppercase tracking-widest text-muted-foreground">
          Loading Atelier Consultation Salon...
        </div>
      }
    >
      <ConsultationBookingContent />
    </Suspense>
  )
}
