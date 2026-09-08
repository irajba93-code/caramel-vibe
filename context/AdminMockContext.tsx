'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import {
  AdminCategory,
  AdminSession,
  AdminSessionType,
  AdminClient,
  AdminBooking,
  AdminNotification,
  AdminAppSetting,
  AdminActivity,
  INITIAL_CATEGORIES,
  INITIAL_SESSIONS,
  INITIAL_SESSION_TYPES,
  INITIAL_CLIENTS,
  INITIAL_BOOKINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_APP_SETTINGS,
  INITIAL_ACTIVITIES,
} from '@/lib/admin/mockData'
import { useToast } from '@/components/ui/ToastContext'
import { createClient } from '@/lib/supabase/client'
import type { Category, Session, SessionType, Profile, Booking, AppSetting } from '@/lib/supabase/types'

interface AdminMockContextType {
  // Activities
  activities: AdminActivity[]
  addActivity: (act: Omit<AdminActivity, 'id' | 'created_at'>) => void

  // Categories
  categories: AdminCategory[]
  addCategory: (cat: Omit<AdminCategory, 'id' | 'created_at' | 'updated_at' | 'session_count'>) => Promise<void>
  updateCategory: (id: string, cat: Partial<AdminCategory>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>

  // App Settings
  appSettings: Record<string, any>
  appSettingsList: AdminAppSetting[]
  updateAppSetting: (key: string, value: any, description?: string) => Promise<void>

  // Sessions
  sessions: AdminSession[]
  addSession: (session: Omit<AdminSession, 'id' | 'booked_slots' | 'created_at'>) => Promise<void>
  updateSession: (id: string, session: Partial<AdminSession>) => Promise<void>
  deleteSession: (id: string) => Promise<void>

  // Session Types
  sessionTypes: AdminSessionType[]
  addSessionType: (st: Omit<AdminSessionType, 'id' | 'created_at'>) => Promise<void>
  updateSessionType: (id: string, st: Partial<AdminSessionType>) => Promise<void>
  deleteSessionType: (id: string) => Promise<void>

  // Clients
  clients: AdminClient[]
  addClient: (client: Omit<AdminClient, 'id' | 'total_bookings' | 'total_spent' | 'created_at' | 'updated_at' | 'last_active'>) => Promise<void>
  updateClient: (id: string, updated: Partial<AdminClient>) => Promise<void>
  updateClientStatus: (id: string, status: 'active' | 'banned' | 'rejected', ban_reason?: string | null) => Promise<void>
  currentUserId: string | null
  currentUserEmail: string | null

  // Bookings
  bookings: AdminBooking[]
  addBooking: (booking: Omit<AdminBooking, 'id' | 'booking_number' | 'created_at' | 'check_in_time'>) => Promise<void>
  updateBookingPayment: (id: string, payment_status: 'pending_on_premise' | 'paid_on_premise' | 'waived' | 'refunded') => Promise<void>
  checkInBooking: (id: string) => Promise<void>
  cancelBooking: (id: string, reason: string) => Promise<void>
  updateBookingNotes: (id: string, admin_notes: string) => Promise<void>

  // Notifications
  notifications: AdminNotification[]
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void

  // Sidebar & Mobile Drawer
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  isMobileDrawerOpen: boolean
  toggleMobileDrawer: () => void
  setMobileDrawerOpen: (v: boolean) => void
  closeMobileDrawer: () => void

  // Loading indicator
  isLoadingData: boolean
  refreshData: () => Promise<void>
}

const AdminMockContext = createContext<AdminMockContextType | undefined>(undefined)

export function AdminMockProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast()
  const supabase = createClient()

