'use client'

import React, { useMemo } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Users,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import type { ClientCalendarSession } from './ClientSessionsCalendar'

interface ClientSessionsGridProps {
  sessions: ClientCalendarSession[]
  viewMode: 'grid' | 'list'
  onSelectSession: (session: ClientCalendarSession) => void
}

export function ClientSessionsGrid({
  sessions,
  viewMode,
  onSelectSession,
}: ClientSessionsGridProps) {
  // Group sessions by date for chronological list view
  const groupedByDate = useMemo(() => {
    const groups = new Map<string, ClientCalendarSession[]>()
    sessions.forEach((s) => {
      try {
        const d = new Date(s.start_time)
        const dateKey = d.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        const list = groups.get(dateKey) || []
        list.push(s)
        groups.set(dateKey, list)
      } catch {
        // ignore
      }
    })
    return Array.from(groups.entries())
  }, [sessions])

  if (sessions.length === 0) {
    return (
      <div className="p-12 rounded-3xl border border-dashed border-border bg-card text-center space-y-3">
        <Calendar className="w-10 h-10 text-muted-foreground/60 mx-auto" />
        <h4 className="font-display font-bold text-lg text-foreground">
          No Sessions Found
        </h4>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          No upcoming atelier experiences match the selected category filter. Please adjust your criteria to view other dates.
        </p>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        {groupedByDate.map(([dateTitle, sessionList]) => (
          <div
            key={dateTitle}
            className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
          >
            {/* Date Group Header */}
            <div className="flex items-center gap-2 border-b border-border/80 pb-3">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="font-display font-bold text-lg text-foreground">
                {dateTitle}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                {sessionList.length} {sessionList.length === 1 ? 'Experience' : 'Experiences'}
              </span>
            </div>

            {/* List Rows */}
            <div className="divide-y divide-border/60">
              {sessionList.map((ses) => {
                const startDate = new Date(ses.start_time)
                const endDate = new Date(ses.end_time)
                const remaining = Math.max(0, (ses.max_slots || 0) - (ses.booked_slots || 0))
                const isFull = remaining === 0

                return (
                  <div
                    key={ses.id}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/20">
                          {ses.category_name || 'Atelier Experience'}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          ${ses.price} {ses.currency}
                        </span>
                      </div>

                      <h4 className="font-display font-bold text-base text-foreground">
                        {ses.title}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1 text-primary font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                            {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </span>

                        <span>•</span>

                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="truncate max-w-[200px]">{ses.location_address || 'Studio'}</span>
                        </span>

                        <span>•</span>

                        <span className="font-medium text-foreground">
                          {remaining} of {ses.max_slots} {remaining === 1 ? 'slot left' : 'slots left'}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => onSelectSession(ses)}
                        disabled={isFull}
                        className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isFull ? 'Fully Booked' : 'Reserve Slot'}</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Grid Mode
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {sessions.map((ses) => {
        const startDate = new Date(ses.start_time)
        const endDate = new Date(ses.end_time)
        const remaining = Math.max(0, (ses.max_slots || 0) - (ses.booked_slots || 0))
        const percent =
          ses.max_slots > 0 ? Math.round(((ses.booked_slots || 0) / ses.max_slots) * 100) : 0
        const isFull = remaining === 0

        return (
          <div
            key={ses.id}
            className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between space-y-5 group hover:-translate-y-0.5"
          >
            <div className="space-y-3">
              {/* Category & Price */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
                  {ses.category_name || 'Atelier Consultation'}
                </span>
                <span className="font-display font-bold text-base text-foreground">
                  ${ses.price} <span className="text-xs font-sans text-muted-foreground">{ses.currency}</span>
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {ses.title}
              </h3>

              {ses.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {ses.description}
                </p>
              )}

              {/* Time & Location */}
              <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {startDate.toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  <span>
                    {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                    {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span className="truncate">{ses.location_address || 'Caramel Vibe Flagship Studio'}</span>
                </div>
              </div>

              {/* Live Capacity Bar */}
              <div className="space-y-1 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground font-medium">Capacity Fill</span>
                  <span className="font-bold text-foreground">
                    {remaining} of {ses.max_slots} {remaining === 1 ? 'slot available' : 'slots available'}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      percent >= 80 ? 'bg-accent' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action */}
            <button
              type="button"
              onClick={() => onSelectSession(ses)}
              disabled={isFull}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isFull ? 'Fully Booked' : 'Reserve Experience'}</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
