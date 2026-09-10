'use client'

import React, { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Sparkles,
  Users,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import type { Session } from '@/lib/supabase/types'

export type ClientCalendarSession = Session & {
  category_name?: string
}

interface ClientSessionsCalendarProps {
  sessions: ClientCalendarSession[]
  onSelectSession: (session: ClientCalendarSession) => void
}

export function ClientSessionsCalendar({
  sessions,
  onSelectSession,
}: ClientSessionsCalendarProps) {
  // Current visible month/year
  const [currentDate, setCurrentDate] = useState(() => new Date())
  // Selected date on calendar (defaults to today)
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  // Calendar grid computation
  const { calendarDays, monthLabel } = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()
    const startDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday

    const label = firstDayOfMonth.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    })

    const days: {
      date: Date
      isCurrentMonth: boolean
      isToday: boolean
      isSelected: boolean
      dateString: string
    }[] = []

    const todayStr = new Date().toDateString()
    const selectedStr = selectedDate.toDateString()

    // 1. Preceding month buffer days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: d.toDateString() === todayStr,
        isSelected: d.toDateString() === selectedStr,
        dateString: d.toISOString().split('T')[0],
      })
    }

    // 2. Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i)
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: d.toDateString() === todayStr,
        isSelected: d.toDateString() === selectedStr,
        dateString: d.toISOString().split('T')[0],
      })
    }

    // 3. Following month buffer days to complete 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i)
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: d.toDateString() === todayStr,
        isSelected: d.toDateString() === selectedStr,
        dateString: d.toISOString().split('T')[0],
      })
    }

    return { calendarDays: days, monthLabel: label }
  }, [year, month, selectedDate])

  // Map sessions to ISO date string (YYYY-MM-DD)
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, ClientCalendarSession[]>()
    sessions.forEach((s) => {
      if (s.status === 'cancelled' || s.status === 'draft') return
      try {
        const dStr = new Date(s.start_time).toISOString().split('T')[0]
        const existing = map.get(dStr) || []
        existing.push(s)
        map.set(dStr, existing)
      } catch {
        // ignore invalid dates
      }
    })
    return map
  }, [sessions])

  // Sessions for currently selected date
  const selectedDateStr = selectedDate.toISOString().split('T')[0]
  const selectedDateSessions = sessionsByDate.get(selectedDateStr) || []

  // Count total sessions in visible month
  const visibleMonthSessionCount = useMemo(() => {
    let count = 0
    sessionsByDate.forEach((sesList, dStr) => {
      const d = new Date(dStr)
      if (d.getFullYear() === year && d.getMonth() === month) {
        count += sesList.length
      }
    })
    return count
  }, [sessionsByDate, year, month])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Month Calendar Grid */}
        <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
          {/* Calendar Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                <span>{visibleMonthSessionCount} Sessions Visible</span>
              </div>
              <h3 className="font-display font-bold text-2xl text-foreground">
                {monthLabel}
              </h3>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleToday}
                className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer shadow-xs"
              >
                Today
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer shadow-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Weekday Names Bar */}
          <div className="grid grid-cols-7 text-center border-b border-border/80 pb-2.5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span
                key={d}
                className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              const daySessions = sessionsByDate.get(cell.dateString) || []
              const hasSessions = daySessions.length > 0
              const isFull = hasSessions && daySessions.every((s) => s.status === 'full' || (s.booked_slots >= s.max_slots))

              return (
                <button
                  key={`${cell.dateString}-${idx}`}
                  type="button"
                  onClick={() => setSelectedDate(cell.date)}
                  className={`min-h-[70px] sm:min-h-[85px] p-2 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer group ${
                    cell.isSelected
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm'
                      : cell.isToday
                      ? 'border-accent bg-accent/10'
                      : cell.isCurrentMonth
                      ? 'border-border/80 bg-background hover:border-primary/50 hover:bg-card'
                      : 'border-border/30 bg-muted/20 opacity-40 hover:opacity-70'
                  }`}
                >
                  {/* Day Number & Today Tag */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold ${
                        cell.isSelected
                          ? 'text-primary'
                          : cell.isToday
                          ? 'text-accent'
                          : cell.isCurrentMonth
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>

                    {cell.isToday && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-accent/20 text-accent hidden sm:inline">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Sessions Indicators */}
                  {hasSessions && (
                    <div className="w-full space-y-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        {daySessions.slice(0, 2).map((ses) => (
                          <span
                            key={ses.id}
                            className={`w-1.5 h-1.5 rounded-full ${
                              ses.status === 'full' ? 'bg-[#c2782b]' : 'bg-primary'
                            }`}
                          />
                        ))}
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md truncate block ${
                          isFull
                            ? 'bg-[#c2782b]/15 text-[#c2782b]'
                            : 'bg-primary/15 text-primary'
                        }`}
                      >
                        {daySessions.length} {daySessions.length === 1 ? 'Slot' : 'Slots'}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Calendar Legend */}
          <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#c2782b]" />
                <span>Full / Waitlist</span>
              </div>
            </div>
            <span>Click any day to inspect available times</span>
          </div>
        </div>

        {/* Right Column (5 Cols): Selected Day Agenda & Booking Inspector */}
        <div className="lg:col-span-5 bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Inspector Header */}
            <div className="border-b border-border pb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <CalendarIcon className="w-3 h-3" />
                <span>Day Agenda</span>
              </div>
              <h3 className="font-display font-bold text-xl text-foreground">
                {selectedDate.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedDateSessions.length}{' '}
                {selectedDateSessions.length === 1 ? 'session scheduled' : 'sessions scheduled'}
              </p>
            </div>

            {/* List of Sessions on Selected Date */}
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {selectedDateSessions.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-background/50 space-y-2">
                  <CalendarIcon className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                  <h4 className="font-bold text-sm text-foreground">No Sessions on this Date</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Select a date with session indicators on the calendar to inspect timings and reserve guest slots.
                  </p>
                </div>
              ) : (
                selectedDateSessions.map((ses) => {
                  const startDate = new Date(ses.start_time)
                  const endDate = new Date(ses.end_time)
                  const remaining = Math.max(0, (ses.max_slots || 0) - (ses.booked_slots || 0))
                  const percent =
                    ses.max_slots > 0
                      ? Math.round(((ses.booked_slots || 0) / ses.max_slots) * 100)
                      : 0

                  return (
                    <div
                      key={ses.id}
                      className="p-4 rounded-2xl border border-border bg-background hover:border-primary/50 transition-all space-y-3.5 shadow-xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/20">
                            {ses.category_name || 'Atelier Consultation'}
                          </span>
                          <span className="font-bold text-xs text-foreground">
                            ${ses.price} {ses.currency}
                          </span>
                        </div>

                        <h4 className="font-display font-bold text-base text-foreground">
                          {ses.title}
                        </h4>

                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5 text-primary font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {startDate.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              –{' '}
                              {endDate.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="truncate">{ses.location_address || 'Studio'}</span>
                          </div>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div className="space-y-1 pt-2 border-t border-border/60">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground font-medium">Capacity</span>
                            <span className="font-bold text-foreground">
                              {remaining} of {ses.max_slots} {remaining === 1 ? 'slot left' : 'slots left'}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                percent >= 80 ? 'bg-accent' : 'bg-primary'
                              }`}
                              style={{ width: `${Math.min(100, percent)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Reserve Trigger */}
                      <button
                        type="button"
                        onClick={() => onSelectSession(ses)}
                        disabled={remaining === 0}
                        className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{remaining === 0 ? 'Fully Booked' : 'Reserve Experience'}</span>
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* On-Premise Settlement Reminder Box */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#3e6b48] shrink-0" />
            <span>
              All reservations held immediately with zero online charges. In-person boutique settlement on check-in.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