  const [categories, setCategories] = useState<AdminCategory[]>(INITIAL_CATEGORIES)
  const [appSettings, setAppSettings] = useState<Record<string, any>>({
    max_booking_days_advance: 30,
    cancellation_lead_hours: 24,
    studio_name: 'Caramel Vibe Flagship Studio',
    studio_address: 'Caramel Vibe Flagship Studio, Suite 402',
    studio_currency: 'CAD',
    operating_hours: {
      tuesday_wednesday: '10:00 AM – 6:00 PM',
      thursday_friday: '10:00 AM – 8:00 PM',
      saturday: '11:00 AM – 5:00 PM',
      sunday_monday: 'Closed',
    },
  })
  const [appSettingsList, setAppSettingsList] = useState<AdminAppSetting[]>(INITIAL_APP_SETTINGS)
  const [sessions, setSessions] = useState<AdminSession[]>(INITIAL_SESSIONS)
  const [sessionTypes, setSessionTypes] = useState<AdminSessionType[]>(INITIAL_SESSION_TYPES)
  const [clients, setClients] = useState<AdminClient[]>(INITIAL_CLIENTS)
  const [bookings, setBookings] = useState<AdminBooking[]>(INITIAL_BOOKINGS)
  const [notifications, setNotifications] = useState<AdminNotification[]>(INITIAL_NOTIFICATIONS)
  const [activities, setActivities] = useState<AdminActivity[]>(INITIAL_ACTIVITIES)
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev)
  const toggleMobileDrawer = () => setMobileDrawerOpen((prev) => !prev)
  const closeMobileDrawer = () => setMobileDrawerOpen(false)

  const addActivity = useCallback((act: Omit<AdminActivity, 'id' | 'created_at'>) => {
    const newAct: AdminActivity = {
      ...act,
      id: `act-${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    setActivities((prev) => [newAct, ...prev])
  }, [])

  // Fetch Live Data from Supabase
  const loadSupabaseData = useCallback(async () => {
    try {
      // 1. Fetch Categories
      const { data: dbCategories } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true })

      if (dbCategories && dbCategories.length > 0) {
        const mappedCats: AdminCategory[] = dbCategories.map((c: Category) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          image_url: c.image_url || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
          display_order: c.display_order,
          is_active: c.is_active,
          session_count: 0,
          created_at: c.created_at,
          updated_at: c.updated_at,
        }))
        setCategories(mappedCats)
      }

      // 2. Fetch Session Types
      const { data: dbTypes } = await supabase
        .from('session_types')
        .select('*')
        .order('created_at', { ascending: true })

      if (dbTypes && dbTypes.length > 0) {
        const mappedTypes: AdminSessionType[] = dbTypes.map((st: SessionType) => ({
          id: st.id,
          category_id: st.category_id || '',
          category_name: st.category || 'Atelier Experience',
          name: st.name,
          slug: st.slug,
          description: st.description || '',
          capacity: st.capacity !== undefined && st.capacity !== null ? Number(st.capacity) : null,
          default_duration_min: st.default_duration_min,
          default_price: Number(st.default_price),
          currency: st.currency,
          image_url: st.image_url || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
          is_active: st.is_active,
          created_at: st.created_at,
        }))
        setSessionTypes(mappedTypes)
      }

      // 1. Fetch Sessions
      const { data: dbSessions } = await supabase
        .from('sessions')
        .select('*')
        .order('start_time', { ascending: true })

      const sessionsMap = new Map<string, Session>()
      if (dbSessions) {
        dbSessions.forEach((s: Session) => sessionsMap.set(s.id, s))
      }

      // 2. Fetch Profiles (Clients)
      const { data: dbProfiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      const profilesMap = new Map<string, Profile>()
      if (dbProfiles) {
        dbProfiles.forEach((p: Profile) => profilesMap.set(p.id, p))
      }

      // 3. Fetch Bookings
      const { data: dbBookings } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (dbBookings && dbBookings.length > 0) {
        const mappedBookings: AdminBooking[] = dbBookings.map((b: Booking) => {
          const linkedProfile = profilesMap.get(b.user_id)
          const linkedSession = sessionsMap.get(b.session_id)
          return {
            id: b.id,
            booking_number: b.booking_number,
            session_id: b.session_id,
            session_title: linkedSession?.title || 'Atelier Appointment',
            session_date: linkedSession
              ? new Date(linkedSession.start_time).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : new Date(b.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
            user_id: b.user_id,
            client_name: linkedProfile?.full_name || linkedProfile?.email.split('@')[0] || 'Member Client',
            client_email: linkedProfile?.email || 'client@caramelvibe.com',
            client_phone: linkedProfile?.phone || 'Not provided',
            slots_booked: b.slots_booked,
            total_price: Number(b.total_price),
            currency: b.currency,
            status: b.status as AdminBooking['status'],
            payment_status: b.payment_status as AdminBooking['payment_status'],
            payment_notes: b.payment_notes,
            client_notes: b.client_notes,
            admin_notes: b.admin_notes,
            cancel_reason: b.cancel_reason,
            cancelled_at: b.cancelled_at,
            check_in_time: b.check_in_time,
            created_at: b.created_at,
          }
        })
        setBookings(mappedBookings)
      }

      // 4. Map Clients with Aggregated Metrics
      if (dbProfiles && dbProfiles.length > 0) {
        const mappedClients: AdminClient[] = dbProfiles.map((p: Profile) => {
          const userBookings = dbBookings ? dbBookings.filter((b: Booking) => b.user_id === p.id) : []
          const totalSpent = userBookings.reduce((sum: number, b: Booking) => sum + Number(b.total_price), 0)
          return {
            id: p.id,
            email: p.email,
            full_name: p.full_name || p.email.split('@')[0],
            phone: p.phone || 'Not provided',
            avatar_url: p.avatar_url,
            role: p.role as AdminClient['role'],
            status: p.status as AdminClient['status'],
            ban_reason: p.ban_reason,
            total_bookings: userBookings.length,
            total_spent: totalSpent,
            created_at: p.created_at,
            updated_at: p.updated_at,
            last_active: userBookings.length > 0 ? 'Recently' : 'New Member',
          }
        })
        setClients(mappedClients)
      }

      // 5. Map Sessions with Live Bookings Aggregation
      if (dbSessions && dbSessions.length > 0) {
        const mappedSessions: AdminSession[] = dbSessions.map((s: Session) => {
          const sessionBookings = dbBookings
            ? dbBookings.filter((b: Booking) => b.session_id === s.id && b.status !== 'cancelled')
            : []
          const liveBooked =
            sessionBookings.length > 0
              ? sessionBookings.reduce((sum: number, b: Booking) => sum + (Number(b.slots_booked) || 1), 0)
              : Number(s.booked_slots) || 0

          return {
            id: s.id,
            session_type_id: s.session_type_id || '',
            category_name: 'Atelier Workshop',
            title: s.title,
            slug: s.slug,
            description: s.description || '',
            location_type: s.location_type,
            location_address: s.location_address,
            price: Number(s.price),
            currency: s.currency,
            max_slots: s.max_slots,
            booked_slots: liveBooked,
            start_time: s.start_time,
            end_time: s.end_time,
            is_ongoing: s.is_ongoing,
            status: (liveBooked >= s.max_slots && s.status === 'published'
              ? 'full'
              : s.status) as AdminSession['status'],
            cancel_reason: s.cancel_reason,
            cancelled_at: s.cancelled_at,
            created_at: s.created_at,
          }
        })
        setSessions(mappedSessions)
      }

      // 6. Fetch App Settings
      const { data: dbSettings } = await supabase
        .from('app_settings')
        .select('*')
        .order('key', { ascending: true })

      if (dbSettings && dbSettings.length > 0) {
        setAppSettingsList(dbSettings as AdminAppSetting[])
        const settingObj: Record<string, any> = {}
        dbSettings.forEach((s: AppSetting) => {
          settingObj[s.key] = s.value
        })
        setAppSettings(settingObj)
      }

      // 7. Fetch Current Authenticated User Identity
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        setCurrentUserEmail(user.email || null)
      }
    } catch (err) {
      console.error('Error hydrating Supabase admin data:', err)
    } finally {
      setIsLoadingData(false)
    }
  }, [supabase])

  useEffect(() => {
    loadSupabaseData()

    // Real-Time Supabase Channel Subscription
    const channel = supabase
      .channel('admin_realtime_feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newBk = payload.new as Booking
            const newNotif: AdminNotification = {
              id: `notif-${Date.now()}`,
              title: 'New Reservation Placed',
              message: `New booking ${newBk.booking_number} placed.`,
              type: 'booking',
              read: false,
              timestamp: 'Just now',
            }
            setNotifications((prev) => [newNotif, ...prev])
            addActivity({
              actor_type: 'client',
              actor_name: 'Atelier Client',
              actor_email: 'client@caramelvibe.com',
              action_type: 'booking_created',
              title: 'New Real-Time Reservation',
              description: `New booking ${newBk.booking_number} placed via boutique portal.`,
              target_id: newBk.id,
              target_label: newBk.booking_number,
              timestamp: 'Just now',
            })
            showToast('New real-time booking event received.', 'info')
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          loadSupabaseData()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings' },
        () => {
          loadSupabaseData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadSupabaseData, supabase, showToast])

  // App Settings Actions
  const updateAppSetting = async (key: string, value: any, description?: string) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert(
          {
            key,
            value,
            description: description || undefined,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        )

      if (error) throw error

      setAppSettings((prev) => ({ ...prev, [key]: value }))
      setAppSettingsList((prev) => {
        const exists = prev.some((s) => s.key === key)
        if (exists) {
          return prev.map((s) => (s.key === key ? { ...s, value, updated_at: new Date().toISOString() } : s))
        }
        return [...prev, { key, value, description, updated_at: new Date().toISOString() }]
      })

      showToast(`Setting "${key}" updated successfully.`, 'success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed'
      showToast(`Error saving setting: ${msg}`, 'error')
    }
  }

  // Category Actions (Live Supabase + State)
  const addCategory = async (cat: Omit<AdminCategory, 'id' | 'created_at' | 'updated_at' | 'session_count'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image_url: cat.image_url,
          display_order: cat.display_order,
          is_active: cat.is_active,
        })
        .select()
        .single()

      if (error) throw error

      const newCat: AdminCategory = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        image_url: data.image_url || cat.image_url,
        display_order: data.display_order,
        is_active: data.is_active,
        session_count: 0,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
      setCategories((prev) => [newCat, ...prev])
      showToast(`Category "${cat.name}" created successfully.`, 'success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create category'
      showToast(`Error creating category: ${msg}`, 'error')
    }
  }

  const updateCategory = async (id: string, updated: Partial<AdminCategory>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          ...updated,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updated, updated_at: new Date().toISOString() } : c))
      )
      showToast('Category updated successfully.', 'success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed'
      showToast(`Error updating category: ${msg}`, 'error')
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const target = categories.find((c) => c.id === id)
      if (target && target.session_count > 0) {
        showToast(`Cannot delete category with ${target.session_count} linked sessions.`, 'error')
        return
      }

      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error

      setCategories((prev) => prev.filter((c) => c.id !== id))
      showToast('Category removed from database.', 'info')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed'
      showToast(`Error removing category: ${msg}`, 'error')
    }
  }

  // Session Actions (Live Supabase + State)
  const addSession = async (session: Omit<AdminSession, 'id' | 'booked_slots' | 'created_at'>) => {
    // Only pass valid UUID for session_type_id or null
    const validTypeId =
      session.session_type_id &&
      !session.session_type_id.startsWith('st-') &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.session_type_id)
        ? session.session_type_id
        : null

    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          title: session.title,
          slug: session.slug,
          description: session.description || null,
          location_type: session.location_type || 'studio',
          location_address: session.location_address || 'Caramel Vibe Flagship Studio, Suite 402',
          price: Number(session.price),
          currency: session.currency || 'CAD',
          max_slots: Number(session.max_slots),
          booked_slots: 0,
          start_time: session.start_time,
          end_time: session.end_time,
          is_ongoing: Boolean(session.is_ongoing),
          status: session.status || 'published',
          session_type_id: validTypeId,
        })
        .select()
        .single()

      if (error) throw error

      const newSes: AdminSession = {
        id: data.id,
        session_type_id: session.session_type_id || '',
        category_name: session.category_name || 'Atelier Workshop',
        title: data.title,
        slug: data.slug,
        description: data.description || '',
        location_type: data.location_type,
        location_address: data.location_address,
        price: Number(data.price),
        currency: data.currency,
        max_slots: data.max_slots,
        booked_slots: data.booked_slots,
        start_time: data.start_time,
        end_time: data.end_time,
        is_ongoing: data.is_ongoing,
        status: data.status as AdminSession['status'],
        cancel_reason: data.cancel_reason,
        cancelled_at: data.cancelled_at,
        created_at: data.created_at,
      }
      setSessions((prev) => [newSes, ...prev])
      addActivity({
        actor_type: 'admin',
        actor_name: 'Atelier Director',
        actor_email: currentUserEmail || 'admin@caramelvibe.com',
        action_type: 'session_created',
        title: 'New Studio Session Published',
        description: `Published "${session.title}" (${session.max_slots} slots).`,
        target_id: data.id,
        target_label: session.title,
        timestamp: 'Just now',
      })
      showToast(`Session "${session.title}" published to live database.`, 'success')
    } catch {
      // Local fallback in mock mode
      const newSes: AdminSession = {
        ...session,
        id: `ses-${Date.now()}`,
        booked_slots: 0,
        cancel_reason: null,
        cancelled_at: null,
        created_at: new Date().toISOString(),
      }
      setSessions((prev) => [newSes, ...prev])
      addActivity({
        actor_type: 'admin',
        actor_name: 'Atelier Director',
        actor_email: currentUserEmail || 'admin@caramelvibe.com',
        action_type: 'session_created',
        title: 'New Studio Session Published',
        description: `Scheduled "${session.title}" (${session.max_slots} slots).`,
        target_id: newSes.id,
        target_label: session.title,
        timestamp: 'Just now',
      })
      showToast(`Session "${session.title}" scheduled.`, 'success')
    }
  }

  const updateSession = async (id: string, updated: Partial<AdminSession>) => {
    try {
      // Sanitize payload: only send valid public.sessions columns to Supabase
      const dbPayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      }

      if (updated.title !== undefined) dbPayload.title = updated.title
      if (updated.slug !== undefined) dbPayload.slug = updated.slug
      if (updated.description !== undefined) dbPayload.description = updated.description
      if (updated.location_type !== undefined) dbPayload.location_type = updated.location_type
      if (updated.location_address !== undefined) dbPayload.location_address = updated.location_address
      if (updated.price !== undefined) dbPayload.price = Number(updated.price)
      if (updated.currency !== undefined) dbPayload.currency = updated.currency
      if (updated.max_slots !== undefined) dbPayload.max_slots = Number(updated.max_slots)
      if (updated.booked_slots !== undefined) dbPayload.booked_slots = Number(updated.booked_slots)
      if (updated.start_time !== undefined) dbPayload.start_time = updated.start_time
      if (updated.end_time !== undefined) dbPayload.end_time = updated.end_time
      if (updated.status !== undefined) dbPayload.status = updated.status
      if (updated.is_ongoing !== undefined) dbPayload.is_ongoing = Boolean(updated.is_ongoing)
      if (updated.cancel_reason !== undefined) dbPayload.cancel_reason = updated.cancel_reason
      if (updated.cancelled_at !== undefined) dbPayload.cancelled_at = updated.cancelled_at

      if (updated.session_type_id !== undefined) {
        dbPayload.session_type_id =
          updated.session_type_id &&
          !updated.session_type_id.startsWith('st-') &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(updated.session_type_id)
            ? updated.session_type_id
            : null
      }

      // If id is a valid UUID, update in Supabase
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        const { error } = await supabase
          .from('sessions')
          .update(dbPayload)
          .eq('id', id)

        if (error) {
          console.warn('Supabase update session warning:', error)
        }
      }

      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)))
      addActivity({
        actor_type: 'admin',
        actor_name: 'Atelier Director',
        actor_email: currentUserEmail || 'admin@caramelvibe.com',
        action_type: 'session_updated',
        title: 'Session Details Updated',
        description: `Updated session details for "${updated.title || id}".`,
        target_id: id,
        target_label: updated.title,
        timestamp: 'Just now',
      })
      showToast('Session details updated successfully.', 'success')
    } catch {
      // Local fallback
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)))
      addActivity({
        actor_type: 'admin',
        actor_name: 'Atelier Director',
        actor_email: currentUserEmail || 'admin@caramelvibe.com',
        action_type: 'session_updated',
        title: 'Session Details Updated',
        description: `Updated session details for "${updated.title || id}".`,
        target_id: id,
        target_label: updated.title,
        timestamp: 'Just now',
      })
      showToast('Session details updated.', 'success')
    }
  }

  const deleteSession = async (id: string) => {
    const target = sessions.find((s) => s.id === id)
    try {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        const { error } = await supabase.from('sessions').delete().eq('id', id)
        if (error) {
          console.warn('Supabase delete session warning:', error)
        }
      }

      setSessions((prev) => prev.filter((s) => s.id !== id))
      addActivity({
        actor_type: 'admin',
        actor_name: 'Atelier Director',
        actor_email: currentUserEmail || 'admin@caramelvibe.com',
        action_type: 'session_updated',
        title: 'Session Removed from Catalog',
        description: `Deleted session "${target?.title || id}".`,
        target_id: id,
        target_label: target?.title,
        timestamp: 'Just now',
      })
      showToast('Session removed from catalog.', 'info')
    } catch {
      setSessions((prev) => prev.filter((s) => s.id !== id))
      showToast('Session removed from catalog.', 'info')
    }
  }

  // Session Type Actions
  const addSessionType = async (st: Omit<AdminSessionType, 'id' | 'created_at'>) => {
    try {
      const parsedCapacity =
        st.capacity !== undefined && st.capacity !== null && String(st.capacity).trim() !== ''
          ? Number(st.capacity)
          : null

      const { data, error } = await supabase
        .from('session_types')
        .insert({
          name: st.name,
          slug: st.slug,
          description: st.description,
          capacity: parsedCapacity,
          default_duration_min: st.default_duration_min,
          default_price: st.default_price,
          currency: st.currency,
          category_id: st.category_id || null,
          category: st.category_name,
          image_url: st.image_url,
          is_active: st.is_active,
        })
        .select()
        .single()

      if (error) throw error

      const newSt: AdminSessionType = {
        id: data.id,
        category_id: data.category_id || '',
        category_name: data.category || st.category_name,
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        capacity: data.capacity !== undefined && data.capacity !== null ? Number(data.capacity) : null,
        default_duration_min: data.default_duration_min,
        default_price: Number(data.default_price),
        currency: data.currency,
        image_url: data.image_url || st.image_url,
        is_active: data.is_active,
        created_at: data.created_at,
      }
      setSessionTypes((prev) => [newSt, ...prev])
      showToast(`Session template "${st.name}" created.`, 'success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create template'
      showToast(`Error creating template: ${msg}`, 'error')
    }
  }

  const updateSessionType = async (id: string, st: Partial<AdminSessionType>) => {
    try {
      const payload: Record<string, any> = {
        ...st,
        updated_at: new Date().toISOString(),
      }
      if ('capacity' in st) {
        payload.capacity =
          st.capacity !== undefined && st.capacity !== null && String(st.capacity).trim() !== ''
            ? Number(st.capacity)
            : null
      }

      const { error } = await supabase
        .from('session_types')
        .update(payload)
        .eq('id', id)

      if (error) throw error

      setSessionTypes((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ...st,
                capacity:
                  'capacity' in st
                    ? st.capacity !== undefined && st.capacity !== null && String(st.capacity).trim() !== ''
                      ? Number(st.capacity)
                      : null
                    : item.capacity,
              }
            : item
        )
      )
      showToast('Template updated.', 'success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed'
      showToast(`Error updating template: ${msg}`, 'error')
    }
  }

  const deleteSessionType = async (id: string) => {
    try {
      const { error } = await supabase.from('session_types').delete().eq('id', id)
      if (error) throw error

      setSessionTypes((prev) => prev.filter((item) => item.id !== id))
      showToast('Session template removed.', 'info')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete template'
      showToast(`Error deleting template: ${msg}`, 'error')
    }
  }

  // Client Actions
  const addClient = async (client: Omit<AdminClient, 'id' | 'total_bookings' | 'total_spent' | 'created_at' | 'updated_at' | 'last_active'>) => {
    const newClient: AdminClient = {
      ...client,
      id: `usr-${Date.now()}`,
      total_bookings: 0,
      total_spent: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_active: 'Just now',
    }
    setClients((prev) => [newClient, ...prev])
    showToast(`Client account "${client.full_name}" registered.`, 'success')
  }

  const updateClient = async (id: string, updated: Partial<AdminClient>) => {
    if (id === currentUserId && (updated.status === 'banned' || updated.status === 'rejected')) {
      showToast('Action prohibited: You cannot ban, suspend, or reject your own account.', 'error')
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updated.full_name,
          phone: updated.phone,
          role: updated.role,
          status: updated.status,
          ban_reason: updated.status === 'banned' ? updated.ban_reason : null,
          avatar_url: updated.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      setClients((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...updated,
                ban_reason: updated.status === 'banned' ? updated.ban_reason || c.ban_reason : null,
                updated_at: new Date().toISOString(),
              }
            : c
        )
      )

      showToast('Client profile updated successfully.', 'success')
    } catch {
      // Local fallback in mock mode
      setClients((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...updated,
                ban_reason: updated.status === 'banned' ? updated.ban_reason || c.ban_reason : null,
                updated_at: new Date().toISOString(),
              }
            : c
        )
      )
      showToast('Client profile updated.', 'success')
    }
  }

  const updateClientStatus = async (id: string, status: 'active' | 'banned' | 'rejected', ban_reason: string | null = null) => {
    if (id === currentUserId && (status === 'banned' || status === 'rejected')) {
      showToast('Action prohibited: You cannot ban, suspend, or reject your own account.', 'error')
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          status,
          ban_reason: status === 'banned' ? ban_reason || 'Administrative suspension' : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      setClients((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status,
                ban_reason: status === 'banned' ? ban_reason || 'Administrative suspension' : null,
                updated_at: new Date().toISOString(),
              }
            : c
        )
      )

      if (status === 'banned') {
        showToast('Client account banned and restricted from booking.', 'error')
      } else if (status === 'active') {
        showToast('Client account restored to active standing.', 'success')
      } else {
        showToast('Client application status set to rejected.', 'info')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Status update failed'
      showToast(`Error updating client status: ${msg}`, 'error')
    }
  }

  // Booking Actions
  const addBooking = async (booking: Omit<AdminBooking, 'id' | 'booking_number' | 'created_at' | 'check_in_time'>) => {
    const num = Math.floor(1000 + Math.random() * 9000)
    const bookingNumber = `CV-2026-${num}`

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          booking_number: bookingNumber,
          session_id: booking.session_id,
          user_id: booking.user_id,
          slots_booked: booking.slots_booked,
          total_price: booking.total_price,
          currency: booking.currency,
          status: booking.status,
          payment_status: booking.payment_status,
          payment_notes: booking.payment_notes,
          client_notes: booking.client_notes,
          admin_notes: booking.admin_notes,
        })
        .select()
        .single()

      if (error) throw error

      const newBk: AdminBooking = {
        ...booking,
        id: data.id,
        booking_number: data.booking_number,
        check_in_time: null,
        created_at: data.created_at,
      }
      setBookings((prev) => [newBk, ...prev])

      // Increment session booked slots locally and in DB
      const targetSession = sessions.find((s) => s.id === booking.session_id)
      const currentBooked = targetSession ? Number(targetSession.booked_slots) || 0 : 0
      const newBooked = currentBooked + (Number(booking.slots_booked) || 1)
      const isFull = targetSession ? newBooked >= targetSession.max_slots : false

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === booking.session_id) {
            return {
              ...s,
              booked_slots: newBooked,
              status: (isFull && s.status === 'published' ? 'full' : s.status) as AdminSession['status'],
            }
          }
          return s
        })
      )

      if (targetSession) {
        try {
          await supabase
            .from('sessions')
            .update({
              booked_slots: newBooked,
              status: isFull && targetSession.status === 'published' ? 'full' : targetSession.status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', booking.session_id)
        } catch (dbErr) {
          console.warn('Failed to update sessions table booked_slots in Supabase:', dbErr)
        }
      }

      showToast(`Booking ${bookingNumber} recorded successfully.`, 'success')
    } catch {
      // Fallback local registration if user_id or FK differs
      const newBk: AdminBooking = {
        ...booking,
        id: `bk-${Date.now()}`,
        booking_number: bookingNumber,
        check_in_time: null,
        created_at: new Date().toISOString(),
      }
      setBookings((prev) => [newBk, ...prev])

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === booking.session_id) {
            const newBooked = (Number(s.booked_slots) || 0) + (Number(booking.slots_booked) || 1)
            return {
              ...s,
              booked_slots: newBooked,
              status: (newBooked >= s.max_slots && s.status === 'published' ? 'full' : s.status) as AdminSession['status'],
            }
          }
          return s
        })
      )

      showToast(`Booking ${bookingNumber} recorded.`, 'success')
    }
  }

  const updateBookingPayment = async (id: string, payment_status: 'pending_on_premise' | 'paid_on_premise' | 'waived' | 'refunded') => {
    const target = bookings.find((b) => b.id === id)
    try {
      await supabase
        .from('bookings')
        .update({ payment_status, updated_at: new Date().toISOString() })
        .eq('id', id)

      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, payment_status } : b)))
      addActivity({
        actor_type: 'admin',
        actor_name: 'Atelier Director',
        actor_email: currentUserEmail || 'admin@caramelvibe.com',
        action_type: 'payment_updated',
        title: 'Settlement Status Updated',
        description: `Updated payment for booking ${target?.booking_number || id} to "${payment_status.replace(/_/g, ' ')}".`,
        target_id: id,
        target_label: target?.booking_number,
        timestamp: 'Just now',
      })
      showToast(`Payment status updated to "${payment_status.replace(/_/g, ' ')}".`, 'success')
    } catch {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, payment_status } : b)))
      addActivity({
        actor_type: 'admin',
        actor_name: 'Atelier Director',
        actor_email: currentUserEmail || 'admin@caramelvibe.com',
        action_type: 'payment_updated',
        title: 'Settlement Status Updated',
        description: `Updated payment for booking ${target?.booking_number || id} to "${payment_status.replace(/_/g, ' ')}".`,
        target_id: id,
        target_label: target?.booking_number,
        timestamp: 'Just now',
      })
      showToast(`Payment status updated.`, 'success')
    }
  }

  const checkInBooking = async (id: string) => {
    const nowIso = new Date().toISOString()
    const target = bookings.find((b) => b.id === id)
    try {
      await supabase
        .from('bookings')
        .update({ check_in_time: nowIso, status: 'completed', updated_at: nowIso })
        .eq('id', id)

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, check_in_time: nowIso, status: 'completed' } : b))
      )
      addActivity({
        actor_type: 'admin',
        actor_name: 'Atelier Director',
        actor_email: currentUserEmail || 'admin@caramelvibe.com',
        action_type: 'booking_checked_in',
        title: 'Guest Attendance Checked In',
        description: `Completed in-person check-in for guest ${target?.client_name || 'Guest'} (${target?.booking_number || id}).`,
        target_id: id,
        target_label: target?.booking_number,
        timestamp: 'Just now',
      })
      showToast('Guest checked in successfully.', 'success')
    } catch {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, check_in_time: nowIso, status: 'completed' } : b))
      )
      addActivity({
        actor_type: 'admin',
        actor_name: 'Atelier Director',
        actor_email: currentUserEmail || 'admin@caramelvibe.com',
        action_type: 'booking_checked_in',
        title: 'Guest Attendance Checked In',
        description: `Completed in-person check-in for guest ${target?.client_name || 'Guest'} (${target?.booking_number || id}).`,
        target_id: id,
        target_label: target?.booking_number,
        timestamp: 'Just now',
      })
      showToast('Guest checked in.', 'success')
    }
  }

  const cancelBooking = async (id: string, reason: string) => {
    const nowIso = new Date().toISOString()
    const target = bookings.find((b) => b.id === id)

    try {
      await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancel_reason: reason,
          cancelled_at: nowIso,
          updated_at: nowIso,
        })
        .eq('id', id)

      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: 'cancelled',
                cancel_reason: reason,
                cancelled_at: nowIso,
              }
            : b
        )
      )

      if (target) {
        const targetSession = sessions.find((s) => s.id === target.session_id)
        const currentBooked = targetSession ? Number(targetSession.booked_slots) || 0 : 0
        const newBooked = Math.max(0, currentBooked - (Number(target.slots_booked) || 1))

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === target.session_id) {
              return {
                ...s,
                booked_slots: newBooked,
                status: s.status === 'full' ? 'published' : s.status,
              }
            }
            return s
          })
        )

        if (targetSession) {
          try {
            await supabase
              .from('sessions')
              .update({
                booked_slots: newBooked,
                status: targetSession.status === 'full' ? 'published' : targetSession.status,
                updated_at: nowIso,
              })
              .eq('id', target.session_id)
          } catch (dbErr) {
            console.warn('Failed to update sessions table booked_slots in Supabase:', dbErr)
          }
        }
      }

      addActivity({
        actor_type: 'admin',
        actor_name: 'Atelier Director',
        actor_email: currentUserEmail || 'admin@caramelvibe.com',
        action_type: 'booking_cancelled',
        title: 'Reservation Cancelled',
        description: `Cancelled booking ${target?.booking_number || id}. Reason: ${reason}`,
        target_id: id,
        target_label: target?.booking_number,
        timestamp: 'Just now',
      })
      showToast('Booking cancelled and slot capacity restored.', 'info')
    } catch {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: 'cancelled',
                cancel_reason: reason,
                cancelled_at: nowIso,
              }
            : b
        )
      )
      addActivity({
        actor_type: 'admin',
        actor_name: 'Atelier Director',
        actor_email: currentUserEmail || 'admin@caramelvibe.com',
        action_type: 'booking_cancelled',
        title: 'Reservation Cancelled',
        description: `Cancelled booking ${target?.booking_number || id}. Reason: ${reason}`,
        target_id: id,
        target_label: target?.booking_number,
        timestamp: 'Just now',
      })
      showToast('Booking cancelled.', 'info')
    }
  }

  const updateBookingNotes = async (id: string, admin_notes: string) => {
    try {
      await supabase
        .from('bookings')
        .update({ admin_notes, updated_at: new Date().toISOString() })
        .eq('id', id)

      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, admin_notes } : b)))
      showToast('Private admin notes saved.', 'success')
    } catch {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, admin_notes } : b)))
      showToast('Notes saved.', 'success')
    }
  }

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    showToast('All notifications marked as read.', 'info')
  }

  return (
    <AdminMockContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        appSettings,
        appSettingsList,
        updateAppSetting,
        sessions,
        addSession,
        updateSession,
        deleteSession,
        sessionTypes,
        addSessionType,
        updateSessionType,
        deleteSessionType,
        clients,
        addClient,
        updateClient,
        updateClientStatus,
        currentUserId,
        currentUserEmail,
        bookings,
        addBooking,
        updateBookingPayment,
        checkInBooking,
        cancelBooking,
        updateBookingNotes,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        activities,
        addActivity,
        isSidebarCollapsed,
        toggleSidebar,
        setSidebarCollapsed,
        isMobileDrawerOpen,
        toggleMobileDrawer,
        setMobileDrawerOpen,
        closeMobileDrawer,
        isLoadingData,
        refreshData: loadSupabaseData,
      }}
    >
      {children}
    </AdminMockContext.Provider>
  )
}

export function useAdminMock() {
  const context = useContext(AdminMockContext)
  if (!context) {
    throw new Error('useAdminMock must be used within an AdminMockProvider')
  }
  return context
}
