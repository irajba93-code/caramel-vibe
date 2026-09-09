'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import {
  Calendar,
  Layers,
  Plus,
  Clock,
  MapPin,
  DollarSign,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
  Search,
  Filter,
  Check,
  ChevronRight,
  MoreVertical,
  Eye,
  Sliders,
  Save,
  ShieldCheck,
  Settings,
  LayoutGrid,
  List,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminDateFilter, SESSION_DATE_PRESETS } from '@/components/admin/AdminDateFilter'
import { SortableHeader } from '@/components/admin/SortableHeader'
import { matchesDateRange, sortItems } from '@/lib/admin/filterUtils'
import { useAdminMock } from '@/context/AdminMockContext'
import { AdminCategory, AdminSession, AdminSessionType } from '@/lib/admin/mockData'
import { AdminSessionsCalendar } from '@/components/admin/AdminSessionsCalendar'

// Helper for formatting datetime-local input safely
const formatForDateTimeInput = (dateStr?: string | null) => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    const pad = (n: number) => n.toString().padStart(2, '0')
    const year = d.getFullYear()
    const month = pad(d.getMonth() + 1)
    const day = pad(d.getDate())
    const hours = pad(d.getHours())
    const minutes = pad(d.getMinutes())
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch {
    return dateStr.slice(0, 16)
  }
}

