'use client'

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastContext'
import {
  ClientSessionsCalendar,
  type ClientCalendarSession,
} from '@/components/client/ClientSessionsCalendar'
import { ClientSessionsGrid } from '@/components/client/ClientSessionsGrid'
import { ClientBookingDrawer } from '@/components/client/ClientBookingDrawer'
import {
  Calendar as CalendarIcon,
  LayoutGrid,
  ListOrdered,
  Search,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
} from 'lucide-react'

function AtelierSessionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])
  const { showToast } = useToast()

  // State
  const [sessions, setSessions] = useState<ClientCalendarSession[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Filters & View Modes
  const [viewMode, setViewMode] = useState<'calendar' | 'grid' | 'list'>('calendar')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [availabilityOnly, setAvailabilityOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Booking Drawer State
  const [selectedSessionForBooking, setSelectedSessionForBooking] =
    useState<ClientCalendarSession | null>(null)

  // Load User Auth
  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    checkUser()
  }, [supabase])

  // Load Sessions Data
  const loadSessions = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true)

    try {
      const nowIso = new Date().toISOString()
      const { data: sessionsData, error: sError } = await supabase
        .from('sessions')
        .select('*')
        .eq('status', 'published')
        .gt('start_time', nowIso)
        .order('start_time', { ascending: true })

      if (sError) throw sError

      // Fetch category mapping from session_types
      const { data: sessionTypes } = await supabase.from('session_types').select('id, category')
      const typeMap = new Map((sessionTypes || []).map((t) => [t.id, t.category]))

      const formatted = (sessionsData || []).map((s) => ({
        ...s,
        category_name: typeMap.get(s.session_type_id) || 'Atelier Experience',
      })) as ClientCalendarSession[]

      setSessions(formatted)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load sessions'
      console.error('Error loading sessions:', msg)
      showToast(`Error updating session catalog: ${msg}`, 'error')
    } finally {
      setLoading(false)
      if (showIndicator) {
        setTimeout(() => setIsRefreshing(false), 500)
      }
    }
  }, [supabase, showToast])

  // Initial Load
  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  // Intent Recovery on Load (e.g. redirected back after login)
  useEffect(() => {
    if (loading || sessions.length === 0) return

    const bookSessionIdParam = searchParams.get('bookSessionId')
    if (bookSessionIdParam) {
      const found = sessions.find((s) => s.id === bookSessionIdParam)
      if (found) {
        setSelectedSessionForBooking(found)
        showToast(`Resumed booking for ${found.title}`, 'info')
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [searchParams, sessions, loading, showToast])

  // Realtime Subscriptions for live capacity updates
  useEffect(() => {
    const channel = supabase
      .channel('sessions-catalog-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
        },
        () => {
          loadSessions()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          loadSessions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, loadSessions])

  // Extract Unique Category Names
  const categories = useMemo(() => {
    const set = new Set<string>()
    sessions.forEach((s) => {
      if (s.category_name) set.add(s.category_name)
    })
    return Array.from(set)
  }, [sessions])

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      // Category filter
      if (selectedCategory !== 'all' && s.category_name !== selectedCategory) {
        return false
      }
      // Availability filter
      if (availabilityOnly) {
        const remaining = (s.max_slots || 0) - (s.booked_slots || 0)
        if (remaining <= 0) return false
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = s.title.toLowerCase().includes(q)
        const matchCat = s.category_name?.toLowerCase().includes(q)
        const matchDesc = s.description?.toLowerCase().includes(q)
        const matchLoc = s.location_address?.toLowerCase().includes(q)
        if (!matchTitle && !matchCat && !matchDesc && !matchLoc) return false
      }
      return true
    })
  }, [sessions, selectedCategory, availabilityOnly, searchQuery])

  // Gated Session Selection Trigger
  const handleSelectSessionWithAuth = async (session: ClientCalendarSession) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      showToast('Please sign in to reserve your atelier experience spot.', 'info')
      router.push(`/login?redirect=${encodeURIComponent(`/sessions?bookSessionId=${session.id}`)}`)
      return
    }

    setSelectedSessionForBooking(session)
  }

  if (loading) {
    return (
      <div className="container-cv py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
        <Sparkles className="w-6 h-6 animate-pulse text-accent" />
        <span className="text-sm font-medium">Curating atelier schedule and available dates...</span>
      </div>
    )
  }

  return (
    <div className="container-cv space-y-8 max-w-6xl pb-16">
      {/* Header Banner */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bespoke Atelier Calendar</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Atelier Experiences &amp; Sessions
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Explore our curated calendar of private styling consultations, archival handbag authentication reviews, and bespoke leather care masterclasses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={() => loadSessions(true)}
              disabled={isRefreshing}
              className="px-3.5 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
              title="Refresh live catalog"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Live'}</span>
            </button>

            <Link
              href="/dashboard"
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>My Passes &amp; Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Parameters Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-border/80 text-xs">
          <div className="p-3 rounded-2xl bg-background/60 border border-border/60 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-foreground">{sessions.length} Available Dates</div>
              <div className="text-[11px] text-muted-foreground font-medium">Published in Calendar</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-background/60 border border-border/60 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/15 text-accent">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-foreground">Verified Master Curators</div>
              <div className="text-[11px] text-muted-foreground font-medium">1-on-1 Studio Sessions</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-background/60 border border-border/60 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-foreground">Instant Digital Access Pass</div>
              <div className="text-[11px] text-muted-foreground font-medium">On-Premise Settlement</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & View Switcher Toolbar */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-background border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              All Experiences ({sessions.length})
            </button>

            {categories.map((cat) => {
              const count = sessions.filter((s) => s.category_name === cat).length
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat} ({count})
                </button>
              )
            })}
          </div>

          {/* View Mode Segmented Control */}
          <div className="inline-flex items-center p-1 rounded-xl bg-background border border-border shadow-xs self-start md:self-auto text-xs shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'calendar'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Bar: Search & Available Only */}
        <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search session title, topic, or studio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          <label className="flex items-center gap-2 text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={availabilityOnly}
              onChange={(e) => setAvailabilityOnly(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary accent-primary"
            />
            <span className="font-semibold text-foreground">Available slots only</span>
            <span className="text-[11px] text-muted-foreground">({filteredSessions.length} matching)</span>
          </label>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'calendar' ? (
        <ClientSessionsCalendar
          sessions={filteredSessions}
          onSelectSession={handleSelectSessionWithAuth}
        />
      ) : (
        <ClientSessionsGrid
          sessions={filteredSessions}
          viewMode={viewMode}
          onSelectSession={handleSelectSessionWithAuth}
        />
      )}

      {/* Slide-over Reservation Drawer */}
      <ClientBookingDrawer
        session={selectedSessionForBooking}
        isOpen={Boolean(selectedSessionForBooking)}
        onClose={() => setSelectedSessionForBooking(null)}
        onSuccess={() => loadSessions()}
      />
    </div>
  )
}

export default function AtelierSessionsPage() {
  return (
    <Suspense fallback={<div className="container-cv py-20 text-center text-xs uppercase tracking-widest text-muted-foreground">Loading Atelier Calendar...</div>}>
      <AtelierSessionsContent />
    </Suspense>
  )
}
