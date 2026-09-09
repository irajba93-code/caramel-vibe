'use client'

import React, { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { AdminSession } from '@/lib/admin/mockData'

interface AdminSessionsCalendarProps {
  sessions: AdminSession[]
  onSelectSession: (session: AdminSession) => void
  onEditSession: (session: AdminSession) => void
  onCreateSessionForDate: (date: Date) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function AdminSessionsCalendar({
  sessions,
  onSelectSession,
  onEditSession,
  onCreateSessionForDate,
}: AdminSessionsCalendarProps) {
  // Navigation month & year state
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // If sessions exist, default to the month of the first upcoming session, or today
    if (sessions.length > 0) {
      const firstValid = sessions.find((s) => !isNaN(new Date(s.start_time).getTime()))
      if (firstValid) return new Date(firstValid.start_time)
    }
    return new Date()
  })

  const [selectedDay, setSelectedDay] = useState<Date>(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthLabel = useMemo(() => {
    return currentDate.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    })
  }, [currentDate])

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDay(today)
  }

  // Generate 35 or 42 grid day cells for current month view
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const cells: Array<{
      date: Date
      dayNumber: number
      isCurrentMonth: boolean
      isToday: boolean
      sessions: AdminSession[]
    }> = []

    const today = new Date()
    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()

    // 1. Previous month padding cells
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i)
      const daySessions = sessions.filter((s) => {
        const sDate = new Date(s.start_time)
        return isSameDay(sDate, d)
      })
      cells.push({
        date: d,
        dayNumber: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: isSameDay(today, d),
        sessions: daySessions,
      })
    }

    // 2. Current month cells
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day)
      const daySessions = sessions.filter((s) => {
        const sDate = new Date(s.start_time)
        return isSameDay(sDate, d)
      })
      cells.push({
        date: d,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: isSameDay(today, d),
        sessions: daySessions,
      })
    }

    // 3. Next month padding cells to complete a 35 or 42 grid
    const totalCells = cells.length > 35 ? 42 : 35
    const remaining = totalCells - cells.length
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(year, month + 1, day)
      const daySessions = sessions.filter((s) => {
        const sDate = new Date(s.start_time)
        return isSameDay(sDate, d)
      })
      cells.push({
        date: d,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: isSameDay(today, d),
        sessions: daySessions,
      })
    }

    return cells
  }, [year, month, sessions])

  // Aggregate monthly stats
  const monthStats = useMemo(() => {
    const monthSessions = sessions.filter((s) => {
      const sDate = new Date(s.start_time)
      return sDate.getFullYear() === year && sDate.getMonth() === month
    })

    const totalScheduled = monthSessions.length
    const totalBooked = monthSessions.reduce((acc, s) => acc + (s.booked_slots || 0), 0)
    const totalCapacity = monthSessions.reduce((acc, s) => acc + (s.max_slots || 0), 0)
    const fillRate = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0

    return { totalScheduled, totalBooked, totalCapacity, fillRate }
  }, [sessions, year, month])

  // Format time range for pills
  const formatTimeRange = (startIso: string, endIso: string) => {
    try {
      const start = new Date(startIso)
      const end = new Date(endIso)
      const startTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      const endTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      return `${startTime}–${endTime}`
    } catch {
      return ''
    }
  }

  // Selected Day Agenda for mobile / quick inspect
  const selectedDaySessions = useMemo(() => {
    return sessions.filter((s) => {
      const sDate = new Date(s.start_time)
      return (
        sDate.getFullYear() === selectedDay.getFullYear() &&
        sDate.getMonth() === selectedDay.getMonth() &&
        sDate.getDate() === selectedDay.getDate()
      )
    })
  }, [sessions, selectedDay])

  return (
    <div className="space-y-4">
      {/* Calendar Navigation & Month Metrics Header */}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Navigation & Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-background border border-border rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={prevMonth}
              title="Previous Month"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="px-3 py-1 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={nextMonth}
              title="Next Month"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-display font-bold text-xl md:text-2xl text-foreground flex items-center gap-2">
            <span>{monthLabel}</span>
          </h3>
        </div>

        {/* Monthly Summary Badges */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-background border border-border text-foreground font-semibold flex items-center gap-1.5 shadow-2xs">
            <CalendarIcon className="w-3.5 h-3.5 text-primary" />
            <span>{monthStats.totalScheduled} Scheduled Sessions</span>
          </span>

          <span className="px-3 py-1.5 rounded-xl bg-background border border-border text-foreground font-semibold flex items-center gap-1.5 shadow-2xs">
            <Users className="w-3.5 h-3.5 text-accent" />
            <span>
              {monthStats.totalBooked} / {monthStats.totalCapacity} Slots ({monthStats.fillRate}% Fill)
            </span>
          </span>
        </div>
      </div>

      {/* Main Luxury Calendar Grid */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Weekday Column Headers */}
        <div className="grid grid-cols-7 border-b border-border bg-background/80 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {WEEKDAYS.map((day, idx) => (
            <div
              key={day}
              className={`py-3 px-1 md:px-2 ${
                idx === 0 || idx === 6 ? 'text-accent/80' : 'text-foreground/70'
              }`}
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day[0]}</span>
            </div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-border/60 auto-rows-fr">
          {calendarCells.map((cell, idx) => {
            const isSelected =
              cell.date.getFullYear() === selectedDay.getFullYear() &&
              cell.date.getMonth() === selectedDay.getMonth() &&
              cell.date.getDate() === selectedDay.getDate()

            return (
              <div
                key={idx}
                onClick={() => setSelectedDay(cell.date)}
                className={`min-h-[110px] md:min-h-[140px] p-2 flex flex-col justify-between transition-colors group relative ${
                  cell.isCurrentMonth
                    ? 'bg-card hover:bg-muted/20'
                    : 'bg-muted/15 text-muted-foreground/60'
                } ${isSelected ? 'ring-1 ring-primary/40 bg-primary/5' : ''}`}
              >
                {/* Cell Header: Day Number + Quick Add Session */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                        cell.isToday
                          ? 'bg-primary text-primary-foreground font-extrabold shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-foreground'
                          : 'text-muted-foreground/50'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {cell.isToday && (
                      <span className="hidden md:inline text-[9px] font-bold uppercase tracking-wider text-accent">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Quick Add Button on Hover */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onCreateSessionForDate(cell.date)
                    }}
                    title={`Schedule session on ${cell.date.toLocaleDateString()}`}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-all cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Session Event Cards / Pills on this date */}
                <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[110px] md:max-h-[130px] pr-0.5">
                  {cell.sessions.map((ses) => {
                    const percent = ses.max_slots > 0 ? Math.round((ses.booked_slots / ses.max_slots) * 100) : 0
                    const isFull = ses.status === 'full' || (ses.max_slots > 0 && ses.booked_slots >= ses.max_slots)
                    const isDraft = ses.status === 'draft'
                    const isCancelled = ses.status === 'cancelled'

                    return (
                      <div
                        key={ses.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectSession(ses)
                        }}
                        className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.02] shadow-2xs ${
                          isCancelled
                            ? 'bg-destructive/10 border-destructive/30 text-destructive'
                            : isFull
                            ? 'bg-[#c97a2b]/10 border-[#c97a2b]/35 text-foreground'
                            : isDraft
                            ? 'bg-muted/60 border-border text-muted-foreground'
                            : 'bg-[#3e6b48]/10 border-[#3e6b48]/30 text-foreground'
                        }`}
                      >
                        {/* Time & Status Badge */}
                        <div className="flex items-center justify-between gap-1 text-[10px] font-semibold">
                          <span className="flex items-center gap-1 font-mono text-[10px]">
                            <Clock className="w-2.5 h-2.5 shrink-0 text-primary" />
                            <span>{formatTimeRange(ses.start_time, ses.end_time)}</span>
                          </span>

                          <span
                            className={`text-[9px] uppercase font-bold px-1 rounded ${
                              ses.status === 'published'
                                ? 'bg-[#3e6b48]/20 text-[#3e6b48]'
                                : ses.status === 'full'
                                ? 'bg-[#c97a2b]/20 text-[#c97a2b]'
                                : ses.status === 'draft'
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-accent/20 text-accent'
                            }`}
                          >
                            {ses.status}
                          </span>
                        </div>

                        {/* Session Title */}
                        <div className="font-bold text-xs truncate text-foreground mt-0.5" title={ses.title}>
                          {ses.title}
                        </div>

                        {/* Capacity Fill Rate Pill */}
                        <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground mt-1">
                          <span className="truncate max-w-[80px] text-[9px] text-accent font-semibold">
                            {ses.category_name}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-foreground shrink-0">
                            {ses.booked_slots}/{ses.max_slots}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Day Agenda Drawer / Summary (especially useful on mobile or dense days) */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <h4 className="font-display font-bold text-sm md:text-base text-foreground">
              Agenda for {selectedDay.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
              {selectedDaySessions.length} sessions
            </span>
          </div>

          <button
            type="button"
            onClick={() => onCreateSessionForDate(selectedDay)}
            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Session</span>
          </button>
        </div>

        {selectedDaySessions.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No studio sessions scheduled for this date. Click &ldquo;Add Session&rdquo; above to schedule one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedDaySessions.map((ses) => (
              <div
                key={ses.id}
                onClick={() => onSelectSession(ses)}
                className="p-3.5 rounded-xl border border-border bg-background hover:border-primary/40 transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-2xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                      {ses.category_name}
                    </span>
                    <span className="text-[10px] font-bold capitalize text-muted-foreground">
                      {ses.status}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                    {ses.title}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary" />
                      <span>{formatTimeRange(ses.start_time, ses.end_time)}</span>
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-foreground">
                      {ses.booked_slots}/{ses.max_slots} Booked
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditSession(ses)
                    }}
                    title="Edit Session Drawer"
                    className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
