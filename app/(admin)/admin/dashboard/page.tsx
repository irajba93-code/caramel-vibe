'use client'

import React from 'react'
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
  ExternalLink,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminKpiCards } from '@/components/admin/AdminKpiCards'
import { useAdminMock } from '@/context/AdminMockContext'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { sessions, categories, clients, bookings, checkInBooking } = useAdminMock()

  const recentBookings = bookings.slice(0, 4)
  const upcomingSessions = sessions.filter((s) => s.status === 'published' || s.status === 'full').slice(0, 3)

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Admin Header with Breadcrumbs & Contextual Quick Action */}
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
      <div className="p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
        {/* Executive KPI Summary Cards with Date Range Filter & Trends */}
        <AdminKpiCards />

        {/* Core Operations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Access Modules */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Atelier Operational Modules
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Direct access to session catalog, client dossiers, and master bookings
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
                    {clients.length} accounts, moderation &amp; dossiers
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

            {/* Upcoming Sessions Roster */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Published Atelier Schedule
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Live capacity and attendee occupancy thresholds
                  </p>
                </div>
                <Link
                  href="/admin/sessions"
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Manage All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {upcomingSessions.map((ses) => {
                  const percent = Math.round((ses.booked_slots / ses.max_slots) * 100)
                  return (
                    <div
                      key={ses.id}
                      className="p-4 rounded-xl border border-border bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
                            {ses.category_name}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              ses.status === 'full'
                                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                : 'bg-[#3e6b48]/10 text-[#3e6b48] border border-[#3e6b48]/20'
                            }`}
                          >
                            {ses.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-foreground">{ses.title}</h4>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                          <Clock className="w-3 h-3 text-primary" />
                          <span>
                            {new Date(ses.start_time).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            • {new Date(ses.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span>${ses.price} {ses.currency}</span>
                        </div>
                      </div>

                      {/* Capacity Bar */}
                      <div className="w-full sm:w-44 space-y-1.5 shrink-0">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">Capacity</span>
                          <span className="font-bold text-foreground">
                            {ses.booked_slots}/{ses.max_slots} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              percent >= 100 ? 'bg-destructive' : 'bg-primary'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Recent Bookings & Live Attendance */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Recent Bookings
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Fast attendance check-in
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

              <div className="space-y-3">
                {recentBookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-3.5 rounded-xl border border-border bg-background/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary">
                        {bk.booking_number}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          bk.payment_status === 'paid_on_premise'
                            ? 'bg-[#3e6b48]/10 text-[#3e6b48]'
                            : 'bg-accent/15 text-accent'
                        }`}
                      >
                        {bk.payment_status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-foreground">
                      {bk.client_name}
                    </div>

                    <div className="text-[11px] text-muted-foreground truncate">
                      {bk.session_title}
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">
                        ${bk.total_price} {bk.currency}
                      </span>

                      {bk.check_in_time ? (
                        <span className="text-[10px] font-bold text-[#3e6b48] flex items-center gap-1 bg-[#3e6b48]/10 px-2 py-1 rounded-lg">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Checked In</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => checkInBooking(bk.id)}
                          className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Check In
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Status Badge */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Atelier Concierge Mode</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Operating in full in-person settlement mode. All appointment slots, client notes, and attendance timestamps are synced in real-time.
              </p>
              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Flagship Studio</span>
                <span className="font-semibold text-foreground">Suite 402</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
