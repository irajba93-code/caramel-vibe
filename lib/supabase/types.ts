export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'client' | 'user'
export type UserStatus = 'active' | 'banned' | 'rejected'
export type SessionStatus = 'draft' | 'published' | 'full' | 'completed' | 'cancelled'
export type BookingStatus = 'pending_confirmation' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'waitlist'
export type PaymentStatus = 'pending_on_premise' | 'paid_on_premise' | 'waived' | 'refunded'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  status: UserStatus
  ban_reason: string | null
  created_at: string
  updated_at: string
}

export interface SessionType {
  id: string
  name: string
  slug: string
  description: string | null
  default_duration_min: number
  default_price: number
  currency: string
  category: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  session_type_id: string | null
  title: string
  slug: string
  description: string | null
  location_type: string
  location_address: string
  price: number
  currency: string
  max_slots: number
  booked_slots: number
  start_time: string
  end_time: string
  is_ongoing: boolean
  status: SessionStatus
  cancel_reason: string | null
  cancelled_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface SessionWaitlist {
  id: string
  session_id: string
  user_id: string
  requested_slots: number
  status: 'waiting' | 'notified' | 'promoted' | 'cancelled'
  notes: string | null
  created_at: string
  notified_at: string | null
}

export interface Booking {
  id: string
  booking_number: string
  session_id: string
  user_id: string
  slots_booked: number
  total_price: number
  currency: string
  status: BookingStatus
  payment_status: PaymentStatus
  payment_notes: string | null
  client_notes: string | null
  admin_notes: string | null
  cancel_reason: string | null
  cancelled_at: string | null
  cancelled_by: string | null
  check_in_time: string | null
  created_at: string
  updated_at: string
}

export interface UserLoginHistory {
  id: string
  user_id: string
  ip_address: string | null
  user_agent: string | null
  auth_method: string | null
  status: string | null
  login_at: string
}