export default function AdminSessionsPage() {
  const {
    sessions,
    addSession,
    updateSession,
    deleteSession,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    sessionTypes,
    addSessionType,
    updateSessionType,
    deleteSessionType,
    bookings,
    checkInBooking,
    appSettings,
    updateAppSetting,
  } = useAdminMock()

  const [activeTab, setActiveTab] = useState<'sessions' | 'categories' | 'types' | 'availability'>('sessions')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'calendar' | 'cards'>('table')

  // Session Types Tab View State
  const [typeViewMode, setTypeViewMode] = useState<'table' | 'cards'>('table')
  const [typeSearchQuery, setTypeSearchQuery] = useState('')

  // Date Range Filter State
  const [datePreset, setDatePreset] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Column Sorting State
  const [sortField, setSortField] = useState<string>('start_time')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Modals / Drawers State
  const [sessionDrawerOpen, setSessionDrawerOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<AdminSession | null>(null)
  const [viewingSession, setViewingSession] = useState<AdminSession | null>(null)
  const [deleteConfirmSession, setDeleteConfirmSession] = useState<AdminSession | null>(null)

  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
  const [typeModalOpen, setTypeModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<AdminSessionType | null>(null)

  // Global Escape Key Listener to dismiss any active drawer/modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSessionDrawerOpen(false)
        setViewingSession(null)
        setCategoryModalOpen(false)
        setTypeModalOpen(false)
        setDeleteConfirmSession(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Studio App Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    studio_name: appSettings?.studio_name || 'Caramel Vibe Flagship Studio',
    studio_address: appSettings?.studio_address || 'Caramel Vibe Flagship Studio, Suite 402',
    studio_currency: appSettings?.studio_currency || 'CAD',
    max_booking_days_advance: appSettings?.max_booking_days_advance || 30,
    cancellation_lead_hours: appSettings?.cancellation_lead_hours || 24,
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  useEffect(() => {
    if (appSettings) {
      setSettingsForm({
        studio_name: appSettings.studio_name || 'Caramel Vibe Flagship Studio',
        studio_address: appSettings.studio_address || 'Caramel Vibe Flagship Studio, Suite 402',
        studio_currency: appSettings.studio_currency || 'CAD',
        max_booking_days_advance: appSettings.max_booking_days_advance ?? 30,
        cancellation_lead_hours: appSettings.cancellation_lead_hours ?? 24,
      })
    }
  }, [appSettings])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSettings(true)
    try {
      await updateAppSetting('studio_name', settingsForm.studio_name, 'Official studio name.')
      await updateAppSetting('studio_address', settingsForm.studio_address, 'Default atelier location address.')
      await updateAppSetting('studio_currency', settingsForm.studio_currency, 'Default operating currency.')
      await updateAppSetting('max_booking_days_advance', Number(settingsForm.max_booking_days_advance), 'Maximum number of days in advance an appointment can be reserved.')
      await updateAppSetting('cancellation_lead_hours', Number(settingsForm.cancellation_lead_hours), 'Minimum notice hours required to cancel a booking without penalty.')
    } finally {
      setIsSavingSettings(false)
    }
  }

  // Form State - Session
  const [sessionForm, setSessionForm] = useState({
    title: '',
    slug: '',
    category_name: categories[0]?.name || 'Bespoke Vintage Styling',
    session_type_id: sessionTypes[0]?.id || '',
    description: '',
    location_type: 'studio',
    location_address: appSettings?.studio_address || 'Caramel Vibe Flagship Studio, Suite 402',
    price: 350,
    currency: (appSettings?.studio_currency as string) || 'CAD',
    max_slots: 6,
    start_time: '2026-09-15T14:00',
    end_time: '2026-09-15T15:30',
    status: 'published' as AdminSession['status'],
  })

  // Form State - Category
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: 1,
    is_active: true,
  })

  // Form State - Session Type
  const [typeForm, setTypeForm] = useState({
    name: '',
    slug: '',
    category_id: categories[0]?.id || '',
    category_name: categories[0]?.name || '',
    description: '',
    capacity: '' as number | string,
    default_duration_min: 60,
    default_price: 300,
    currency: (appSettings?.studio_currency as string) || 'CAD',
    image_url: '',
    is_active: true,
  })

  // Handlers for Session Type Form
  const openCreateType = () => {
    setEditingType(null)
    setTypeForm({
      name: '',
      slug: '',
      category_id: categories[0]?.id || '',
      category_name: categories[0]?.name || 'Bespoke Vintage Styling',
      description: '',
      capacity: '',
      default_duration_min: 60,
      default_price: 300,
      currency: (appSettings?.studio_currency as string) || 'CAD',
      image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      is_active: true,
    })
    setTypeModalOpen(true)
  }

  const openEditType = (st: AdminSessionType) => {
    setEditingType(st)
    setTypeForm({
      name: st.name,
      slug: st.slug,
      category_id: st.category_id,
      category_name: st.category_name,
      description: st.description,
      capacity: st.capacity !== undefined && st.capacity !== null ? st.capacity : '',
      default_duration_min: st.default_duration_min,
      default_price: st.default_price,
      currency: st.currency,
      image_url: st.image_url,
      is_active: st.is_active,
    })
    setTypeModalOpen(true)
  }

  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!typeForm.name.trim()) return

    const slug =
      typeForm.slug.trim() ||
      typeForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const selectedCategory = categories.find((c) => c.id === typeForm.category_id)
    const category_name = selectedCategory ? selectedCategory.name : typeForm.category_name || categories[0]?.name || 'Atelier Experience'
    const parsedCapacity =
      typeForm.capacity !== '' && typeForm.capacity !== null && !isNaN(Number(typeForm.capacity))
        ? Number(typeForm.capacity)
        : null

    if (editingType) {
      await updateSessionType(editingType.id, {
        ...typeForm,
        slug,
        category_name,
        capacity: parsedCapacity,
      })
    } else {
      await addSessionType({
        ...typeForm,
        slug,
        category_name,
        capacity: parsedCapacity,
      })
    }
    setTypeModalOpen(false)
  }

  // Handlers for Session Form with Auto-Fill on Session Type Change
  const handleSessionTypeChange = (selectedTypeId: string) => {
    const selectedType = sessionTypes.find((t) => t.id === selectedTypeId)
    if (selectedType) {
      setSessionForm((prev) => ({
        ...prev,
        session_type_id: selectedType.id,
        category_name: selectedType.category_name || prev.category_name,
        title: prev.title.trim() === '' ? selectedType.name : prev.title,
        description: prev.description.trim() === '' ? selectedType.description : prev.description,
        price: selectedType.default_price || prev.price,
        currency: selectedType.currency || prev.currency,
        max_slots:
          selectedType.capacity !== undefined && selectedType.capacity !== null && selectedType.capacity > 0
            ? selectedType.capacity
            : prev.max_slots,
      }))
    } else {
      setSessionForm((prev) => ({
        ...prev,
        session_type_id: selectedTypeId,
      }))
    }
  }

  const openCreateSession = () => {
    setEditingSession(null)
    const initialType = sessionTypes[0]
    setSessionForm({
      title: initialType?.name || '',
      slug: '',
      category_name: initialType?.category_name || categories[0]?.name || 'Bespoke Vintage Styling',
      session_type_id: initialType?.id || '',
      description: initialType?.description || '',
      location_type: 'studio',
      location_address: appSettings?.studio_address || 'Caramel Vibe Flagship Studio, Suite 402',
      price: initialType?.default_price || 350,
      currency: (appSettings?.studio_currency as string) || 'CAD',
      max_slots: (initialType?.capacity && initialType.capacity > 0) ? initialType.capacity : 6,
      start_time: formatForDateTimeInput(new Date().toISOString()),
      end_time: formatForDateTimeInput(new Date(Date.now() + (initialType?.default_duration_min || 90) * 60000).toISOString()),
      status: 'published',
    })
    setSessionDrawerOpen(true)
  }

  const openCreateSessionForDate = (date: Date) => {
    setEditingSession(null)
    const initialType = sessionTypes[0]
    const pad = (n: number) => n.toString().padStart(2, '0')
    const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    setSessionForm({
      title: initialType?.name || '',
      slug: '',
      category_name: initialType?.category_name || categories[0]?.name || 'Bespoke Vintage Styling',
      session_type_id: initialType?.id || '',
      description: initialType?.description || '',
      location_type: 'studio',
      location_address: appSettings?.studio_address || 'Caramel Vibe Flagship Studio, Suite 402',
      price: initialType?.default_price || 350,
      currency: (appSettings?.studio_currency as string) || 'CAD',
      max_slots: (initialType?.capacity && initialType.capacity > 0) ? initialType.capacity : 6,
      start_time: `${dateStr}T14:00`,
      end_time: `${dateStr}T15:30`,
      status: 'published',
    })
    setSessionDrawerOpen(true)
  }

  const openEditSession = (ses: AdminSession) => {
    setEditingSession(ses)
    setSessionForm({
      title: ses.title,
      slug: ses.slug,
      category_name: ses.category_name,
      session_type_id: ses.session_type_id,
      description: ses.description,
      location_type: ses.location_type,
      location_address: ses.location_address,
      price: ses.price,
      currency: ses.currency,
      max_slots: ses.max_slots,
      start_time: formatForDateTimeInput(ses.start_time),
      end_time: formatForDateTimeInput(ses.end_time),
      status: ses.status,
    })
    setSessionDrawerOpen(true)
  }

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionForm.title.trim()) return

    const slug =
      sessionForm.slug.trim() ||
      sessionForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    if (editingSession) {
      await updateSession(editingSession.id, {
        ...sessionForm,
        slug,
        start_time: new Date(sessionForm.start_time).toISOString(),
        end_time: new Date(sessionForm.end_time).toISOString(),
      })
      if (viewingSession && viewingSession.id === editingSession.id) {
        setViewingSession({
          ...viewingSession,
          ...sessionForm,
          slug,
          start_time: new Date(sessionForm.start_time).toISOString(),
          end_time: new Date(sessionForm.end_time).toISOString(),
        })
      }
    } else {
      await addSession({
        ...sessionForm,
        slug,
        start_time: new Date(sessionForm.start_time).toISOString(),
        end_time: new Date(sessionForm.end_time).toISOString(),
        is_ongoing: false,
        cancel_reason: null,
        cancelled_at: null,
      })
    }
    setSessionDrawerOpen(false)
  }

  const handleConfirmDeleteSession = async () => {
    if (!deleteConfirmSession) return
    await deleteSession(deleteConfirmSession.id)
    if (viewingSession && viewingSession.id === deleteConfirmSession.id) {
      setViewingSession(null)
    }
    setDeleteConfirmSession(null)
  }

  // Handlers for Category Form
  const openCreateCategory = () => {
    setEditingCategory(null)
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      display_order: categories.length + 1,
      is_active: true,
    })
    setCategoryModalOpen(true)
  }

  const openEditCategory = (cat: AdminCategory) => {
    setEditingCategory(cat)
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image_url: cat.image_url,
      display_order: cat.display_order,
      is_active: cat.is_active,
    })
    setCategoryModalOpen(true)
  }

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryForm.name.trim()) return

    const slug =
      categoryForm.slug.trim() ||
      categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        ...categoryForm,
        slug,
      })
    } else {
      addCategory({
        ...categoryForm,
        slug,
      })
    }
    setCategoryModalOpen(false)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      if (['price', 'booked_slots'].includes(field)) {
        setSortDirection('desc')
      } else {
        setSortDirection('asc')
      }
    }
  }

  // Helper to compute live booked slots for any session from active bookings
  const getSessionLiveBookedSlots = (sessionId: string, fallbackBooked: number = 0) => {
    const sessionBookings = bookings.filter((b) => b.session_id === sessionId && b.status !== 'cancelled')
    if (sessionBookings.length > 0) {
      return sessionBookings.reduce((sum, b) => sum + (Number(b.slots_booked) || 1), 0)
    }
    return fallbackBooked || 0
  }

  // Filtered & Sorted Sessions with Live Capacity Aggregation
  const processedSessions = useMemo(() => {
    const enriched = sessions.map((ses) => {
      const liveBooked = getSessionLiveBookedSlots(ses.id, ses.booked_slots)
      const isFull = liveBooked >= ses.max_slots
      return {
        ...ses,
        booked_slots: liveBooked,
        status: (isFull && ses.status === 'published' ? 'full' : ses.status) as AdminSession['status'],
      }
    })

    const filtered = enriched.filter((ses) => {
      const matchesStatus = statusFilter === 'all' || ses.status === statusFilter
      const matchesSearch =
        ses.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ses.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ses.description && ses.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ses.location_address.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDate = matchesDateRange(ses.start_time, datePreset, startDate, endDate)
      return matchesStatus && matchesSearch && matchesDate
    })

    return sortItems<AdminSession>(filtered, sortField, sortDirection)
  }, [sessions, bookings, statusFilter, searchQuery, datePreset, startDate, endDate, sortField, sortDirection])

  // Performance KPI Metrics for Sessions Overview
  const sessionKpis = useMemo(() => {
    const totalCount = sessions.length
    const enriched = sessions.map((s) => {
      const liveBooked = getSessionLiveBookedSlots(s.id, s.booked_slots)
      return {
        ...s,
        booked_slots: liveBooked,
        isFull: liveBooked >= s.max_slots,
      }
    })
    const publishedCount = enriched.filter((s) => s.status === 'published' || s.isFull).length
    const fullCount = enriched.filter((s) => s.isFull || s.status === 'full').length
    const totalMaxSlots = enriched.reduce((sum, s) => sum + (Number(s.max_slots) || 0), 0)
    const totalBookedSlots = enriched.reduce((sum, s) => sum + (Number(s.booked_slots) || 0), 0)
    const fillRate = totalMaxSlots > 0 ? Math.round((totalBookedSlots / totalMaxSlots) * 100) : 0
    const totalGrossVolume = enriched.reduce((sum, s) => sum + (Number(s.price) * (Number(s.booked_slots) || 0)), 0)

    return {
      totalCount,
      publishedCount,
      fullCount,
      totalMaxSlots,
      totalBookedSlots,
      fillRate,
      totalGrossVolume,
    }
  }, [sessions, bookings])

  const handleResetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setDatePreset('all')
    setStartDate('')
    setEndDate('')
  }

  // Dynamic Contextual Button based on active tab
  const getContextualAction = () => {
    switch (activeTab) {
      case 'sessions':
        return { label: 'Schedule Session', onClick: openCreateSession, icon: Plus }
      case 'categories':
        return { label: 'New Category', onClick: openCreateCategory, icon: Plus }
      case 'types':
        return { label: 'New Template', onClick: openCreateType, icon: Plus }
      default:
        return undefined
    }
  }

  // Linked attendees for viewingSession
  const sessionAttendees = useMemo(() => {
    if (!viewingSession) return []
    return bookings.filter((b) => b.session_id === viewingSession.id && b.status !== 'cancelled')
  }, [viewingSession, bookings])

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background">
      {/* Admin Header */}
      <AdminHeader
        breadcrumbs={[
          { label: 'Admin Console', href: '/admin/dashboard' },
          { label: 'Sessions & Catalog', href: '/admin/sessions' },
          {
            label:
              activeTab === 'sessions'
                ? 'Master Sessions'
                : activeTab === 'categories'
                ? 'Service Categories'
                : activeTab === 'types'
                ? 'Session Templates'
                : 'Studio Availability',
          },
        ]}
        title="Session & Catalog Orchestration"
        subtitle="Manage master appointments, service category taxonomies, and studio operating hours."
        actionButton={getContextualAction()}
      />

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              activeTab === 'sessions'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Master Sessions ({sessions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('types')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              activeTab === 'types'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Templates ({sessionTypes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('availability')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              activeTab === 'availability'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Studio Availability</span>
          </button>
        </div>

        {/* TAB 1: SESSIONS MASTER */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            {/* Executive Snapshot KPI Row for Sessions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Catalog Sessions</span>
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {sessionKpis.totalCount}
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <span className="text-[#3e6b48] font-semibold">{sessionKpis.publishedCount} active</span>
                  <span>• {sessionKpis.fullCount} at full capacity</span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Occupancy Fill Rate</span>
                  <div className="p-2 rounded-xl bg-accent/15 text-accent">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {sessionKpis.fillRate}%
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {sessionKpis.totalBookedSlots} / {sessionKpis.totalMaxSlots} guest slots booked
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Workshop Volume</span>
                  <div className="p-2 rounded-xl bg-[#3e6b48]/10 text-[#3e6b48]">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  ${sessionKpis.totalGrossVolume.toLocaleString()} CAD
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Booked appointment settlement value
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Service Lines</span>
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {categories.length}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Across vintage styling &amp; restorations
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter sessions by title, category, location..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                  />
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto overflow-x-auto w-full md:w-auto">
                  {['all', 'published', 'full', 'draft', 'completed', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                        statusFilter === status
                          ? 'bg-primary/10 text-primary border border-primary/30 font-bold'
                          : 'bg-background text-muted-foreground border border-border hover:text-foreground'
                      }`}
                    >
                      {status}
                    </button>
                  ))}

                  {/* View Mode Switcher (List / Calendar / Cards) */}
                  <div className="inline-flex items-center p-0.5 rounded-lg bg-background border border-border shadow-xs ml-auto md:ml-2">
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      title="List / Table View"
                      className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        viewMode === 'table' ? 'bg-primary text-primary-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">List</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('calendar')}
                      title="Interactive Calendar View"
                      className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        viewMode === 'calendar' ? 'bg-primary text-primary-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Calendar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('cards')}
                      title="Grid Cards View"
                      className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        viewMode === 'cards' ? 'bg-primary text-primary-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Cards</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Date Range Filter Bar */}
              <div className="pt-3 border-t border-border/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <AdminDateFilter
                  preset={datePreset}
                  onPresetChange={setDatePreset}
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  onReset={() => {
                    setDatePreset('all')
                    setStartDate('')
                    setEndDate('')
                  }}
                  presetOptions={SESSION_DATE_PRESETS}
                  label="Session Schedule"
                />

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-[11px]">
                    Showing <strong className="text-foreground">{processedSessions.length}</strong> of{' '}
                    <strong className="text-foreground">{sessions.length}</strong> sessions
                  </span>
                  {(searchQuery || statusFilter !== 'all' || datePreset !== 'all' || startDate || endDate) && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            </div>            {/* Sessions Table View */}
            {viewMode === 'table' ? (
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-background/70 text-muted-foreground uppercase font-bold tracking-wider text-[10px]">
                        <SortableHeader
                          field="title"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        >
                          Session &amp; Category
                        </SortableHeader>

                        <th className="py-3.5 px-4 font-bold text-left min-w-[200px]">Description</th>

                        <SortableHeader
                          field="start_time"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        >
                          Date &amp; Schedule
                        </SortableHeader>

                        <SortableHeader
                          field="price"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        >
                          Price
                        </SortableHeader>

                        <SortableHeader
                          field="booked_slots"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        >
                          Capacity
                        </SortableHeader>

                        <SortableHeader
                          field="status"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        >
                          Status
                        </SortableHeader>

                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {processedSessions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-muted-foreground">
                            No atelier sessions found matching criteria.
                          </td>
                        </tr>
                      ) : (
                        processedSessions.map((ses: AdminSession) => {
                          const percent = ses.max_slots > 0 ? Math.round((ses.booked_slots / ses.max_slots) * 100) : 0
                          return (
                            <tr
                              key={ses.id}
                              onClick={() => setViewingSession(ses)}
                              className="hover:bg-muted/30 transition-colors cursor-pointer group"
                            >
                              <td className="py-4 px-4 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                                  {ses.category_name}
                                </span>
                                <div className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                                  {ses.title}
                                </div>
                                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-primary shrink-0" />
                                  <span className="truncate max-w-[200px]">{ses.location_address}</span>
                                </div>
                              </td>

                              <td className="py-4 px-4 max-w-[240px]">
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed" title={ses.description || ''}>
                                  {ses.description || <span className="italic text-muted-foreground/50">No description provided</span>}
                                </p>
                              </td>

                              <td className="py-4 px-4 space-y-0.5 whitespace-nowrap">
                                <div className="font-bold text-foreground">
                                  {new Date(ses.start_time).toLocaleDateString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </div>
                                <div className="text-muted-foreground text-[11px] flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-primary" />
                                  <span>
                                    {new Date(ses.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                                    {new Date(ses.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </td>

                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="font-bold text-foreground text-sm">
                                  ${ses.price}
                                </div>
                                <div className="text-[10px] text-muted-foreground">{ses.currency} / guest</div>
                              </td>

                              <td className="py-4 px-4 space-y-1 w-36 whitespace-nowrap">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-foreground">
                                    {ses.booked_slots} / {ses.max_slots}
                                  </span>
                                  <span className="text-muted-foreground">{percent}%</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-500 ${
                                      percent >= 100 ? 'bg-destructive' : percent >= 80 ? 'bg-accent' : 'bg-primary'
                                    }`}
                                    style={{ width: `${Math.min(100, percent)}%` }}
                                  />
                                </div>
                              </td>

                              <td className="py-4 px-4 whitespace-nowrap">
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                                    ses.status === 'published'
                                      ? 'bg-[#3e6b48]/10 text-[#3e6b48] border-[#3e6b48]/30'
                                      : ses.status === 'full'
                                      ? 'bg-destructive/10 text-destructive border-destructive/30'
                                      : ses.status === 'draft'
                                      ? 'bg-muted text-muted-foreground border-border'
                                      : 'bg-accent/10 text-accent border-accent/30'
                                  }`}
                                >
                                  {ses.status}
                                </span>
                              </td>

                              <td className="py-4 px-4 text-right space-x-1 shrink-0 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setViewingSession(ses)
                                  }}
                                  title="View Session Details & Attendees"
                                  className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs active:scale-95"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openEditSession(ses)
                                  }}
                                  title="Edit Session"
                                  className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-primary transition-all cursor-pointer shadow-xs active:scale-95"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setDeleteConfirmSession(ses)
                                  }}
                                  title="Delete Session"
                                  className="p-1.5 rounded-lg border border-border bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all cursor-pointer shadow-xs active:scale-95"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : viewMode === 'calendar' ? (
              /* Interactive Luxury Calendar View */
              <AdminSessionsCalendar
                sessions={processedSessions}
                onSelectSession={(ses) => setViewingSession(ses)}
                onEditSession={(ses) => openEditSession(ses)}
                onCreateSessionForDate={openCreateSessionForDate}
              />
            ) : (
              /* Sessions Grid Cards View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {processedSessions.length === 0 ? (
                  <div className="col-span-full p-12 text-center rounded-2xl border border-dashed border-border bg-card text-muted-foreground">
                    No sessions match criteria.
                  </div>
                ) : (
                  processedSessions.map((ses) => {
                    const percent = ses.max_slots > 0 ? Math.round((ses.booked_slots / ses.max_slots) * 100) : 0
                    return (
                      <div
                        key={ses.id}
                        onClick={() => setViewingSession(ses)}
                        className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/40 hover:-translate-y-0.5 transition-all space-y-4 flex flex-col justify-between cursor-pointer group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/15 px-2.5 py-0.5 rounded-full border border-accent/20">
                              {ses.category_name}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                ses.status === 'full'
                                  ? 'bg-destructive/10 text-destructive border-destructive/30'
                                  : ses.status === 'published'
                                  ? 'bg-[#3e6b48]/10 text-[#3e6b48] border-[#3e6b48]/30'
                                  : 'bg-muted text-muted-foreground border-border'
                              }`}
                            >
                              {ses.status}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors">
                              {ses.title}
                            </h4>
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="truncate">{ses.location_address}</span>
                            </div>
                            {ses.description && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                                {ses.description}
                              </p>
                            )}
                          </div>

                          <div className="p-3 rounded-xl bg-background/60 border border-border/60 space-y-2 text-xs">
                            <div className="flex items-center justify-between text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                <span>
                                  {new Date(ses.start_time).toLocaleDateString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </span>
                              <span className="font-bold text-foreground">
                                ${ses.price} {ses.currency}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-muted-foreground">Occupancy</span>
                                <span className="font-bold text-foreground">
                                  {ses.booked_slots} / {ses.max_slots} ({percent}%)
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full ${
                                    percent >= 100 ? 'bg-destructive' : percent >= 80 ? 'bg-accent' : 'bg-primary'
                                  }`}
                                  style={{ width: `${Math.min(100, percent)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-3 border-t border-border/70 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setViewingSession(ses)
                            }}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Details</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditSession(ses)
                              }}
                              title="Edit Session"
                              className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-primary transition-all cursor-pointer shadow-xs active:scale-95"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteConfirmSession(ses)
                              }}
                              title="Delete Session"
                              className="p-2 rounded-xl border border-border bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all cursor-pointer shadow-xs active:scale-95"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SERVICE CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">
                  Atelier Service Lines &amp; Categories
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Organize and curate bespoke styling, leather restoration, and private viewings
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateCategory}
                className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Category</span>
              </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => openEditCategory(cat)}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col group hover:border-primary/40 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <div className="h-40 relative bg-muted overflow-hidden">
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md border ${
                          cat.is_active
                            ? 'bg-[#3e6b48]/80 text-[#fffaf3] border-[#3e6b48]'
                            : 'bg-black/60 text-muted-foreground border-white/20'
                        }`}
                      >
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 text-[11px] font-bold text-white/90">
                      Order: #{cat.display_order} • {cat.session_count} active sessions
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h4 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {cat.name}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        slug: /{cat.slug}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditCategory(cat)
                          }}
                          title="Edit Category"
                          className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteCategory(cat.id)
                          }}
                          title="Delete Category"
                          className="p-2 rounded-lg border border-border bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SESSION TYPES / TEMPLATES */}
        {activeTab === 'types' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">
                  Reusable Session Templates
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Standard durations, base prices, descriptions, and default capacities used to schedule appointments
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={typeSearchQuery}
                    onChange={(e) => setTypeSearchQuery(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                  />
                </div>

                <div className="inline-flex items-center p-0.5 rounded-lg bg-background border border-border shadow-xs">
                  <button
                    type="button"
                    onClick={() => setTypeViewMode('table')}
                    title="Table View"
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      typeViewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeViewMode('cards')}
                    title="Grid Cards View"
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      typeViewMode === 'cards' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={openCreateType}
                  className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Template</span>
                </button>
              </div>
            </div>

            {typeViewMode === 'table' ? (
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-background/70 text-muted-foreground uppercase font-bold tracking-wider text-[10px]">
                        <th className="py-3.5 px-4 font-bold">Template Title</th>
                        <th className="py-3.5 px-4 font-bold min-w-[220px]">Description</th>
                        <th className="py-3.5 px-4 font-bold">Category</th>
                        <th className="py-3.5 px-4 font-bold">Duration</th>
                        <th className="py-3.5 px-4 font-bold">Default Price</th>
                        <th className="py-3.5 px-4 font-bold">Capacity</th>
                        <th className="py-3.5 px-4 font-bold">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {sessionTypes.filter((st) =>
                        st.name.toLowerCase().includes(typeSearchQuery.toLowerCase()) ||
                        st.category_name.toLowerCase().includes(typeSearchQuery.toLowerCase()) ||
                        (st.description && st.description.toLowerCase().includes(typeSearchQuery.toLowerCase()))
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-muted-foreground">
                            No session templates found matching your search.
                          </td>
                        </tr>
                      ) : (
                        sessionTypes
                          .filter((st) =>
                            st.name.toLowerCase().includes(typeSearchQuery.toLowerCase()) ||
                            st.category_name.toLowerCase().includes(typeSearchQuery.toLowerCase()) ||
                            (st.description && st.description.toLowerCase().includes(typeSearchQuery.toLowerCase()))
                          )
                          .map((st) => (
                            <tr
                              key={st.id}
                              onClick={() => openEditType(st)}
                              className="hover:bg-muted/30 transition-colors cursor-pointer group"
                            >
                              <td className="py-4 px-4 space-y-0.5">
                                <div className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                                  {st.name}
                                </div>
                                <div className="font-mono text-[10px] text-muted-foreground">
                                  /{st.slug}
                                </div>
                              </td>

                              <td className="py-4 px-4 max-w-[260px]">
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed" title={st.description || ''}>
                                  {st.description || <span className="italic text-muted-foreground/50">No description provided</span>}
                                </p>
                              </td>

                              <td className="py-4 px-4 whitespace-nowrap">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                                  {st.category_name}
                                </span>
                              </td>

                              <td className="py-4 px-4 whitespace-nowrap font-medium text-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-primary" />
                                  <span>{st.default_duration_min} mins</span>
                                </div>
                              </td>

                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="font-bold text-foreground text-sm">
                                  ${st.default_price}
                                </div>
                                <div className="text-[10px] text-muted-foreground">{st.currency} base</div>
                              </td>

                              <td className="py-4 px-4 whitespace-nowrap">
                                {st.capacity && st.capacity > 0 ? (
                                  <span className="inline-flex items-center gap-1 font-bold text-foreground bg-primary/10 text-primary px-2.5 py-1 rounded-md border border-primary/20 text-xs">
                                    <Users className="w-3 h-3" />
                                    <span>{st.capacity} guest{st.capacity === 1 ? '' : 's'}</span>
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-xs italic">—</span>
                                )}
                              </td>

                              <td className="py-4 px-4 whitespace-nowrap">
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                    st.is_active
                                      ? 'bg-[#3e6b48]/10 text-[#3e6b48] border-[#3e6b48]/30'
                                      : 'bg-muted text-muted-foreground border-border'
                                  }`}
                                >
                                  {st.is_active ? 'Active' : 'Archived'}
                                </span>
                              </td>

                              <td className="py-4 px-4 text-right space-x-1 shrink-0 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openEditType(st)
                                  }}
                                  title="Edit Template"
                                  className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-primary transition-all cursor-pointer shadow-xs active:scale-95"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteSessionType(st.id)
                                  }}
                                  title="Delete Template"
                                  className="p-1.5 rounded-lg border border-border bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all cursor-pointer shadow-xs active:scale-95"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Grid Cards View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sessionTypes.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => openEditType(st)}
                    className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/40 hover:-translate-y-0.5 transition-all space-y-4 flex flex-col justify-between cursor-pointer group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                          {st.category_name}
                        </span>
                        <span className="font-bold text-foreground text-sm">
                          ${st.default_price} {st.currency}
                        </span>
                      </div>

                      <div className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                        {st.name}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {st.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>{st.default_duration_min} mins</span>
                        {st.capacity && st.capacity > 0 && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-primary">{st.capacity} guests</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditType(st)
                          }}
                          title="Edit Template"
                          className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSessionType(st.id)
                          }}
                          title="Delete Template"
                          className="p-1.5 rounded-lg border border-border bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AVAILABILITY RULES & STUDIO APP SETTINGS */}
        {activeTab === 'availability' && (
          <div className="space-y-6">
            {/* Live Studio Parameters from app_settings */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                    <Settings className="w-4 h-4 text-primary" />
                    <span>Live Studio Configuration (`app_settings`)</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configured parameters stored directly in Supabase and enforced across all booking workflows
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary self-start sm:self-auto">
                  Live Supabase Synced
                </span>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Studio Brand Name
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.studio_name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, studio_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                    />
                    <p className="text-[10px] text-muted-foreground">Used on receipts and notifications</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Default Atelier Location Address
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.studio_address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, studio_address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                    />
                    <p className="text-[10px] text-muted-foreground">Default physical venue address</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Operating Currency
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.studio_currency}
                      onChange={(e) => setSettingsForm({ ...settingsForm, studio_currency: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs uppercase"
                    />
                    <p className="text-[10px] text-muted-foreground">ISO Currency Code (e.g. CAD, USD, EUR)</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Max Advance Booking Horizon
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={365}
                        required
                        value={settingsForm.max_booking_days_advance}
                        onChange={(e) => setSettingsForm({ ...settingsForm, max_booking_days_advance: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs text-muted-foreground pointer-events-none">
                        Days
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Window clients can reserve slots in advance</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Cancellation Lead Notice
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={168}
                        required
                        value={settingsForm.cancellation_lead_hours}
                        onChange={(e) => setSettingsForm({ ...settingsForm, cancellation_lead_hours: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs text-muted-foreground pointer-events-none">
                        Hours
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Minimum notice required to cancel without penalty</p>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-border">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingSettings ? 'Saving Settings...' : 'Save Live Configuration'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Studio Operating Windows */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">
                  Studio Operating Windows &amp; Recurrence Rules
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Default weekly appointment hours and salon opening schedules
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { day: 'Tuesday', hours: '10:00 AM – 6:00 PM', type: 'Weekly Recurring', active: true },
                  { day: 'Wednesday', hours: '10:00 AM – 6:00 PM', type: 'Weekly Recurring', active: true },
                  { day: 'Thursday', hours: '10:00 AM – 8:00 PM', type: 'VIP Evening Salon', active: true },
                  { day: 'Friday', hours: '10:00 AM – 8:00 PM', type: 'VIP Evening Salon', active: true },
                  { day: 'Saturday', hours: '11:00 AM – 5:00 PM', type: 'Weekend Masterclasses', active: true },
                  { day: 'Sun – Mon', hours: 'Closed', type: 'Atelier Dark Days', active: false },
                ].map((rule, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border bg-background/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-sm">{rule.day}</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          rule.active ? 'bg-[#3e6b48]/10 text-[#3e6b48]' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {rule.active ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-primary">{rule.hours}</div>
                    <div className="text-[10px] text-muted-foreground">{rule.type}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VIEW SESSION DETAILS DRAWER */}
      {viewingSession && (
        <div
          onClick={() => setViewingSession(null)}
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-card border-l border-border h-full overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl flex flex-col justify-between cursor-default"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
                    {viewingSession.category_name}
                  </span>
                  <h3 className="font-display font-bold text-xl text-foreground mt-1.5">
                    {viewingSession.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingSession(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status and Key Details & Live Occupancy Gauge */}
              {(() => {
                const viewingLiveBooked = getSessionLiveBookedSlots(viewingSession.id, viewingSession.booked_slots)
                const isViewingFull = viewingLiveBooked >= viewingSession.max_slots
                const viewingStatus = isViewingFull && viewingSession.status === 'published' ? 'full' : viewingSession.status
                const percent = viewingSession.max_slots > 0 ? Math.round((viewingLiveBooked / viewingSession.max_slots) * 100) : 0

                return (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-background/60 border border-border space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Publication Status
                        </span>
                        <div>
                          <span
                            className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              viewingStatus === 'full'
                                ? 'bg-destructive/10 text-destructive border-destructive/30'
                                : viewingStatus === 'published'
                                ? 'bg-[#3e6b48]/10 text-[#3e6b48] border-[#3e6b48]/30'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}
                          >
                            {viewingStatus}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-background/60 border border-border space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Slot Rate
                        </span>
                        <div className="font-bold text-foreground text-sm">
                          ${viewingSession.price} {viewingSession.currency} / guest
                        </div>
                      </div>
                    </div>

                    {/* Schedule and Location */}
                    <div className="p-4 rounded-xl bg-background/60 border border-border space-y-2 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span className="font-semibold text-foreground">
                            {new Date(viewingSession.start_time).toLocaleDateString(undefined, {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </span>
                        <span>
                          {new Date(viewingSession.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                          {new Date(viewingSession.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-muted-foreground pt-1 border-t border-border/60">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{viewingSession.location_address}</span>
                      </div>
                    </div>

                    {/* Live Occupancy Gauge */}
                    <div className="p-4 rounded-xl bg-background/60 border border-border space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">Attendee Capacity</span>
                        <span className="font-bold text-primary">
                          {viewingLiveBooked} / {viewingSession.max_slots} slots filled ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{
                            width: `${Math.min(100, percent)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </>
                )
              })()}

              {/* Description */}
              {viewingSession.description && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Artisan Agenda &amp; Overview
                  </h4>
                  <p className="text-xs text-foreground leading-relaxed p-3.5 rounded-xl bg-background/60 border border-border">
                    {viewingSession.description}
                  </p>
                </div>
              )}

              {/* Booked Attendees List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span>Booked Attendees ({sessionAttendees.length})</span>
                  </h4>
                </div>

                {sessionAttendees.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-border bg-background/30 text-center text-xs text-muted-foreground">
                    No reservations booked yet for this session slot.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sessionAttendees.map((att) => (
                      <div
                        key={att.id}
                        className="p-3 rounded-xl border border-border bg-background/60 flex items-center justify-between text-xs gap-3"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-bold text-foreground truncate">{att.client_name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{att.client_email}</div>
                          <div className="text-[10px] text-primary font-mono">{att.booking_number} • {att.slots_booked} seat(s)</div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {att.check_in_time ? (
                            <span className="text-[10px] font-bold text-[#3e6b48] bg-[#3e6b48]/10 px-2 py-1 rounded-md border border-[#3e6b48]/20 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Checked In</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => checkInBooking(att.id)}
                              className="px-2.5 py-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
                            >
                              Check In
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmSession(viewingSession)
                }}
                className="px-3.5 py-2 rounded-xl border border-destructive/40 hover:bg-destructive/10 text-destructive text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Session</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  openEditSession(viewingSession)
                }}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SESSION DRAWER */}
      {sessionDrawerOpen && (
        <div
          onClick={() => setSessionDrawerOpen(false)}
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-card border-l border-border h-full overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl flex flex-col justify-between cursor-default"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <h3 className="font-display font-bold text-xl text-foreground">
                    {editingSession ? 'Edit Atelier Session' : 'Schedule New Atelier Session'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure dates, slot limits, pricing, and category mapping
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSessionDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSession} className="mt-6 space-y-4">
                {/* Session Type Template Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                    <span>Session Template</span>
                    <span className="text-[10px] font-normal text-muted-foreground">Auto-populates capacity &amp; details</span>
                  </label>
                  <select
                    value={sessionForm.session_type_id}
                    onChange={(e) => handleSessionTypeChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                  >
                    <option value="">Custom / No Template</option>
                    {sessionTypes.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.category_name}{st.capacity ? ` • ${st.capacity} guests` : ''})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Session Title
                  </label>
                  <input
                    type="text"
                    required
                    value={sessionForm.title}
                    onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                    placeholder="e.g. Hermès Kelly Leather Workshop"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Service Category
                  </label>
                  <select
                    value={sessionForm.category_name}
                    onChange={(e) => setSessionForm({ ...sessionForm, category_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description & Agenda */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Description &amp; Agenda
                  </label>
                  <textarea
                    rows={3}
                    value={sessionForm.description}
                    onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                    placeholder="Details about master artisan techniques, materials provided, agenda overview..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                  />
                </div>

                {/* Date & Times */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={sessionForm.start_time}
                      onChange={(e) => setSessionForm({ ...sessionForm, start_time: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={sessionForm.end_time}
                      onChange={(e) => setSessionForm({ ...sessionForm, end_time: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                    />
                  </div>
                </div>

                {/* Pricing & Slots (Capacity) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Price ($ {sessionForm.currency})
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={sessionForm.price}
                      onChange={(e) => setSessionForm({ ...sessionForm, price: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                      <span>Max Guest Capacity</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={sessionForm.max_slots}
                      onChange={(e) => setSessionForm({ ...sessionForm, max_slots: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Studio Location Address
                  </label>
                  <input
                    type="text"
                    required
                    value={sessionForm.location_address}
                    onChange={(e) => setSessionForm({ ...sessionForm, location_address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Publication Status
                  </label>
                  <select
                    value={sessionForm.status}
                    onChange={(e) =>
                      setSessionForm({ ...sessionForm, status: e.target.value as AdminSession['status'] })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                  >
                    <option value="published">Published (Live Catalog)</option>
                    <option value="draft">Draft (Private)</option>
                    <option value="full">Full (Capacity Reached)</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSessionDrawerOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground cursor-pointer shadow-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    {editingSession ? 'Save Changes' : 'Publish Session'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE SESSION CONFIRMATION MODAL */}
      {deleteConfirmSession && (
        <div
          onClick={() => setDeleteConfirmSession(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 cursor-default"
          >
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">
                  Delete Atelier Session?
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This action removes the session from the public catalog.
                </p>
              </div>
            </div>

            {(() => {
              const deleteLiveBooked = getSessionLiveBookedSlots(deleteConfirmSession.id, deleteConfirmSession.booked_slots)
              return (
                <>
                  <div className="p-4 rounded-xl bg-background/60 border border-border space-y-2 text-xs">
                    <div className="font-bold text-foreground">{deleteConfirmSession.title}</div>
                    <div className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>
                        {new Date(deleteConfirmSession.start_time).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        • {new Date(deleteConfirmSession.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
                      <span>Current Bookings:</span>
                      <span className="font-bold text-foreground">
                        {deleteLiveBooked} / {deleteConfirmSession.max_slots} slots
                      </span>
                    </div>
                  </div>

                  {deleteLiveBooked > 0 && (
                    <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="leading-snug">
                        <strong>Warning:</strong> This session has <strong>{deleteLiveBooked} booked attendee(s)</strong>. Deleting it will remove the appointment from active schedules.
                      </p>
                    </div>
                  )}
                </>
              )
            })()}

            <div className="pt-2 border-t border-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmSession(null)}
                className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSession}
                className="px-5 py-2 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {categoryModalOpen && (
        <div
          onClick={() => setCategoryModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display font-bold text-lg text-foreground">
                {editingCategory ? 'Edit Service Category' : 'Create Service Category'}
              </h3>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. VIP Private Viewings"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Overview of this service tier..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Banner Image URL
                </label>
                <input
                  type="url"
                  required
                  value={categoryForm.image_url}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={categoryForm.display_order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, display_order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="cat_active"
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                    className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                  />
                  <label htmlFor="cat_active" className="text-xs font-bold text-foreground cursor-pointer">
                    Active in Storefront
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SESSION TYPE (TEMPLATE) MODAL */}
      {typeModalOpen && (
        <div
          onClick={() => setTypeModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 cursor-default max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">
                  {editingType ? 'Edit Session Template' : 'Create Session Template'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure default duration, base pricing, description, and guest capacity
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTypeModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveType} className="space-y-4">
              {/* Template Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  value={typeForm.name}
                  onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                  placeholder="e.g. Rare Vault Champagne & Archival Soirée"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Service Category
                </label>
                <select
                  value={typeForm.category_id}
                  onChange={(e) => {
                    const selectedCat = categories.find((c) => c.id === e.target.value)
                    setTypeForm({
                      ...typeForm,
                      category_id: e.target.value,
                      category_name: selectedCat ? selectedCat.name : typeForm.category_name,
                    })
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={typeForm.description}
                  onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                  placeholder="Outline the artisan experience, materials covered, or consultation format..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                />
              </div>

              {/* Capacity, Duration, Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Capacity (Guests)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={typeForm.capacity}
                    onChange={(e) =>
                      setTypeForm({
                        ...typeForm,
                        capacity: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    placeholder="e.g. 6"
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs font-semibold"
                  />
                  <p className="text-[10px] text-muted-foreground">Default guest capacity</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Duration (Mins)
                  </label>
                  <input
                    type="number"
                    required
                    min={15}
                    max={480}
                    value={typeForm.default_duration_min}
                    onChange={(e) => setTypeForm({ ...typeForm, default_duration_min: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">Default appointment time</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Base Price ({typeForm.currency})
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={typeForm.default_price}
                    onChange={(e) => setTypeForm({ ...typeForm, default_price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">Default rate per seat</p>
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Image / Asset URL
                </label>
                <input
                  type="url"
                  value={typeForm.image_url}
                  onChange={(e) => setTypeForm({ ...typeForm, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="type_active"
                  checked={typeForm.is_active}
                  onChange={(e) => setTypeForm({ ...typeForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                />
                <label htmlFor="type_active" className="text-xs font-bold text-foreground cursor-pointer">
                  Active in Catalog &amp; Scheduler
                </label>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTypeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  {editingType ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
