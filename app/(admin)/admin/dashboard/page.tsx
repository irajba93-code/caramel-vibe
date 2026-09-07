'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  ShieldCheck,
  ChevronRight,
  Search,
  Check,
  Layers,
  MapPin,
  RefreshCw,
  Sliders,
  Settings,
  AlertCircle,
  Bell,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminKpiCards } from '@/components/admin/AdminKpiCards'
import { AdminRecentActivities } from '@/components/admin/AdminRecentActivities'
import { useAdminMock } from '@/context/AdminMockContext'
import { matchesDateRange } from '@/lib/admin/filterUtils'

export default function AdminDashboardPage() {
  const router = useRouter()
  const {
    sessions,
    categories,
    sessionTypes,
    clients,
    bookings,
    appSettings,
    checkInBooking,
    notifications,
    markNotificationRead,
    refreshData,
    isLoadingData,
  } = useAdminMock()

  const [bookingSearch, setBookingSearch] = useState('')
  const [sessionFilter, setSessionFilter] = useState<'all' | 'upcoming' | 'full'>('upcoming')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const currency = (appSettings?.studio_currency as string) || 'CAD'
  const studioName = (appSettings?.studio_name as string) || 'Caramel Vibe Flagship Studio'
  const studioAddress = (appSettings?.studio_address as string) || 'Caramel Vibe Flagship Studio, Suite 402'

  // Handle manual data refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshData()
    setTimeout(() => setIsRefreshing(false), 600)
  }

  // Filter Upcoming Sessions
  const filteredSessions = useMemo(() => {
    const now = new Date()
    return sessions.filter((s) => {
      if (sessionFilter === 'full') return s.status === 'full'
      if (sessionFilter === 'upcoming') {
        const isUpcoming = new Date(s.start_time) >= now || s.status === 'published' || s.status === 'full'
        return isUpcoming && s.status !== 'cancelled' && s.status !== 'draft'
      }
      return s.status !== 'cancelled'
    })
  }, [sessions, sessionFilter])

  // Filter Recent Bookings by Search
  const filteredBookings = useMemo(() => {
    let list = bookings
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase().trim()
      list = list.filter(
        (b) =>
          b.booking_number.toLowerCase().includes(q) ||
          b.client_name.toLowerCase().includes(q) ||
          b.client_email.toLowerCase().includes(q) ||
          b.session_title.toLowerCase().includes(q)
      )
    }
    return list.slice(0, 5)
  }, [bookings, bookingSearch])

  // Compute Today's Agenda Statistics
  const todayStats = useMemo(() => {
    const todayBookings = bookings.filter((b) => matchesDateRange(b.created_at, 'today') && b.status !== 'cancelled')
    const todaySessions = sessions.filter((s) => matchesDateRange(s.start_time, 'today') && s.status !== 'cancelled')
    const todayExpectedGuests = todayBookings.reduce((sum, b) => sum + (Number(b.slots_booked) || 1), 0)
    const todaySettledRevenue = todayBookings
      .filter((b) => b.payment_status === 'paid_on_premise')
      .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)
    const todayPendingRevenue = todayBookings
      .filter((b) => b.payment_status === 'pending_on_premise')
      .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)

    return {
      sessionsCount: todaySessions.length,
      bookingsCount: todayBookings.length,
      guestsCount: todayExpectedGuests,
      settledRevenue: todaySettledRevenue,
      pendingRevenue: todayPendingRevenue,
      totalRevenue: todaySettledRevenue + todayPendingRevenue,
    }
  }, [bookings, sessions])

  const recentNotifications = notifications.slice(0, 3)

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background">
      {/* Admin Header with Breadcrumbs & Quick Schedule Action */}
      <AdminHeader
        breadcrumbs={[
          { label: 'Admin Console', href: '/admin/dashboard' },
          { label: 'Executive Overview' },
        ]}
        title="Executive Atelier Dashboard"
        subtitle="Live atelier capacity, on-premise revenue settlements, and appointment orchestration."
        actionButton={{
          label: 'Schedule Session',
          onClick: () => router.push('/admin/sessions'),
          icon: Plus,
        }}
      />

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 max-w-7xl w-full mx-auto">
        {/* Today's Operational Glance Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground font-display">
                  {new Date().toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-semibold">
                  Atelier Open
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {todayStats.sessionsCount} sessions scheduled today • {todayStats.guestsCount} guests expected • ${todayStats.totalRevenue.toLocaleString()} {currency} expected volume
              </p>
            </div>
          </div>

          {/* Quick Refresh & Navigation Action */}
          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoadingData}
              className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title="Refresh database live sync"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Live DB'}</span>
            </button>
            <Link
              href="/admin/bookings"
              className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Master Ledger</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Executive KPI Summary Cards */}
        <AdminKpiCards />

        {/* Core Operations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Quick Modules & Atelier Schedule */}
          <div className="lg:col-span-2 space-y-6">
            {/* Direct Access Atelier Modules */}
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Atelier Operational Modules
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Direct access to session roster, client directory, and master bookings
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Sessions & Categories Module */}
                <Link
                  href="/admin/sessions"
                  className="p-4 rounded-xl border border-border bg-background/50 hover:border-primary/50 hover:bg-background hover:-translate-y-0.5 transition-all group block shadow-xs"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    Sessions &amp; Categories
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                    {sessions.length} sessions, {categories.length} service lines
                  </p>
                </Link>

                {/* Clients Module */}
                <Link
                  href="/admin/clients"
                  className="p-4 rounded-xl border border-border bg-background/50 hover:border-primary/50 hover:bg-background hover:-translate-y-0.5 transition-all group block shadow-xs"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-accent/15 text-accent">
                      <Users className="w-4 h-4" />
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    Client Directory
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                    {clients.length} accounts, moderation &amp; VIPs
                  </p>
                </Link>

                {/* Bookings Ledger Module */}
                <Link
                  href="/admin/bookings"
                  className="p-4 rounded-xl border border-border bg-background/50 hover:border-primary/50 hover:bg-background hover:-translate-y-0.5 transition-all group block shadow-xs"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-[#3e6b48]/10 text-[#3e6b48]">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    Master Bookings
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                    {bookings.length} reservations, 1-click check-in
                  </p>
                </Link>
              </div>
            </div>

            {/* Published Atelier Schedule & Occupancy Roster */}
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Published Atelier Schedule
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Live capacity thresholds and real-time attendee occupancy
                  </p>
                </div>

                {/* Session Filter Tabs */}
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center p-0.5 rounded-lg bg-background border border-border shadow-xs text-xs">
                    <button
                      type="button"
                      onClick={() => setSessionFilter('upcoming')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        sessionFilter === 'upcoming'
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Upcoming
                    </button>
                    <button
                      type="button"
                      onClick={() => setSessionFilter('full')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        sessionFilter === 'full'
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Full Capacity
                    </button>
                    <button
                      type="button"
                      onClick={() => setSessionFilter('all')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        sessionFilter === 'all'
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      All
                    </button>
                  </div>

                  <Link
                    href="/admin/sessions"
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0 ml-1"
                  >
                    <span>Manage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Sessions List */}
              <div className="space-y-3">
                {filteredSessions.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-border bg-background/30 space-y-3">
                    <Calendar className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                    <p className="text-xs font-medium text-muted-foreground">
                      No sessions matching filter "{sessionFilter}".
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push('/admin/sessions')}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold cursor-pointer"
                    >
                      Schedule New Session
                    </button>
                  </div>
                ) : (
                  filteredSessions.slice(0, 4).map((ses) => {
                    const percent = ses.max_slots > 0 ? Math.round((ses.booked_slots / ses.max_slots) * 100) : 0
                    return (
                      <div
                        key={ses.id}
                        className="p-4 rounded-xl border border-border bg-background/50 hover:border-border/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
                              {ses.category_name}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                ses.status === 'full'
                                  ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                  : ses.status === 'completed'
                                  ? 'bg-muted text-muted-foreground border border-border'
                                  : 'bg-[#3e6b48]/10 text-[#3e6b48] border border-[#3e6b48]/20'
                              }`}
                            >
                              {ses.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-foreground truncate">{ses.title}</h4>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1 text-primary font-medium">
                              <Clock className="w-3 h-3" />
                              {new Date(ses.start_time).toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              • {new Date(ses.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">{ses.location_address || 'Studio'}</span>
                            </span>
                            <span>•</span>
                            <span className="font-bold text-foreground">
                              ${ses.price} {ses.currency}
                            </span>
                          </div>
                        </div>

                        {/* Capacity Bar & Action */}
                        <div className="w-full sm:w-48 space-y-1.5 shrink-0">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground font-medium">Occupancy</span>
                            <span className="font-bold text-foreground">
                              {ses.booked_slots}/{ses.max_slots} ({percent}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                percent >= 100
                                  ? 'bg-destructive'
                                  : percent >= 80
                                  ? 'bg-accent'
                                  : 'bg-primary'
                              }`}
                              style={{ width: `${Math.min(100, percent)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Recent Activities & Audit Log with Admin / Client Filters */}
            <AdminRecentActivities />
          </div>

          {/* Right Column (1 Col): Fast Check-In & Concierge Status */}
          <div className="space-y-6">
            {/* Recent Bookings & 1-Click Fast Attendance Check-In */}
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Recent Bookings
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    1-click attendance check-in
                  </p>
                </div>
                <Link
                  href="/admin/bookings"
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Ledger</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Fast Booking Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search guest or booking #..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                />
              </div>

              {/* Bookings Feed */}
              <div className="space-y-3">
                {filteredBookings.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-dashed border-border bg-background/30 space-y-2">
                    <BookOpen className="w-6 h-6 text-muted-foreground mx-auto opacity-50" />
                    <p className="text-xs text-muted-foreground">No bookings found.</p>
                  </div>
                ) : (
                  filteredBookings.map((bk) => (
                    <div
                      key={bk.id}
                      className="p-3.5 rounded-xl border border-border bg-background/50 hover:border-border/80 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-primary">
                          {bk.booking_number}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            bk.payment_status === 'paid_on_premise'
                              ? 'bg-[#3e6b48]/10 text-[#3e6b48] border border-[#3e6b48]/20'
                              : 'bg-accent/15 text-accent border border-accent/20'
                          }`}
                        >
                          {bk.payment_status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-foreground">
                          {bk.client_name}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {bk.session_title}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">
                          ${bk.total_price} {bk.currency}
                        </span>

                        {bk.check_in_time ? (
                          <span className="text-[10px] font-bold text-[#3e6b48] flex items-center gap-1 bg-[#3e6b48]/10 px-2 py-1 rounded-lg border border-[#3e6b48]/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Checked In</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => checkInBooking(bk.id)}
                            className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            Check In
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Atelier Concierge & Live Studio Configuration Card */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Atelier Parameters</span>
                </div>
                <Link
                  href="/admin/sessions"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="Studio settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </Link>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Operating in in-person boutique settlement mode. Appointments, slot reservations, and client dossiers are synchronized across the atelier console.
              </p>

              <div className="space-y-2 pt-1 border-t border-border text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Studio Location</span>
                  <span className="font-semibold text-foreground truncate max-w-[170px]" title={studioAddress}>
                    {studioAddress}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Settlement Currency</span>
                  <span className="font-semibold text-foreground">{currency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Advance Window</span>
                  <span className="font-semibold text-foreground">
                    {appSettings?.max_booking_days_advance || 30} days max
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cancellation Lead</span>
                  <span className="font-semibold text-foreground">
                    {appSettings?.cancellation_lead_hours || 24} hours notice
                  </span>
                </div>
              </div>
            </div>

            {/* Real-time Atelier Alerts Feed */}
            {recentNotifications.length > 0 && (
              <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                    <Bell className="w-4 h-4 text-primary" />
                    <span>Real-Time Alerts</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {notifications.filter((n) => !n.read).length} unread
                  </span>
                </div>

                <div className="space-y-2">
                  {recentNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        notif.read
                          ? 'border-border/60 bg-background/40 opacity-70'
                          : 'border-primary/30 bg-primary/5 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-foreground text-[11px]">
                        <span>{notif.title}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">{notif.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

