'use client'

import React, { useState, useMemo } from 'react'
import {
  DollarSign,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react'
import { useAdminMock } from '@/context/AdminMockContext'
import { matchesDateRange } from '@/lib/admin/filterUtils'

export function AdminKpiCards() {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week')
  const { bookings, sessions, clients, appSettings, isLoadingData } = useAdminMock()

  const currency = (appSettings?.studio_currency as string) || 'CAD'

  // Dynamic KPI Metrics Calculation
  const metrics = useMemo(() => {
    // Preset map for filterUtils
    const presetKey = dateRange === 'week' ? '7days' : dateRange === 'month' ? 'month' : dateRange

    // 1. Filter Bookings in Selected Date Range
    const filteredBookings = bookings.filter((bk) => {
      if (dateRange === 'all') return true
      return matchesDateRange(bk.created_at, presetKey)
    })

    // Active (non-cancelled) bookings
    const activeBookings = filteredBookings.filter((b) => b.status !== 'cancelled')

    // Revenue calculations
    const totalRevenue = activeBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)
    const settledRevenue = activeBookings
      .filter((b) => b.payment_status === 'paid_on_premise')
      .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)
    const pendingRevenue = activeBookings
      .filter((b) => b.payment_status === 'pending_on_premise')
      .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)

    const paidPercentage = totalRevenue > 0 ? Math.round((settledRevenue / totalRevenue) * 100) : 100

    // 2. Filter Sessions in Selected Date Range
    const filteredSessions = sessions.filter((s) => {
      if (dateRange === 'all') return true
      return matchesDateRange(s.start_time, presetKey)
    })

    // Display sessions (fallback to active sessions if no sessions strictly inside range)
    const relevantSessions = filteredSessions.length > 0
      ? filteredSessions
      : sessions.filter((s) => s.status === 'published' || s.status === 'full')

    const totalMaxSlots = relevantSessions.reduce((sum, s) => sum + (Number(s.max_slots) || 0), 0)
    const totalBookedSlots = relevantSessions.reduce((sum, s) => sum + (Number(s.booked_slots) || 0), 0)
    const fillRate = totalMaxSlots > 0 ? Math.round((totalBookedSlots / totalMaxSlots) * 100) : 0

    // 3. Filter Reservations & Attendance
    const totalBookingsCount = filteredBookings.length
    const checkedInCount = filteredBookings.filter((b) => b.check_in_time !== null).length
    const checkInRate = totalBookingsCount > 0 ? Math.round((checkedInCount / totalBookingsCount) * 100) : 0
    const totalGuestsCount = filteredBookings.reduce((sum, b) => sum + (Number(b.slots_booked) || 1), 0)

    // 4. Clients in Selected Date Range
    const filteredClients = clients.filter((c) => {
      if (dateRange === 'all') return true
      return matchesDateRange(c.created_at, presetKey)
    })

    const totalClientsCount = clients.length
    const newClientsCount = filteredClients.length
    const activeClientsCount = clients.filter((c) => c.status === 'active').length

    // Construct 4 KPI Cards
    const revenueTitle =
      dateRange === 'today'
        ? "Today's Revenue"
        : dateRange === 'week'
        ? 'Weekly On-Premise Revenue'
        : dateRange === 'month'
        ? 'Monthly Atelier Volume'
        : 'Lifetime Gross Revenue'

    const sessionTitle =
      dateRange === 'today'
        ? 'Active Sessions Today'
        : dateRange === 'week'
        ? 'Studio Sessions'
        : dateRange === 'month'
        ? 'Monthly Sessions'
        : 'All Studio Sessions'

    const bookingTitle =
      dateRange === 'today'
        ? "Today's Appointments"
        : dateRange === 'week'
        ? 'Confirmed Reservations'
        : dateRange === 'month'
        ? 'Monthly Bookings'
        : 'Lifetime Bookings'

    const clientTitle =
      dateRange === 'today'
        ? 'New Members Today'
        : dateRange === 'week'
        ? 'Active Client Directory'
        : dateRange === 'month'
        ? 'Monthly Client Growth'
        : 'Total Client Roster'

    return [
      {
        title: revenueTitle,
        value: `$${totalRevenue.toLocaleString()} ${currency}`,
        change: `${paidPercentage}% settled`,
        trend: 'up' as const,
        description: pendingRevenue > 0 ? `$${pendingRevenue.toLocaleString()} pending settlement` : '100% settled in-person',
        icon: DollarSign,
        iconBg: 'bg-primary/10 text-primary',
        subDetails: `${activeBookings.length} active booking settlements`,
      },
      {
        title: sessionTitle,
        value: `${relevantSessions.length} ${relevantSessions.length === 1 ? 'Session' : 'Sessions'}`,
        change: `${fillRate}% capacity fill`,
        trend: 'up' as const,
        description: `${totalBookedSlots} / ${totalMaxSlots} guest slots booked`,
        icon: Calendar,
        iconBg: 'bg-accent/15 text-accent',
        subDetails: `${relevantSessions.filter((s) => s.status === 'full').length} sessions at max capacity`,
      },
      {
        title: bookingTitle,
        value: `${totalBookingsCount} ${totalBookingsCount === 1 ? 'Booking' : 'Bookings'}`,
        change: `${checkInRate}% check-in rate`,
        trend: 'up' as const,
        description: `${checkedInCount} checked in (${totalGuestsCount} guests)`,
        icon: Clock,
        iconBg: 'bg-[#3e6b48]/10 text-[#3e6b48]',
        subDetails: `${filteredBookings.filter((b) => b.payment_status === 'paid_on_premise').length} settled on-premise`,
      },
      {
        title: clientTitle,
        value: `${dateRange === 'all' ? totalClientsCount : newClientsCount} ${
          (dateRange === 'all' ? totalClientsCount : newClientsCount) === 1 ? 'Member' : 'Members'
        }`,
        change: `${activeClientsCount} active accounts`,
        trend: 'up' as const,
        description: `${clients.filter((c) => c.role === 'client').length} verified VIP collectors`,
        icon: Users,
        iconBg: 'bg-primary/10 text-primary',
        subDetails: `${clients.filter((c) => c.total_spent > 0).length} clients with booking history`,
      },
    ]
  }, [bookings, sessions, clients, appSettings, dateRange, currency])

  return (
    <div className="space-y-4">
      {/* Date Range Filter Bar & Live Sync Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="eyebrow">Studio Performance</div>
          <span className="text-xs text-muted-foreground">• Executive Snapshot</span>
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3e6b48]/10 text-[#3e6b48] border border-[#3e6b48]/20 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3e6b48] animate-pulse" />
            <span>Live Sync</span>
          </div>
        </div>

        {/* Date Filter Pills */}
        <div className="inline-flex items-center p-1 rounded-xl bg-card border border-border self-start sm:self-auto shadow-xs">
          <button
            type="button"
            onClick={() => setDateRange('today')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              dateRange === 'today'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setDateRange('week')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              dateRange === 'week'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setDateRange('month')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              dateRange === 'month'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => setDateRange('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              dateRange === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon
          return (
            <div
              key={idx}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/40 hover:-translate-y-0.5 transition-all space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span className="truncate pr-2">{metric.title}</span>
                <div className={`p-2 rounded-xl shrink-0 ${metric.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {isLoadingData ? (
                    <span className="opacity-50 text-xl">Loading...</span>
                  ) : (
                    metric.value
                  )}
                </div>
              </div>

              {/* Trend Indicator & Details */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 font-bold text-[#3e6b48]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{metric.change}</span>
                </div>
                <span className="text-muted-foreground truncate max-w-[130px]" title={metric.description}>
                  {metric.description}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

