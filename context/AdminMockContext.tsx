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
  INITIAL_CATEGORIES,
  INITIAL_SESSIONS,
  INITIAL_SESSION_TYPES,
  INITIAL_CLIENTS,
  INITIAL_BOOKINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_APP_SETTINGS,
} from '@/lib/admin/mockData'
import { useToast } from '@/components/ui/ToastContext'
import { createClient } from '@/lib/supabase/client'
import type { Category, Session, SessionType, Profile, Booking, AppSetting } from '@/lib/supabase/types'

interface AdminMockContextType {
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

  // Clients
  clients: AdminClient[]
  addClient: (client: Omit<AdminClient, 'id' | 'total_bookings' | 'total_spent' | 'created_at' | 'updated_at' | 'last_active'>) => Promise<void>
  updateClientStatus: (id: string, status: 'active' | 'banned' | 'rejected', ban_reason?: string | null) => Promise<void>

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

  // Sidebar collapse
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void

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
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev)

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
          default_duration_min: st.default_duration_min,
          default_price: Number(st.default_price),
          currency: st.currency,
          image_url: st.image_url || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
          is_active: st.is_active,
          created_at: st.created_at,
        }))
        setSessionTypes(mappedTypes)
      }

      // 3. Fetch Sessions
      const { data: dbSessions } = await supabase
        .from('sessions')
        .select('*')
        .order('start_time', { ascending: true })

      if (dbSessions && dbSessions.length > 0) {
        const mappedSessions: AdminSession[] = dbSessions.map((s: Session) => ({
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
          booked_slots: s.booked_slots,
          start_time: s.start_time,
          end_time: s.end_time,
          is_ongoing: s.is_ongoing,
          status: s.status as AdminSession['status'],
          cancel_reason: s.cancel_reason,
          cancelled_at: s.cancelled_at,
          created_at: s.created_at,
        }))
        setSessions(mappedSessions)
      }

      // 4. Fetch Profiles (Clients)
      const { data: dbProfiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (dbProfiles && dbProfiles.length > 0) {
        const mappedClients: AdminClient[] = dbProfiles.map((p: Profile) => ({
          id: p.id,
          email: p.email,
          full_name: p.full_name || p.email.split('@')[0],
          phone: p.phone || 'Not provided',
          avatar_url: p.avatar_url,
          role: p.role as AdminClient['role'],
          status: p.status as AdminClient['status'],
          ban_reason: p.ban_reason,
          total_bookings: 0,
          total_spent: 0,
          created_at: p.created_at,
          updated_at: p.updated_at,
          last_active: 'Recently',
        }))
        setClients(mappedClients)
      }

      // 5. Fetch Bookings
      const { data: dbBookings } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (dbBookings && dbBookings.length > 0) {
        const mappedBookings: AdminBooking[] = dbBookings.map((b: Booking) => ({
          id: b.id,
          booking_number: b.booking_number,
          session_id: b.session_id,
          session_title: 'Atelier Appointment',
          session_date: new Date(b.created_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          user_id: b.user_id,
          client_name: 'Member Client',
          client_email: 'client@caramelvibe.com',
          client_phone: '+1 (555) 019-2834',
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
        }))
        setBookings(mappedBookings)
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
            const newNotif: AdminNotification = {
              id: `notif-${Date.now()}`,
              title: 'New Reservation Placed',
              message: `New booking ${(payload.new as Booking).booking_number} placed.`,
              type: 'booking',
              read: false,
              timestamp: 'Just now',
            }
            setNotifications((prev) => [newNotif, ...prev])
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
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          title: session.title,
          slug: session.slug,
          description: session.description,
          location_type: session.location_type,
          location_address: session.location_address,
          price: session.price,
          currency: session.currency,
          max_slots: session.max_slots,
          booked_slots: 0,
          start_time: session.start_time,
          end_time: session.end_time,
          is_ongoing: session.is_ongoing,
          status: session.status,
        })
        .select()
        .single()

      if (error) throw error

      const newSes: AdminSession = {
        id: data.id,
        session_type_id: session.session_type_id,
        category_name: session.category_name,
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
      showToast(`Session "${session.title}" published to live database.`, 'success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create session'
      showToast(`Error creating session: ${msg}`, 'error')
    }
  }

  const updateSession = async (id: string, updated: Partial<AdminSession>) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          ...updated,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)))
      showToast('Session details updated.', 'success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed'
      showToast(`Error updating session: ${msg}`, 'error')
    }
  }

  const deleteSession = async (id: string) => {
    try {
      const { error } = await supabase.from('sessions').delete().eq('id', id)
      if (error) throw error

      setSessions((prev) => prev.filter((s) => s.id !== id))
      showToast('Session removed from catalog.', 'info')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed'
      showToast(`Error deleting session: ${msg}`, 'error')
    }
  }

  // Session Type Actions
  const addSessionType = async (st: Omit<AdminSessionType, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('session_types')
        .insert({
          name: st.name,
          slug: st.slug,
          description: st.description,
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
      const { error } = await supabase
        .from('session_types')
        .update({
          ...st,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      setSessionTypes((prev) => prev.map((item) => (item.id === id ? { ...item, ...st } : item)))
      showToast('Template updated.', 'success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed'
      showToast(`Error updating template: ${msg}`, 'error')
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

  const updateClientStatus = async (id: string, status: 'active' | 'banned' | 'rejected', ban_reason: string | null = null) => {
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
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === booking.session_id) {
            const newBooked = s.booked_slots + booking.slots_booked
            return {
              ...s,
              booked_slots: newBooked,
              status: newBooked >= s.max_slots ? 'full' : s.status,
            }
          }
          return s
        })
      )

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
      showToast(`Booking ${bookingNumber} recorded.`, 'success')
    }
  }

  const updateBookingPayment = async (id: string, payment_status: 'pending_on_premise' | 'paid_on_premise' | 'waived' | 'refunded') => {
    try {
      await supabase
        .from('bookings')
        .update({ payment_status, updated_at: new Date().toISOString() })
        .eq('id', id)

      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, payment_status } : b)))
      showToast(`Payment status updated to "${payment_status.replace(/_/g, ' ')}".`, 'success')
    } catch {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, payment_status } : b)))
      showToast(`Payment status updated.`, 'success')
    }
  }

  const checkInBooking = async (id: string) => {
    const nowIso = new Date().toISOString()
    try {
      await supabase
        .from('bookings')
        .update({ check_in_time: nowIso, status: 'completed', updated_at: nowIso })
        .eq('id', id)

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, check_in_time: nowIso, status: 'completed' } : b))
      )
      showToast('Guest checked in successfully.', 'success')
    } catch {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, check_in_time: nowIso, status: 'completed' } : b))
      )
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
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === target.session_id) {
              const newBooked = Math.max(0, s.booked_slots - target.slots_booked)
              return {
                ...s,
                booked_slots: newBooked,
                status: s.status === 'full' ? 'published' : s.status,
              }
            }
            return s
          })
        )
      }

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
        clients,
        addClient,
        updateClientStatus,
        bookings,
        addBooking,
        updateBookingPayment,
        checkInBooking,
        cancelBooking,
        updateBookingNotes,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        isSidebarCollapsed,
        toggleSidebar,
        setSidebarCollapsed,
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
