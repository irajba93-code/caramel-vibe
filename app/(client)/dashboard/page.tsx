'use client'

import React, { useEffect, useState, useCallback, useMemo, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastContext'
import { Avatar } from '@/components/ui/Avatar'
import { ClientPassModal, type ClientPassBooking } from '@/components/client/ClientPassModal'
import { ClientCancelModal } from '@/components/client/ClientCancelModal'
import { ClientBookingDrawer } from '@/components/client/ClientBookingDrawer'
import { generateIcsFile } from '@/lib/client/calendarExport'
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
  User,
  ShieldCheck,
  RefreshCw,
  Download,
  AlertCircle,
  Plus,
  Ticket,
  ListOrdered,
  History,
  Crown,
  ChevronRight,
  CalendarCheck,
  XCircle,
  HelpCircle,
  FileText,
  ShoppingBag,
  MessageSquare,
  ExternalLink,
  Package,
} from 'lucide-react'
import type { Profile, Session, SessionWaitlist } from '@/lib/supabase/types'

interface FormattedBooking extends ClientPassBooking {
  category_name?: string
}

export interface ReservedHandbag {
  id: string
  reference_number: string
  product_name: string
  product_price: string
  product_image: string
  product_detail?: string
  shipping_address: string
  payment_method: string
  special_requests?: string
  status: string
  created_at: string
  client_name?: string
  client_phone?: string
}

interface FormattedWaitlist extends SessionWaitlist {
  session?: {
    id: string
    title: string
    category_name?: string
    start_time: string
    end_time: string
    price: number
    currency: string
    location_address: string
  }
}

function MemberDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const supabase = useMemo(() => createClient(), [])

  // State
  const [profile, setProfile] = useState<Profile | null>(null)
  const [bookings, setBookings] = useState<FormattedBooking[]>([])
  const [reservedHandbags, setReservedHandbags] = useState<ReservedHandbag[]>([])
  const [waitlists, setWaitlists] = useState<FormattedWaitlist[]>([])
  const [availableSessions, setAvailableSessions] = useState<(Session & { category_name?: string })[]>([])
  const [cancellationLeadHours, setCancellationLeadHours] = useState(24)
  const [studioCurrency, setStudioCurrency] = useState('CAD')
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'upcoming' | 'handbags' | 'waitlist' | 'history'>('upcoming')

  // Sync tab from URL search parameters if provided
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'handbags' || tabParam === 'waitlist' || tabParam === 'history' || tabParam === 'upcoming') {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // Modals & Drawers
  const [selectedPassBooking, setSelectedPassBooking] = useState<FormattedBooking | null>(null)
  const [selectedCancelBooking, setSelectedCancelBooking] = useState<FormattedBooking | null>(null)
  const [selectedBookingSession, setSelectedBookingSession] = useState<(Session & { category_name?: string }) | null>(null)

  // Fetch all client data
  const loadDashboardData = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?redirect=/dashboard')
        return
      }

      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData as Profile)
      }

      // 2. Fetch App Settings
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('*')

      if (settingsData) {
        const leadSetting = settingsData.find((s) => s.key === 'cancellation_lead_hours')
        if (leadSetting && typeof leadSetting.value === 'number') {
          setCancellationLeadHours(leadSetting.value)
        }
        const currSetting = settingsData.find((s) => s.key === 'studio_currency')
        if (currSetting && typeof currSetting.value === 'string') {
          setStudioCurrency(currSetting.value)
        }
      }

      // 3. Fetch Bookings with Session Details
      const { data: bookingsData, error: bError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_number,
          slots_booked,
          total_price,
          currency,
          status,
          payment_status,
          check_in_time,
          client_notes,
          created_at,
          session:sessions (
            id,
            title,
            description,
            start_time,
            end_time,
            location_address,
            location_type,
            session_type_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!bError && bookingsData) {
        // Fetch categories or session types for category names
        const { data: sessionTypes } = await supabase.from('session_types').select('id, category')
        const typeMap = new Map((sessionTypes || []).map((t) => [t.id, t.category]))

        const formatted = bookingsData
          .filter((b) => b.session)
          .map((b: any) => ({
            ...b,
            session: {
              ...b.session,
              category_name: typeMap.get(b.session.session_type_id) || 'Atelier Experience',
            },
          })) as FormattedBooking[]

        setBookings(formatted)
      }

      // 4. Fetch Handbag Reservation Inquiries from system_notifications_log
      const notifQuery = user.email
        ? supabase
            .from('system_notifications_log')
            .select('*')
            .or(`recipient_id.eq.${user.id},recipient_email.eq.${user.email}`)
            .eq('notification_type', 'bag_reservation_inquiry')
            .order('created_at', { ascending: false })
        : supabase
            .from('system_notifications_log')
            .select('*')
            .eq('recipient_id', user.id)
            .eq('notification_type', 'bag_reservation_inquiry')
            .order('created_at', { ascending: false })

      const { data: handbagNotifs, error: bagError } = await notifQuery

      if (!bagError && handbagNotifs) {
        const parsedBags: ReservedHandbag[] = handbagNotifs.map((n) => {
          const meta = (n.metadata || {}) as any
          return {
            id: n.id,
            reference_number: meta.reference_number || `RSV-${n.id.slice(0, 6)}`,
            product_name: meta.product_name || 'Archival Handbag',
            product_price: meta.product_price || '',
            product_image: meta.product_image || '/products/caramel-satchel.png',
            product_detail: meta.product_detail || 'Vintage leather · Authenticated',
            shipping_address: meta.shipping_address || '',
            payment_method: meta.payment_method || 'Cash on delivery',
            special_requests: meta.special_requests || '',
            status: meta.status || 'Pending Concierge Confirmation',
            created_at: meta.created_at || n.created_at,
            client_name: meta.client_name || profileData?.full_name || '',
            client_phone: meta.client_phone || profileData?.phone || '',
          }
        })
        setReservedHandbags(parsedBags)
      }

      // 5. Fetch Waitlists
      const { data: waitlistData } = await supabase
        .from('session_waitlists')
        .select(`
          id,
          session_id,
          user_id,
          requested_slots,
          status,
          notes,
          created_at,
          notified_at,
          session:sessions (
            id,
            title,
            start_time,
            end_time,
            price,
            currency,
            location_address,
            session_type_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (waitlistData) {
        const formattedWaitlist = waitlistData.map((w: any) => ({
          ...w,
          session: Array.isArray(w.session) ? w.session[0] : w.session,
        })) as FormattedWaitlist[]
        setWaitlists(formattedWaitlist)
      }

      // 6. Fetch Available Published Sessions for Discovery
      const nowIso = new Date().toISOString()
      const { data: sessionsData } = await supabase
        .from('sessions')
        .select('*')
        .eq('status', 'published')
        .gt('start_time', nowIso)
        .order('start_time', { ascending: true })
        .limit(6)

      if (sessionsData) {
        const { data: sessionTypes } = await supabase.from('session_types').select('id, category')
        const typeMap = new Map((sessionTypes || []).map((t) => [t.id, t.category]))

        const mappedSessions = sessionsData.map((s) => ({
          ...s,
          category_name: typeMap.get(s.session_type_id) || 'Atelier Experience',
        }))
        setAvailableSessions(mappedSessions)
      }
    } catch (err) {
      console.error('Error loading client dashboard data:', err)
    } finally {
      setLoading(false)
      if (showIndicator) {
        setTimeout(() => setIsRefreshing(false), 500)
      }
    }
  }, [supabase, router])

  // Initial Load
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Realtime Subscriptions & Window Refresh Listener
  useEffect(() => {
    const handleLocalRefresh = () => {
      loadDashboardData()
    }
    window.addEventListener('atelier-notification-refresh', handleLocalRefresh)

    if (!profile?.id) {
      return () => {
        window.removeEventListener('atelier-notification-refresh', handleLocalRefresh)
      }
    }

    const bookingsChannel = supabase
      .channel(`client-bookings-sync-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${profile.id}`,
        },
        () => {
          loadDashboardData()
        }
      )
      .subscribe()

    const notifsChannel = supabase
      .channel(`client-notifs-dashboard-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_notifications_log',
          filter: `recipient_id=eq.${profile.id}`,
        },
        () => {
          loadDashboardData()
        }
      )
      .subscribe()

    const sessionsChannel = supabase
      .channel('client-sessions-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
        },
        () => {
          loadDashboardData()
        }
      )
      .subscribe()

    return () => {
      window.removeEventListener('atelier-notification-refresh', handleLocalRefresh)
      supabase.removeChannel(bookingsChannel)
      supabase.removeChannel(notifsChannel)
      supabase.removeChannel(sessionsChannel)
    }
  }, [profile?.id, supabase, loadDashboardData])

  // Filter Bookings by Tab
  const now = new Date().getTime()
  const upcomingBookings = useMemo(
    () =>
      bookings.filter((b) => {
        const isFuture = new Date(b.session.start_time).getTime() >= now
        return isFuture && b.status !== 'cancelled'
      }),
    [bookings, now]
  )

  const pastBookings = useMemo(
    () =>
      bookings.filter((b) => {
        const isPast = new Date(b.session.start_time).getTime() < now
        return isPast || b.status === 'completed' || b.status === 'cancelled'
      }),
    [bookings, now]
  )

  // Quick Calendar Export handler for card button
  const handleExportIcs = (b: FormattedBooking) => {
    try {
      generateIcsFile({
        title: b.session.title,
        description: `Caramel Vibe Atelier Appointment. Booking ref: ${b.booking_number}.`,
        location: b.session.location_address,
        startTime: b.session.start_time,
        endTime: b.session.end_time,
        bookingNumber: b.booking_number,
      })
      showToast('Appointment .ics file downloaded.', 'success')
    } catch {
      showToast('Failed to export calendar file.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="container-cv py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
        <Sparkles className="w-6 h-6 animate-pulse text-accent" />
        <span className="text-sm font-medium">Hydrating member atelier dossier...</span>
      </div>
    )
  }

  const isNewMember = bookings.length === 0

  return (
    <div className="container-cv space-y-8 max-w-6xl pb-12">
      {/* Hero Welcome Banner */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle decorative gold sheen */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${
                  profile?.role === 'client'
                    ? 'bg-primary/10 text-primary border-primary/25'
                    : profile?.role === 'admin'
                    ? 'bg-accent/15 text-accent border-accent/30'
                    : 'bg-muted/60 text-muted-foreground border-border'
                }`}
              >
                {profile?.role === 'client' && <Sparkles className="w-3.5 h-3.5" />}
                {profile?.role === 'admin' && <Crown className="w-3.5 h-3.5" />}
                {profile?.role === 'user' && <User className="w-3.5 h-3.5" />}
                <span>
                  Membership Tier:{' '}
                  {profile?.role === 'client'
                    ? 'Verified Atelier Client'
                    : profile?.role === 'admin'
                    ? 'Administrator'
                    : 'Standard Member'}
                </span>
              </span>

              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#3e6b48]/10 text-[#3e6b48] border border-[#3e6b48]/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>{profile?.status || 'Active'}</span>
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Welcome, {profile?.full_name || 'Valued Member'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Your private sanctuary for bespoke atelier consultations, archival authentication reviews, and live reservation management.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={() => loadDashboardData(true)}
              disabled={isRefreshing}
              className="px-3.5 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
              title="Refresh live appointments"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Live'}</span>
            </button>

            <Link
              href="/client/profile"
              className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Dossier Settings</span>
            </Link>

            <Link
              href="/sessions"
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Reserve Session</span>
            </Link>
          </div>
        </div>

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-6 mt-6 border-t border-border/80">
          <div className="p-3 rounded-2xl bg-background/60 border border-border/60 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground font-display">
                {upcomingBookings.length}
              </div>
              <div className="text-[11px] text-muted-foreground font-medium">
                Active Appointments
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-background/60 border border-border/60 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground font-display">
                {reservedHandbags.length}
              </div>
              <div className="text-[11px] text-muted-foreground font-medium">
                Reserved Handbags
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-background/60 border border-border/60 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/15 text-accent">
              <ListOrdered className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground font-display">
                {waitlists.length}
              </div>
              <div className="text-[11px] text-muted-foreground font-medium">
                Waitlist Positions
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-background/60 border border-border/60 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#3e6b48]/10 text-[#3e6b48]">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground font-display">
                {pastBookings.filter((b) => b.status === 'completed' || b.check_in_time).length}
              </div>
              <div className="text-[11px] text-muted-foreground font-medium">
                Completed Visits
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Member 3-Step Onboarding Pathway (Conditional for 0 bookings) */}
      {isNewMember && (
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Onboarding Concierge</span>
              </div>
              <h3 className="font-display font-bold text-xl text-foreground">
                Begin Your Atelier Journey
              </h3>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              3 Simple Steps to Atelier Privileges
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-background border border-border/80 space-y-2 relative group hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  1
                </span>
                {profile?.phone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#3e6b48]" />
                ) : (
                  <span className="text-[10px] text-accent font-bold uppercase tracking-wider">
                    Recommended
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm text-foreground">Personal Dossier</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Add your contact phone and personal avatar to customize your digital passes.
              </p>
              <Link
                href="/client/profile"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline pt-1"
              >
                <span>Edit Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-background border border-border/80 space-y-2 relative group hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                  Next Step
                </span>
              </div>
              <h4 className="font-bold text-sm text-foreground">Reserve Experience</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Browse our curated session calendar and place an in-person appointment hold.
              </p>
              <Link
                href="/sessions"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline pt-1"
              >
                <span>View Full Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-background border border-border/80 space-y-2 relative group hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <Crown className="w-4 h-4 text-accent" />
              </div>
              <h4 className="font-bold text-sm text-foreground">Client VIP Promotion</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Automatically unlock verified client standing and priority waitlisting upon your first reservation.
              </p>
              <span className="text-[10px] font-semibold text-accent uppercase tracking-wider block pt-1">
                Automated System Trigger
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Booking Management Hub */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        {/* Tab Navigation Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <h2 className="font-display font-bold text-2xl text-foreground">
              Client Reservations &amp; Passes
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live sessions, reserved archival handbags, digital passes, and waitlist allocations
            </p>
          </div>

          {/* Segmented Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-background border border-border shadow-xs self-start sm:self-auto text-xs overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'upcoming'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Upcoming ({upcomingBookings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('handbags')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'handbags'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Reserved Bags ({reservedHandbags.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('waitlist')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'waitlist'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Waitlist ({waitlists.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'history'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Archive ({pastBookings.length})</span>
            </button>
          </div>
        </div>

        {/* Tab: Reserved Handbags */}
        {activeTab === 'handbags' && (
          <div className="space-y-4">
            {reservedHandbags.length === 0 ? (
              <div className="p-10 rounded-2xl border border-dashed border-border bg-background/40 text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-muted-foreground/60 mx-auto" />
                <h4 className="font-display font-bold text-base text-foreground">
                  No Reserved Handbags
                </h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  You have not reserved any archival pieces yet. Browse our curated edit on the storefront to secure a one-of-one vintage piece.
                </p>
                <Link
                  href="/#edit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-xs mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Explore The Edit</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reservedHandbags.map((bag) => {
                  const createdDate = new Date(bag.created_at)
                  const whatsappMsg = encodeURIComponent(
                    `Hello Caramel Vibe Concierge, checking in on my handbag reservation for ${bag.product_name} (Ref: #${bag.reference_number}).`
                  )
                  const whatsappUrl = `https://wa.me/?text=${whatsappMsg}`

                  return (
                    <div
                      key={bag.id}
                      className="p-5 rounded-2xl border border-border bg-background hover:border-primary/40 transition-all shadow-xs space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            Archival Handbag
                          </span>
                          <span className="font-mono text-xs font-bold text-accent">
                            #{bag.reference_number}
                          </span>
                        </div>

                        <div className="flex items-center gap-3.5">
                          <div className="relative w-16 h-16 rounded-xl bg-muted p-2 shrink-0 border border-border/80 flex items-center justify-center overflow-hidden">
                            <Image
                              src={bag.product_image || '/products/caramel-satchel.png'}
                              alt={bag.product_name}
                              width={64}
                              height={64}
                              className="object-contain max-h-12 w-auto"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-bold text-lg text-foreground truncate">
                              {bag.product_name}
                            </h3>
                            <p className="text-sm font-bold text-primary">{bag.product_price}</p>
                            {bag.product_detail && (
                              <p className="text-[11px] text-muted-foreground truncate">
                                {bag.product_detail}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/60">
                          <div className="flex items-center gap-2 text-foreground font-medium">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span>
                              Reserved on{' '}
                              {createdDate.toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-accent" />
                            <span className="truncate">
                              Destination: {bag.shipping_address || 'Studio Collection / Local Delivery'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-primary" />
                            <span>Settlement: {bag.payment_method}</span>
                          </div>

                          {bag.special_requests && (
                            <p className="text-[11px] text-muted-foreground italic bg-muted/40 p-2 rounded-lg">
                              &ldquo;{bag.special_requests}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Status Bar */}
                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-muted-foreground">Reservation Status</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{bag.status}</span>
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-3 border-t border-border/80 flex items-center justify-between gap-2">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp Concierge</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 1: Upcoming Appointments */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <div className="p-10 rounded-2xl border border-dashed border-border bg-background/40 text-center space-y-3">
                <Calendar className="w-10 h-10 text-muted-foreground/60 mx-auto" />
                <h4 className="font-display font-bold text-base text-foreground">
                  No Upcoming Appointments
                </h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  You do not have any active session reservations. Explore our curated calendar below to reserve an in-person authentication review or archival consultation.
                </p>
                <a
                  href="#atelier-sessions"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-xs mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Discover Open Sessions</span>
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingBookings.map((b) => {
                  const startDate = new Date(b.session.start_time)
                  const endDate = new Date(b.session.end_time)

                  return (
                    <div
                      key={b.id}
                      className="p-5 rounded-2xl border border-border bg-background hover:border-primary/40 transition-all shadow-xs space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
                            {b.session.category_name || 'Atelier Consultation'}
                          </span>
                          <span className="font-mono text-xs font-bold text-primary">
                            #{b.booking_number}
                          </span>
                        </div>

                        <h3 className="font-display font-bold text-lg text-foreground">
                          {b.session.title}
                        </h3>

                        <div className="space-y-1.5 text-xs text-muted-foreground">
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
                            <span className="truncate">{b.session.location_address || 'Studio'}</span>
                          </div>
                        </div>

                        {/* Status Pills */}
                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">
                            {b.slots_booked} {b.slots_booked === 1 ? 'Guest' : 'Guests'} • ${b.total_price} {b.currency}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              b.check_in_time
                                ? 'bg-[#3e6b48]/10 text-[#3e6b48] border border-[#3e6b48]/25'
                                : 'bg-primary/10 text-primary border border-primary/20'
                            }`}
                          >
                            {b.check_in_time ? 'Checked In' : 'Confirmed'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-border/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedPassBooking(b)}
                            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>Digital Pass</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportIcs(b)}
                            title="Download .ics Calendar Event"
                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedCancelBooking(b)}
                          className="px-2.5 py-1.5 rounded-lg border border-border hover:border-[#9e3b32]/40 hover:bg-[#9e3b32]/10 text-muted-foreground hover:text-[#9e3b32] text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Waitlist Queue */}
        {activeTab === 'waitlist' && (
          <div className="space-y-4">
            {waitlists.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-background/40 space-y-2">
                <ListOrdered className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                <h4 className="font-bold text-sm text-foreground">No Active Waitlists</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  When fully-booked sessions become full, you can join their waitlist to receive instant promotion alerts.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {waitlists.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-2xl border border-border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-foreground">
                          {w.session?.title || 'Atelier Session'}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            w.status === 'promoted'
                              ? 'bg-[#3e6b48]/10 text-[#3e6b48] border border-[#3e6b48]/25'
                              : 'bg-accent/15 text-accent border border-accent/25'
                          }`}
                        >
                          {w.status === 'promoted' ? 'Spot Promoted!' : 'Waiting in Queue'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Requested {w.requested_slots} guest slot(s) • Joined on{' '}
                        {new Date(w.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {w.status === 'promoted' ? (
                        <button
                          type="button"
                          onClick={() => showToast('Redirecting to claim promoted allocation...', 'success')}
                          className="px-4 py-2 rounded-xl bg-[#3e6b48] text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-xs cursor-pointer"
                        >
                          Claim Reserved Spot
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium">
                          Priority Queue Active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Past Visits Archive */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {pastBookings.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-background/40 space-y-2">
                <History className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                <h4 className="font-bold text-sm text-foreground">No Past Visits on Record</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Completed atelier visits and historical appointment invoices will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl border border-border/80 bg-background/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground text-sm">
                          {b.session.title}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          #{b.booking_number}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            b.status === 'cancelled'
                              ? 'bg-[#9e3b32]/10 text-[#9e3b32]'
                              : 'bg-[#3e6b48]/10 text-[#3e6b48]'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(b.session.start_time).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        • {b.slots_booked} guest(s) • Total: ${b.total_price} {b.currency}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPassBooking(b)}
                        className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer"
                      >
                        View Receipt / Pass
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Curated Atelier Discovery Strip */}
      <div id="atelier-sessions" className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Available Atelier Experiences</span>
            </div>
            <h2 className="font-display font-bold text-2xl text-foreground">
              Curated Studio Calendar
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select an upcoming session for immediate on-premise reservation hold
            </p>
          </div>

          <Link
            href="/sessions"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Browse Full Atelier Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableSessions.length === 0 ? (
            <div className="col-span-full p-8 text-center rounded-2xl border border-dashed border-border bg-background/40">
              <p className="text-xs text-muted-foreground">
                No open sessions currently published. Check back soon for newly scheduled dates.
              </p>
            </div>
          ) : (
            availableSessions.map((ses) => {
              const startDate = new Date(ses.start_time)
              const remaining = Math.max(0, (ses.max_slots || 0) - (ses.booked_slots || 0))
              const percent = ses.max_slots > 0 ? Math.round(((ses.booked_slots || 0) / ses.max_slots) * 100) : 0

              return (
                <div
                  key={ses.id}
                  className="p-5 rounded-2xl border border-border bg-background hover:border-primary/50 transition-all flex flex-col justify-between space-y-4 group shadow-xs hover:-translate-y-0.5"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/20">
                        {ses.category_name}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        ${ses.price} {ses.currency}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors">
                      {ses.title}
                    </h3>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>
                          {startDate.toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-accent" />
                        <span>
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Capacity Indicator */}
                    <div className="space-y-1 pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="font-bold text-foreground">
                          {remaining} {remaining === 1 ? 'Slot Left' : 'Slots Left'}
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

                  <button
                    type="button"
                    onClick={() => setSelectedBookingSession(ses)}
                    disabled={remaining === 0}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Digital Pass Modal */}
      <ClientPassModal
        booking={selectedPassBooking}
        clientName={profile?.full_name || 'Atelier Member'}
        clientEmail={profile?.email || ''}
        isOpen={Boolean(selectedPassBooking)}
        onClose={() => setSelectedPassBooking(null)}
      />

      {/* Cancellation Modal */}
      <ClientCancelModal
        booking={selectedCancelBooking}
        cancellationLeadHours={cancellationLeadHours}
        isOpen={Boolean(selectedCancelBooking)}
        onClose={() => setSelectedCancelBooking(null)}
        onSuccess={() => loadDashboardData()}
      />

      {/* Slide-over Booking Drawer */}
      <ClientBookingDrawer
        session={selectedBookingSession}
        isOpen={Boolean(selectedBookingSession)}
        onClose={() => setSelectedBookingSession(null)}
        onSuccess={() => loadDashboardData()}
      />
    </div>
  )
}

export default function MemberDashboardPage() {
  return (
    <Suspense fallback={<div className="container-cv py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-3"><Sparkles className="w-6 h-6 animate-pulse text-accent" /><span className="text-sm font-medium">Hydrating member atelier dossier...</span></div>}>
      <MemberDashboardContent />
    </Suspense>
  )
}
