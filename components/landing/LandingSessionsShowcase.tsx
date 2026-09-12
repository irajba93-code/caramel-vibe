'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Session } from '@/lib/supabase/types'

export type LandingShowcaseSession = Session & {
  category_name?: string
}

interface LandingSessionsShowcaseProps {
  onSelectSession: (session: LandingShowcaseSession) => void
}

export function LandingSessionsShowcase({
  onSelectSession,
}: LandingSessionsShowcaseProps) {
  const supabase = useMemo(() => createClient(), [])
  const [sessions, setSessions] = useState<LandingShowcaseSession[]>([])
  const [loading, setLoading] = useState(true)

  // Load upcoming sessions
  const loadUpcomingSessions = useCallback(async () => {
    try {
      const nowIso = new Date().toISOString()
      
      // Query published or upcoming sessions
      const { data: sessionsData, error: sError } = await supabase
        .from('sessions')
        .select('*')
        .in('status', ['published', 'full'])
        .gt('start_time', nowIso)
        .order('start_time', { ascending: true })
        .limit(3)

      if (sError) throw sError

      // Fetch category mapping from session_types
      const { data: sessionTypes } = await supabase
        .from('session_types')
        .select('id, category')

      const typeMap = new Map((sessionTypes || []).map((t) => [t.id, t.category]))

      const formatted = (sessionsData || []).map((s) => ({
        ...s,
        category_name: typeMap.get(s.session_type_id) || 'Atelier Experience',
      })) as LandingShowcaseSession[]

      setSessions(formatted)
    } catch (err: unknown) {
      console.error('Error loading landing sessions:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadUpcomingSessions()
  }, [loadUpcomingSessions])

  // Realtime CDC listener
  useEffect(() => {
    const channel = supabase
      .channel('landing-sessions-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        () => loadUpcomingSessions()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => loadUpcomingSessions()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, loadUpcomingSessions])

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const formatTime = (startStr: string, endStr: string) => {
    try {
      const s = new Date(startStr)
      const e = new Date(endStr)
      const startFmt = s.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      const endFmt = e.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      return `${startFmt} - ${endFmt}`
    } catch {
      return ''
    }
  }

  return (
    <section id="atelier" className="py-24 bg-card/60 border-y border-border relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-cv relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-border/80">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="eyebrow">Studio Calendar &amp; Salons</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <Sparkles size={11} /> Live Atelier
              </span>
            </div>
            <h2 className="font-display mt-3 text-4xl sm:text-5xl tracking-tight leading-tight text-foreground">
              Private experiences. <em className="text-primary font-normal">Curated memories.</em>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Step inside the Caramel Vibe atelier for one-on-one handbag styling, archival authentication, and bespoke leather care masterclasses led by our curators.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/sessions"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold uppercase tracking-widest transition-all shadow-xs"
            >
              <span>Explore All Sessions &amp; Calendar</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Sessions Grid */}
        <div className="mt-12">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl border border-border bg-card p-6 h-80 animate-pulse flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-24 h-5 bg-muted rounded-md" />
                    <div className="w-full h-8 bg-muted rounded-md" />
                    <div className="w-3/4 h-4 bg-muted rounded-md" />
                  </div>
                  <div className="w-full h-10 bg-muted rounded-md" />
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-background border border-border border-dashed">
              <Calendar className="w-12 h-12 text-muted-foreground/60 mx-auto mb-3" />
              <h3 className="font-display text-2xl text-foreground">New Atelier Dates Announcing Soon</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Our private salons and styling dates for the upcoming season are currently being finalized.
              </p>
              <Link
                href="/sessions"
                className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
              >
                <span>View studio archives &amp; full schedule</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {sessions.map((session) => {
                const maxSlots = session.max_slots || 1
                const bookedSlots = session.booked_slots || 0
                const remainingSlots = Math.max(0, maxSlots - bookedSlots)
                const isFull = remainingSlots === 0 || session.status === 'full'
                const fillPercent = Math.min(100, Math.round((bookedSlots / maxSlots) * 100))

                return (
                  <div
                    key={session.id}
                    className="group relative rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Meta: Category & Price */}
                      <div className="flex items-center justify-between gap-2 pb-4 border-b border-border/70">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                          {session.category_name || 'Atelier Salon'}
                        </span>
                        <div className="text-right">
                          <span className="font-display text-lg font-bold text-foreground">
                            {session.currency || 'CAD'} ${session.price}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="mt-4">
                        <h3 className="font-display text-xl sm:text-2xl text-foreground leading-snug group-hover:text-primary transition-colors">
                          {session.title}
                        </h3>
                        {session.description && (
                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                            {session.description}
                          </p>
                        )}
                      </div>

                      {/* Schedule & Location */}
                      <div className="mt-5 space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-primary shrink-0" />
                          <span className="font-semibold text-foreground">
                            {formatDate(session.start_time)}
                          </span>
                          <span className="text-border">·</span>
                          <span>{formatTime(session.start_time, session.end_time)}</span>
                        </div>

                        <div className="flex items-center gap-2 truncate">
                          <MapPin size={14} className="text-accent shrink-0" />
                          <span className="truncate">{session.location_address}</span>
                        </div>
                      </div>
                    </div>

                    {/* Capacity Progress Bar & Action */}
                    <div className="mt-6 pt-5 border-t border-border/70 space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="font-semibold text-muted-foreground flex items-center gap-1">
                            <Users size={12} /> Studio Capacity
                          </span>
                          <span className={`font-bold ${isFull ? 'text-accent' : 'text-primary'}`}>
                            {isFull ? (
                              'Full · Waitlist Open'
                            ) : (
                              `${remainingSlots} of ${maxSlots} slots open`
                            )}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              isFull ? 'bg-accent' : 'bg-primary'
                            }`}
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() => onSelectSession(session)}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                          isFull
                            ? 'border border-accent/40 bg-accent/10 text-accent hover:bg-accent hover:text-card shadow-xs'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md active:scale-[0.99]'
                        }`}
                      >
                        {isFull ? (
                          <>
                            <Sparkles size={14} />
                            <span>Join Priority Waitlist</span>
                          </>
                        ) : (
                          <>
                            <span>Reserve Experience</span>
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 rounded-2xl bg-background border border-border p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0 border border-accent/30">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-display text-lg text-foreground">Have a private heirloom or bridal party?</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                We organize bespoke studio viewings, private appraisals, and VIP collection styling upon request.
              </p>
            </div>
          </div>
          <Link
            href="/sessions"
            className="shrink-0 text-xs font-bold uppercase tracking-widest text-primary hover:text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            <span>Inquire for Bespoke Salon</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
