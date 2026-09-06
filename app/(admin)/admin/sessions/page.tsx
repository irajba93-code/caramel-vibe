'use client'

import React, { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { useAdminMock } from '@/context/AdminMockContext'
import { AdminCategory, AdminSession, AdminSessionType } from '@/lib/admin/mockData'

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
    appSettings,
    updateAppSetting,
  } = useAdminMock()

  const [activeTab, setActiveTab] = useState<'sessions' | 'categories' | 'types' | 'availability'>('sessions')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

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

  // Modals / Drawers State
  const [sessionDrawerOpen, setSessionDrawerOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<AdminSession | null>(null)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
  const [typeModalOpen, setTypeModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<AdminSessionType | null>(null)

  // Form State - Session
  const [sessionForm, setSessionForm] = useState({
    title: '',
    slug: '',
    category_name: categories[0]?.name || 'Bespoke Vintage Styling',
    session_type_id: sessionTypes[0]?.id || '',
    description: '',
    location_type: 'studio',
    location_address: 'Caramel Vibe Flagship Studio, Suite 402',
    price: 350,
    currency: 'CAD',
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
    default_duration_min: 60,
    default_price: 300,
    currency: 'CAD',
    image_url: '',
    is_active: true,
  })

  // Handlers for Session Form
  const openCreateSession = () => {
    setEditingSession(null)
    setSessionForm({
      title: '',
      slug: '',
      category_name: categories[0]?.name || 'Bespoke Vintage Styling',
      session_type_id: sessionTypes[0]?.id || '',
      description: '',
      location_type: 'studio',
      location_address: 'Caramel Vibe Flagship Studio, Suite 402',
      price: 350,
      currency: 'CAD',
      max_slots: 6,
      start_time: '2026-09-15T14:00',
      end_time: '2026-09-15T15:30',
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
      start_time: ses.start_time.slice(0, 16),
      end_time: ses.end_time.slice(0, 16),
      status: ses.status,
    })
    setSessionDrawerOpen(true)
  }

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionForm.title.trim()) return

    const slug = sessionForm.slug.trim() || sessionForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    if (editingSession) {
      updateSession(editingSession.id, {
        ...sessionForm,
        slug,
        start_time: new Date(sessionForm.start_time).toISOString(),
        end_time: new Date(sessionForm.end_time).toISOString(),
      })
    } else {
      addSession({
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

    const slug = categoryForm.slug.trim() || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

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

  // Filtered Sessions
  const filteredSessions = sessions.filter((ses) => {
    const matchesStatus = statusFilter === 'all' || ses.status === statusFilter
    const matchesSearch =
      ses.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ses.category_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Dynamic Contextual Button based on active tab
  const getContextualAction = () => {
    switch (activeTab) {
      case 'sessions':
        return { label: 'Schedule Session', onClick: openCreateSession, icon: Plus }
      case 'categories':
        return { label: 'New Category', onClick: openCreateCategory, icon: Plus }
      case 'types':
        return { label: 'New Template', onClick: () => setTypeModalOpen(true), icon: Plus }
      default:
        return undefined
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
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
      <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
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
            {/* Filter Bar */}
            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter sessions by title or category..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
                {['all', 'published', 'full', 'draft', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                      statusFilter === status
                        ? 'bg-primary/10 text-primary border border-primary/30'
                        : 'bg-background text-muted-foreground border border-border hover:text-foreground'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Sessions Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-background/70 text-muted-foreground uppercase font-bold tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">Session &amp; Category</th>
                      <th className="py-3.5 px-4">Date &amp; Schedule</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Capacity</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredSessions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                          No atelier sessions found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredSessions.map((ses) => {
                        const percent = Math.round((ses.booked_slots / ses.max_slots) * 100)
                        return (
                          <tr key={ses.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-4 px-4 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                                {ses.category_name}
                              </span>
                              <div className="font-bold text-foreground text-sm">{ses.title}</div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-primary shrink-0" />
                                <span>{ses.location_address}</span>
                              </div>
                            </td>

                            <td className="py-4 px-4 space-y-0.5">
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

                            <td className="py-4 px-4">
                              <div className="font-bold text-foreground text-sm">
                                ${ses.price}
                              </div>
                              <div className="text-[10px] text-muted-foreground">{ses.currency} / guest</div>
                            </td>

                            <td className="py-4 px-4 space-y-1 w-36">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-foreground">
                                  {ses.booked_slots} / {ses.max_slots}
                                </span>
                                <span className="text-muted-foreground">{percent}%</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full ${percent >= 100 ? 'bg-destructive' : 'bg-primary'}`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </td>

                            <td className="py-4 px-4">
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

                            <td className="py-4 px-4 text-right space-x-1">
                              <button
                                type="button"
                                onClick={() => openEditSession(ses)}
                                title="Edit Session"
                                className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteSession(ses.id)}
                                title="Delete Session"
                                className="p-1.5 rounded-lg border border-border bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
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
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col group hover:border-primary/40 hover:-translate-y-0.5 transition-all"
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
                      <h4 className="font-display font-bold text-base text-foreground">
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
                          onClick={() => openEditCategory(cat)}
                          title="Edit Category"
                          className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCategory(cat.id)}
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
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">
                  Reusable Session Templates
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Standard durations, base prices, and descriptions used to quickly schedule calendar sessions
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sessionTypes.map((st) => (
                  <div
                    key={st.id}
                    className="p-4 rounded-xl border border-border bg-background/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                        {st.category_name}
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        ${st.default_price} {st.currency}
                      </span>
                    </div>

                    <div className="font-bold text-foreground text-sm">{st.name}</div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {st.description}
                    </p>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Duration: {st.default_duration_min} mins</span>
                      <span className="text-[#3e6b48] font-semibold">Active Template</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 uppercase"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
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

      {/* CREATE / EDIT SESSION DRAWER */}
      {sessionDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-card border-l border-border h-full overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl flex flex-col justify-between">
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
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
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                {/* Pricing & Slots */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Price ($ CAD)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={sessionForm.price}
                      onChange={(e) => setSessionForm({ ...sessionForm, price: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Max Guest Slots
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={50}
                      value={sessionForm.max_slots}
                      onChange={(e) => setSessionForm({ ...sessionForm, max_slots: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="published">Published (Live Catalog)</option>
                    <option value="draft">Draft (Private)</option>
                    <option value="full">Full (Capacity Reached)</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Description &amp; Agenda
                  </label>
                  <textarea
                    rows={3}
                    value={sessionForm.description}
                    onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                    placeholder="Details about master artisan techniques, materials provided, etc."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSessionDrawerOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
                  >
                    {editingSession ? 'Save Changes' : 'Publish Session'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5">
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                  className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
