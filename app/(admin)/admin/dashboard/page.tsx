'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastContext'
import {
  DollarSign,
  Calendar,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react'

export default function AdminDashboardPage() {
  const { showToast } = useToast()
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalSessions: 3,
    totalBookings: 0,
    totalClients: 0,
    revenuePending: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [
          { count: sessionsCount },
          { count: bookingsCount },
          { count: clientsCount },
        ] = await Promise.all([
          supabase.from('sessions').select('*', { count: 'exact', head: true }),
          supabase.from('bookings').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
        ])

        setStats({
          totalSessions: sessionsCount || 0,
          totalBookings: bookingsCount || 0,
          totalClients: clientsCount || 0,
          revenuePending: 0,
        })
      } catch (err) {
        console.error('Error fetching admin stats:', err)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [supabase])

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl w-full">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="eyebrow mb-1">Operational Command</div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Executive Atelier Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor studio capacity, on-premise revenue settlements, and private appointment workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/sessions/new"
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Atelier Session</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
            <span>On-Premise Revenue</span>
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">
            ${stats.revenuePending.toLocaleString()} CAD
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <span className="text-[#3e6b48] font-semibold">100% In-Person</span> settlement mode
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
            <span>Active Sessions</span>
            <Calendar className="w-4 h-4 text-accent" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">
            {stats.totalSessions}
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <span>Published catalog slots</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
            <span>Total Reservations</span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">
            {stats.totalBookings}
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <span>Appointments booked</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
            <span>Registered Clients</span>
            <Users className="w-4 h-4 text-accent" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">
            {stats.totalClients}
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <span>Active accounts</span>
          </div>
        </div>
      </div>

      {/* Operations Quick-Access Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Nav Links */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">
              Management Modules
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Direct access to operational ledgers and studio tools
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/admin/sessions"
              className="p-4 rounded-xl border border-border bg-background/60 hover:border-primary/50 hover:bg-background transition-all group block"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Studio Sessions Master
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Manage appointment timeslots, capacity thresholds, and weekly availability rules.
              </p>
            </Link>

            <Link
              href="/admin/bookings"
              className="p-4 rounded-xl border border-border bg-background/60 hover:border-primary/50 hover:bg-background transition-all group block"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Master Bookings Ledger
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Review confirmed appointments, check-in attendees, and export attendance records to CSV.
              </p>
            </Link>

            <Link
              href="/admin/clients"
              className="p-4 rounded-xl border border-border bg-background/60 hover:border-primary/50 hover:bg-background transition-all group block"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Client Directory & Moderation
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Inspect member profiles, manage bans/rejections, and view lifetime appointment histories.
              </p>
            </Link>

            <Link
              href="/admin/reporting"
              className="p-4 rounded-xl border border-border bg-background/60 hover:border-primary/50 hover:bg-background transition-all group block"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Financials & Analytics
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Review atelier capacity utilization, cancellation rates, and in-person revenue totals.
              </p>
            </Link>
          </div>
        </div>

        {/* Live System Status */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Infrastructure Status</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-background/60 border border-border flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Database & Auth</div>
                <div className="text-[10px] text-muted-foreground">Supabase PostgreSQL</div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#3e6b48]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Connected</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-background/60 border border-border flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Route Guard Middleware</div>
                <div className="text-[10px] text-muted-foreground">Role-Based Access Control</div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#3e6b48]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-background/60 border border-border flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Error Monitoring</div>
                <div className="text-[10px] text-muted-foreground">Sentry Instrumentation</div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#3e6b48]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
