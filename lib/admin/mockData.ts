export interface AdminCategory {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  display_order: number
  is_active: boolean
  session_count: number
  created_at: string
  updated_at: string
}

export interface AdminSessionType {
  id: string
  category_id: string
  category_name: string
  name: string
  slug: string
  description: string
  capacity?: number | null
  default_duration_min: number
  default_price: number
  currency: string
  image_url: string
  is_active: boolean
  created_at: string
}

export interface AdminSession {
  id: string
  session_type_id: string
  category_name: string
  title: string
  slug: string
  description: string
  location_type: string
  location_address: string
  price: number
  currency: string
  max_slots: number
  booked_slots: number
  start_time: string
  end_time: string
  is_ongoing: boolean
  status: 'draft' | 'published' | 'full' | 'completed' | 'cancelled'
  cancel_reason: string | null
  cancelled_at: string | null
  created_at: string
}

export interface AdminClient {
  id: string
  email: string
  full_name: string
  phone: string
  avatar_url: string | null
  role: 'admin' | 'client' | 'user'
  status: 'active' | 'banned' | 'rejected'
  ban_reason: string | null
  total_bookings: number
  total_spent: number
  created_at: string
  updated_at: string
  last_active: string
}

export interface AdminBooking {
  id: string
  booking_number: string
  session_id: string
  session_title: string
  session_date: string
  user_id: string
  client_name: string
  client_email: string
  client_phone: string
  slots_booked: number
  total_price: number
  currency: string
  status: 'confirmed' | 'pending_confirmation' | 'completed' | 'cancelled' | 'no_show'
  payment_status: 'pending_on_premise' | 'paid_on_premise' | 'waived' | 'refunded'
  payment_notes: string | null
  client_notes: string | null
  admin_notes: string | null
  cancel_reason: string | null
  cancelled_at: string | null
  check_in_time: string | null
  created_at: string
}

export interface AdminNotification {
  id: string
  title: string
  message: string
  type: 'booking' | 'waitlist' | 'client' | 'system'
  read: boolean
  timestamp: string
}

export interface AdminActivity {
  id: string
  actor_type: 'admin' | 'client'
  actor_name: string
  actor_email: string
  actor_avatar?: string | null
  action_type:
    | 'booking_created'
    | 'booking_checked_in'
    | 'booking_cancelled'
    | 'payment_updated'
    | 'session_created'
    | 'session_updated'
    | 'client_registered'
    | 'client_status_changed'
    | 'client_profile_updated'
    | 'setting_updated'
    | 'category_created'
  title: string
  description: string
  target_id?: string
  target_label?: string
  timestamp: string
  created_at: string
}

export interface KpiMetric {
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  description: string
  iconName: 'dollar' | 'calendar' | 'bookings' | 'users'
}

export interface AdminAppSetting {
  id?: string
  key: string
  value: any
  description?: string | null
  updated_at?: string
}

export const INITIAL_APP_SETTINGS: AdminAppSetting[] = [
  {
    key: 'max_booking_days_advance',
    value: 30,
    description: 'Maximum number of days in advance an appointment can be reserved.',
  },
  {
    key: 'cancellation_lead_hours',
    value: 24,
    description: 'Minimum notice hours required to cancel a booking without penalty.',
  },
  {
    key: 'studio_name',
    value: 'Caramel Vibe Flagship Studio',
    description: 'Official studio name.',
  },
  {
    key: 'studio_address',
    value: 'Caramel Vibe Flagship Studio, Suite 402',
    description: 'Default atelier location address.',
  },
  {
    key: 'studio_currency',
    value: 'CAD',
    description: 'Default operating currency.',
  },
  {
    key: 'operating_hours',
    value: {
      tuesday_wednesday: '10:00 AM – 6:00 PM',
      thursday_friday: '10:00 AM – 8:00 PM',
      saturday: '11:00 AM – 5:00 PM',
      sunday_monday: 'Closed',
    },
    description: 'Weekly operating hours.',
  },
]

export const INITIAL_CATEGORIES: AdminCategory[] = [
  {
    id: 'cat-1',
    name: 'Bespoke Vintage Styling',
    slug: 'bespoke-styling',
    description: 'Private 1-on-1 archival handbag curation, wardrobe pairing, and luxury styling consultations.',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    display_order: 1,
    is_active: true,
    session_count: 4,
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-20T14:30:00Z',
  },
  {
    id: 'cat-2',
    name: 'Handbag Leather Restoration',
    slug: 'leather-restoration',
    description: 'Artisanal spa treatments, patina rejuvenation, and hardware polishing masterclasses for fine leathers.',
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    display_order: 2,
    is_active: true,
    session_count: 3,
    created_at: '2026-08-05T11:00:00Z',
    updated_at: '2026-08-22T09:15:00Z',
  },
  {
    id: 'cat-3',
    name: 'Private VIP Archival Viewings',
    slug: 'vip-viewings',
    description: 'Exclusive after-hours salon viewings of rare Hermès Birkin/Kelly and Chanel Haute Couture vaults.',
    image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    display_order: 3,
    is_active: true,
    session_count: 5,
    created_at: '2026-08-10T15:00:00Z',
    updated_at: '2026-08-25T16:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Atelier Collector Masterclasses',
    slug: 'collector-masterclasses',
    description: 'Authentication seminars, vintage provenance appraisal, and luxury investment workshops.',
    image_url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
    display_order: 4,
    is_active: false,
    session_count: 1,
    created_at: '2026-08-15T12:00:00Z',
    updated_at: '2026-09-01T11:20:00Z',
  },
]

export const INITIAL_SESSION_TYPES: AdminSessionType[] = [
  {
    id: 'st-1',
    category_id: 'cat-1',
    category_name: 'Bespoke Vintage Styling',
    name: 'Archival Wardrobe Integration Salon',
    slug: 'archival-wardrobe-integration',
    description: 'Individual styling session exploring archival leather accessories tailored to your seasonal look.',
    capacity: 1,
    default_duration_min: 75,
    default_price: 350,
    currency: 'CAD',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: '2026-08-02T10:00:00Z',
  },
  {
    id: 'st-2',
    category_id: 'cat-2',
    category_name: 'Handbag Leather Restoration',
    name: 'Hermès & Chanel Artisanal Leather Clinic',
    slug: 'artisanal-leather-clinic',
    description: 'Hands-on restoration workshop with master leather craftspeople using bespoke conditioning creams.',
    capacity: 6,
    default_duration_min: 90,
    default_price: 450,
    currency: 'CAD',
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: '2026-08-06T10:00:00Z',
  },
  {
    id: 'st-3',
    category_id: 'cat-3',
    category_name: 'Private VIP Archival Viewings',
    name: 'Rare Vault Champagne & Archival Soirée',
    slug: 'rare-vault-soiree',
    description: 'Curated evening tasting vintage French champagne while inspecting museum-grade vintage handbag acquisitions.',
    capacity: 8,
    default_duration_min: 120,
    default_price: 600,
    currency: 'CAD',
    image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: '2026-08-11T10:00:00Z',
  },
]

export const INITIAL_SESSIONS: AdminSession[] = [
  {
    id: 'ses-1',
    session_type_id: 'st-2',
    category_name: 'Handbag Leather Restoration',
    title: 'Hermès Kelly & Birkin Patina Restoration Workshop',
    slug: 'hermes-patina-restoration-sep',
    description: 'Learn master artisan techniques for edge paint conditioning, Box calf rejuvenation, and gold hardware polishing.',
    location_type: 'studio',
    location_address: 'Caramel Vibe Flagship Studio, Suite 402',
    price: 450,
    currency: 'CAD',
    max_slots: 6,
    booked_slots: 3,
    start_time: '2026-09-08T14:00:00Z',
    end_time: '2026-09-08T15:30:00Z',
    is_ongoing: false,
    status: 'published',
    cancel_reason: null,
    cancelled_at: null,
    created_at: '2026-08-20T10:00:00Z',
  },
  {
    id: 'ses-2',
    session_type_id: 'st-3',
    category_name: 'Private VIP Archival Viewings',
    title: 'Vintage Chanel 1980s–1990s 24K Gold Hardware Vault Salon',
    slug: 'vintage-chanel-gold-vault',
    description: 'Exclusive private group viewing of Karl Lagerfeld era 24K heavy gold plated flap bags and rare evening clutches.',
    location_type: 'studio',
    location_address: 'Caramel Vibe Private Vault Room, Salon B',
    price: 600,
    currency: 'CAD',
    max_slots: 4,
    booked_slots: 4,
    start_time: '2026-09-10T18:00:00Z',
    end_time: '2026-09-10T20:00:00Z',
    is_ongoing: false,
    status: 'full',
    cancel_reason: null,
    cancelled_at: null,
    created_at: '2026-08-22T11:00:00Z',
  },
  {
    id: 'ses-3',
    session_type_id: 'st-1',
    category_name: 'Bespoke Vintage Styling',
    title: 'Autumn Bespoke Handbag & Archival Silk Styling Consultation',
    slug: 'autumn-bespoke-styling',
    description: 'Curate your fall capsule wardrobe paired with authenticated luxury vintage leather pieces.',
    location_type: 'studio',
    location_address: 'Caramel Vibe Flagship Studio, Suite 402',
    price: 350,
    currency: 'CAD',
    max_slots: 3,
    booked_slots: 2,
    start_time: '2026-09-12T11:00:00Z',
    end_time: '2026-09-12T12:15:00Z',
    is_ongoing: false,
    status: 'published',
    cancel_reason: null,
    cancelled_at: null,
    created_at: '2026-08-25T14:00:00Z',
  },
  {
    id: 'ses-4',
    session_type_id: 'st-1',
    category_name: 'Bespoke Vintage Styling',
    title: 'Private Trunk Show & Custom Monogram Preview',
    slug: 'private-trunk-show-monogram',
    description: 'Preview unreleased vintage archive pieces before public catalog release with complimentary hot-stamping consultation.',
    location_type: 'studio',
    location_address: 'Caramel Vibe Flagship Studio, Suite 402',
    price: 250,
    currency: 'CAD',
    max_slots: 8,
    booked_slots: 0,
    start_time: '2026-09-18T16:00:00Z',
    end_time: '2026-09-18T17:30:00Z',
    is_ongoing: false,
    status: 'draft',
    cancel_reason: null,
    cancelled_at: null,
    created_at: '2026-09-01T09:00:00Z',
  },
  {
    id: 'ses-5',
    session_type_id: 'st-2',
    category_name: 'Handbag Leather Restoration',
    title: 'Exotic Leathers Masterclass: Crocodile, Ostrich & Lizard Care',
    slug: 'exotic-leathers-masterclass',
    description: 'Expert preservation and care seminar for rare exotic leather skins.',
    location_type: 'studio',
    location_address: 'Caramel Vibe Flagship Studio, Suite 402',
    price: 550,
    currency: 'CAD',
    max_slots: 5,
    booked_slots: 5,
    start_time: '2026-08-28T13:00:00Z',
    end_time: '2026-08-28T15:00:00Z',
    is_ongoing: false,
    status: 'completed',
    cancel_reason: null,
    cancelled_at: null,
    created_at: '2026-08-10T10:00:00Z',
  },
]

export const INITIAL_CLIENTS: AdminClient[] = [
  {
    id: 'usr-101',
    email: 'genevieve.laurent@parisien.fr',
    full_name: 'Genevieve Laurent',
    phone: '+1 (514) 892-4410',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    role: 'client',
    status: 'active',
    ban_reason: null,
    total_bookings: 4,
    total_spent: 1850,
    created_at: '2026-07-15T12:00:00Z',
    updated_at: '2026-09-04T10:30:00Z',
    last_active: '2 hours ago',
  },
  {
    id: 'usr-102',
    email: 'arthur.pendelton@montreal.ca',
    full_name: 'Arthur Pendelton',
    phone: '+1 (438) 330-9128',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    role: 'client',
    status: 'active',
    ban_reason: null,
    total_bookings: 3,
    total_spent: 1400,
    created_at: '2026-07-28T09:30:00Z',
    updated_at: '2026-09-03T15:12:00Z',
    last_active: 'Yesterday',
  },
  {
    id: 'usr-103',
    email: 'vivienne.vance@atelier-v.com',
    full_name: 'Vivienne Vance',
    phone: '+1 (416) 902-8812',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    role: 'client',
    status: 'active',
    ban_reason: null,
    total_bookings: 2,
    total_spent: 950,
    created_at: '2026-08-05T14:20:00Z',
    updated_at: '2026-09-02T18:45:00Z',
    last_active: '3 days ago',
  },
  {
    id: 'usr-104',
    email: 'claire.beauchamp@luxuryvault.ca',
    full_name: 'Claire Beauchamp',
    phone: '+1 (514) 771-0092',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    role: 'user',
    status: 'active',
    ban_reason: null,
    total_bookings: 0,
    total_spent: 0,
    created_at: '2026-08-30T11:15:00Z',
    updated_at: '2026-08-30T11:15:00Z',
    last_active: '5 days ago',
  },
  {
    id: 'usr-105',
    email: 'marcus.rossi@milanocouture.it',
    full_name: 'Marcus Rossi',
    phone: '+1 (604) 551-8274',
    avatar_url: null,
    role: 'user',
    status: 'banned',
    ban_reason: 'Multiple repeated no-shows on private vault viewings without cancellation notice.',
    total_bookings: 1,
    total_spent: 450,
    created_at: '2026-08-12T16:40:00Z',
    updated_at: '2026-08-29T14:10:00Z',
    last_active: '1 week ago',
  },
]

export const INITIAL_BOOKINGS: AdminBooking[] = [
  {
    id: 'bk-101',
    booking_number: 'CV-2026-0891',
    session_id: 'ses-1',
    session_title: 'Hermès Kelly & Birkin Patina Restoration Workshop',
    session_date: 'Sept 8, 2026 • 2:00 PM',
    user_id: 'usr-101',
    client_name: 'Genevieve Laurent',
    client_email: 'genevieve.laurent@parisien.fr',
    client_phone: '+1 (514) 892-4410',
    slots_booked: 1,
    total_price: 450,
    currency: 'CAD',
    status: 'confirmed',
    payment_status: 'paid_on_premise',
    payment_notes: 'Paid via boutique terminal upon studio arrival.',
    client_notes: 'Bringing 1994 Hermès Kelly 28 in Black Box calf for handle inspection.',
    admin_notes: 'VIP client. Prepare private champagne service.',
    cancel_reason: null,
    cancelled_at: null,
    check_in_time: '2026-09-08T13:52:00Z',
    created_at: '2026-08-24T15:20:00Z',
  },
  {
    id: 'bk-102',
    booking_number: 'CV-2026-0892',
    session_id: 'ses-1',
    session_title: 'Hermès Kelly & Birkin Patina Restoration Workshop',
    session_date: 'Sept 8, 2026 • 2:00 PM',
    user_id: 'usr-102',
    client_name: 'Arthur Pendelton',
    client_email: 'arthur.pendelton@montreal.ca',
    client_phone: '+1 (438) 330-9128',
    slots_booked: 2,
    total_price: 900,
    currency: 'CAD',
    status: 'confirmed',
    payment_status: 'pending_on_premise',
    payment_notes: 'Payment scheduled for in-person atelier check-in.',
    client_notes: 'Attending with partner.',
    admin_notes: 'Requested two side-by-side workstation seats.',
    cancel_reason: null,
    cancelled_at: null,
    check_in_time: null,
    created_at: '2026-08-25T18:40:00Z',
  },
  {
    id: 'bk-103',
    booking_number: 'CV-2026-0893',
    session_id: 'ses-2',
    session_title: 'Vintage Chanel 1980s–1990s 24K Gold Hardware Vault Salon',
    session_date: 'Sept 10, 2026 • 6:00 PM',
    user_id: 'usr-103',
    client_name: 'Vivienne Vance',
    client_email: 'vivienne.vance@atelier-v.com',
    client_phone: '+1 (416) 902-8812',
    slots_booked: 2,
    total_price: 1200,
    currency: 'CAD',
    status: 'confirmed',
    payment_status: 'paid_on_premise',
    payment_notes: 'Settled in advance via boutique concierge.',
    client_notes: 'Interested in acquiring 1989 Diana Flap with certificate.',
    admin_notes: 'Curator to pull item #CHAN-89-012 prior to session.',
    cancel_reason: null,
    cancelled_at: null,
    check_in_time: null,
    created_at: '2026-08-28T11:05:00Z',
  },
  {
    id: 'bk-106',
    booking_number: 'CV-2026-0896',
    session_id: 'ses-2',
    session_title: 'Vintage Chanel 1980s–1990s 24K Gold Hardware Vault Salon',
    session_date: 'Sept 10, 2026 • 6:00 PM',
    user_id: 'usr-101',
    client_name: 'Genevieve Laurent',
    client_email: 'genevieve.laurent@parisien.fr',
    client_phone: '+1 (514) 892-4410',
    slots_booked: 2,
    total_price: 1200,
    currency: 'CAD',
    status: 'confirmed',
    payment_status: 'paid_on_premise',
    payment_notes: 'Pre-authorized for private salon viewing.',
    client_notes: 'Attending with guest collector.',
    admin_notes: 'Prepare vault champagne tray.',
    cancel_reason: null,
    cancelled_at: null,
    check_in_time: null,
    created_at: '2026-08-29T16:20:00Z',
  },
  {
    id: 'bk-104',
    booking_number: 'CV-2026-0894',
    session_id: 'ses-3',
    session_title: 'Autumn Bespoke Handbag & Archival Silk Styling Consultation',
    session_date: 'Sept 12, 2026 • 11:00 AM',
    user_id: 'usr-101',
    client_name: 'Genevieve Laurent',
    client_email: 'genevieve.laurent@parisien.fr',
    client_phone: '+1 (514) 892-4410',
    slots_booked: 1,
    total_price: 350,
    currency: 'CAD',
    status: 'confirmed',
    payment_status: 'pending_on_premise',
    payment_notes: null,
    client_notes: 'Looking for caramel tone accessories to match autumn coats.',
    admin_notes: null,
    cancel_reason: null,
    cancelled_at: null,
    check_in_time: null,
    created_at: '2026-09-01T14:30:00Z',
  },
  {
    id: 'bk-107',
    booking_number: 'CV-2026-0897',
    session_id: 'ses-3',
    session_title: 'Autumn Bespoke Handbag & Archival Silk Styling Consultation',
    session_date: 'Sept 12, 2026 • 11:00 AM',
    user_id: 'usr-102',
    client_name: 'Arthur Pendelton',
    client_email: 'arthur.pendelton@montreal.ca',
    client_phone: '+1 (438) 330-9128',
    slots_booked: 1,
    total_price: 350,
    currency: 'CAD',
    status: 'confirmed',
    payment_status: 'paid_on_premise',
    payment_notes: 'Pre-paid during consultation intake.',
    client_notes: 'Seeking vintage briefcases.',
    admin_notes: null,
    cancel_reason: null,
    cancelled_at: null,
    check_in_time: null,
    created_at: '2026-09-02T10:15:00Z',
  },
  {
    id: 'bk-105',
    booking_number: 'CV-2026-0895',
    session_id: 'ses-5',
    session_title: 'Exotic Leathers Masterclass: Crocodile, Ostrich & Lizard Care',
    session_date: 'Aug 28, 2026 • 1:00 PM',
    user_id: 'usr-102',
    client_name: 'Arthur Pendelton',
    client_email: 'arthur.pendelton@montreal.ca',
    client_phone: '+1 (438) 330-9128',
    slots_booked: 2,
    total_price: 1100,
    currency: 'CAD',
    status: 'completed',
    payment_status: 'paid_on_premise',
    payment_notes: 'Paid via Visa on-premises.',
    client_notes: 'Great session.',
    admin_notes: 'Client expressed interest in future private viewings.',
    cancel_reason: null,
    cancelled_at: null,
    check_in_time: '2026-08-28T12:55:00Z',
    created_at: '2026-08-15T09:10:00Z',
  },
  {
    id: 'bk-108',
    booking_number: 'CV-2026-0898',
    session_id: 'ses-5',
    session_title: 'Exotic Leathers Masterclass: Crocodile, Ostrich & Lizard Care',
    session_date: 'Aug 28, 2026 • 1:00 PM',
    user_id: 'usr-101',
    client_name: 'Genevieve Laurent',
    client_email: 'genevieve.laurent@parisien.fr',
    client_phone: '+1 (514) 892-4410',
    slots_booked: 3,
    total_price: 1650,
    currency: 'CAD',
    status: 'completed',
    payment_status: 'paid_on_premise',
    payment_notes: 'Mastercard on-premise checkout.',
    client_notes: 'Attended with two junior curators.',
    admin_notes: null,
    cancel_reason: null,
    cancelled_at: null,
    check_in_time: '2026-08-28T12:58:00Z',
    created_at: '2026-08-16T11:00:00Z',
  },
]

export const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif-1',
    title: 'New VIP Appointment Booked',
    message: 'Genevieve Laurent booked "Autumn Bespoke Styling" for Sept 12.',
    type: 'booking',
    read: false,
    timestamp: '15 minutes ago',
  },
  {
    id: 'notif-2',
    title: 'Session Capacity Reached (100%)',
    message: '"Vintage Chanel 24K Gold Hardware Vault" is now completely full (4/4 slots).',
    type: 'waitlist',
    read: false,
    timestamp: '1 hour ago',
  },
  {
    id: 'notif-3',
    title: 'New Client Registration',
    message: 'Claire Beauchamp registered a new atelier member account.',
    type: 'client',
    read: true,
    timestamp: 'Yesterday at 4:30 PM',
  },
  {
    id: 'notif-4',
    title: 'On-Premise Payment Settled',
    message: 'Booking CV-2026-0891 confirmed as Paid on Premise ($450 CAD).',
    type: 'system',
    read: true,
    timestamp: '2 days ago',
  },
]

export const KPI_DATA: Record<string, KpiMetric[]> = {
  today: [
    {
      title: 'Today Expected Revenue',
      value: '$1,350 CAD',
      change: '+14.2% vs yesterday',
      trend: 'up',
      description: 'Pending & settled on-premise',
      iconName: 'dollar',
    },
    {
      title: 'Active Sessions Today',
      value: '2 Sessions',
      change: '88% fill rate',
      trend: 'up',
      description: '9 / 10 slots filled',
      iconName: 'calendar',
    },
    {
      title: 'Today Appointments',
      value: '9 Guests',
      change: '100% attendance expected',
      trend: 'up',
      description: '3 checked in so far',
      iconName: 'bookings',
    },
    {
      title: 'New Clients Today',
      value: '3 Members',
      change: '+1 vs avg',
      trend: 'up',
      description: 'Account registrations',
      iconName: 'users',
    },
  ],
  week: [
    {
      title: 'Weekly On-Premise Revenue',
      value: '$8,450 CAD',
      change: '+18.4% vs last week',
      trend: 'up',
      description: '100% in-person settlement mode',
      iconName: 'dollar',
    },
    {
      title: 'Published Studio Sessions',
      value: '5 Sessions',
      change: '83% average capacity',
      trend: 'up',
      description: '16 / 19 total slots booked',
      iconName: 'calendar',
    },
    {
      title: 'Confirmed Reservations',
      value: '16 Bookings',
      change: '+22.5% vs last week',
      trend: 'up',
      description: 'Across styling & restoration',
      iconName: 'bookings',
    },
    {
      title: 'Active Client Directory',
      value: '42 Members',
      change: '+12.0% growth',
      trend: 'up',
      description: 'Verified atelier clients',
      iconName: 'users',
    },
  ],
  month: [
    {
      title: 'Monthly Total Volume',
      value: '$24,800 CAD',
      change: '+26.8% vs last month',
      trend: 'up',
      description: 'Total atelier revenue volume',
      iconName: 'dollar',
    },
    {
      title: 'Sessions Hosted',
      value: '18 Sessions',
      change: '92% overall capacity',
      trend: 'up',
      description: 'Vintage boutique workshops',
      iconName: 'calendar',
    },
    {
      title: 'Total Monthly Bookings',
      value: '64 Appointments',
      change: '+31.0% vs last month',
      trend: 'up',
      description: 'Private appointments',
      iconName: 'bookings',
    },
    {
      title: 'Total Registered Members',
      value: '156 Clients',
      change: '+19.2% YoY',
      trend: 'up',
      description: 'Active client network',
      iconName: 'users',
    },
  ],
  all: [
    {
      title: 'Lifetime Atelier Revenue',
      value: '$89,250 CAD',
      change: '+34.5% overall',
      trend: 'up',
      description: 'Total studio gross revenue',
      iconName: 'dollar',
    },
    {
      title: 'All-Time Sessions',
      value: '58 Sessions',
      change: '89% lifetime fill rate',
      trend: 'up',
      description: 'Completed & scheduled',
      iconName: 'calendar',
    },
    {
      title: 'Lifetime Bookings',
      value: '248 Appointments',
      change: '98% check-in rate',
      trend: 'up',
      description: 'Total reservations placed',
      iconName: 'bookings',
    },
    {
      title: 'Total Client Roster',
      value: '312 Members',
      change: '+42 VIP Tier',
      trend: 'up',
      description: 'Global luxury collectors',
      iconName: 'users',
    },
  ],
}

export const INITIAL_ACTIVITIES: AdminActivity[] = [
  {
    id: 'act-1',
    actor_type: 'client',
    actor_name: 'Genevieve Laurent',
    actor_email: 'genevieve.laurent@parisien.fr',
    actor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    action_type: 'booking_created',
    title: 'New Reservation Placed',
    description: 'Reserved 1 slot for "Autumn Bespoke Handbag & Archival Silk Styling Consultation" ($350 CAD).',
    target_id: 'bk-104',
    target_label: 'CV-2026-0894',
    timestamp: '15 minutes ago',
    created_at: '2026-09-07T19:05:00Z',
  },
  {
    id: 'act-2',
    actor_type: 'admin',
    actor_name: 'Atelier Director',
    actor_email: 'admin@caramelvibe.com',
    actor_avatar: null,
    action_type: 'booking_checked_in',
    title: 'Guest Attendance Checked In',
    description: 'Confirmed in-person arrival and workstation onboarding for booking CV-2026-0891.',
    target_id: 'bk-101',
    target_label: 'CV-2026-0891',
    timestamp: '42 minutes ago',
    created_at: '2026-09-07T18:38:00Z',
  },
  {
    id: 'act-3',
    actor_type: 'client',
    actor_name: 'Arthur Pendelton',
    actor_email: 'arthur.pendelton@montreal.ca',
    actor_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    action_type: 'booking_created',
    title: 'Dual-Seat Workshop Booking',
    description: 'Reserved 2 seats for "Hermès Kelly & Birkin Patina Restoration Workshop" ($900 CAD).',
    target_id: 'bk-102',
    target_label: 'CV-2026-0892',
    timestamp: '2 hours ago',
    created_at: '2026-09-07T17:20:00Z',
  },
  {
    id: 'act-4',
    actor_type: 'admin',
    actor_name: 'Atelier Director',
    actor_email: 'admin@caramelvibe.com',
    actor_avatar: null,
    action_type: 'session_created',
    title: 'New Studio Session Published',
    description: 'Scheduled "Private Trunk Show & Custom Monogram Preview" for September 18.',
    target_id: 'ses-4',
    target_label: 'Private Trunk Show',
    timestamp: '4 hours ago',
    created_at: '2026-09-07T15:15:00Z',
  },
  {
    id: 'act-5',
    actor_type: 'client',
    actor_name: 'Claire Beauchamp',
    actor_email: 'claire.beauchamp@luxuryvault.ca',
    actor_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    action_type: 'client_registered',
    title: 'New Member Account Created',
    description: 'Completed atelier member registration and email verification.',
    target_id: 'usr-104',
    target_label: 'Claire Beauchamp',
    timestamp: 'Yesterday at 4:30 PM',
    created_at: '2026-09-06T16:30:00Z',
  },
  {
    id: 'act-6',
    actor_type: 'admin',
    actor_name: 'Atelier Director',
    actor_email: 'admin@caramelvibe.com',
    actor_avatar: null,
    action_type: 'payment_updated',
    title: 'On-Premise Payment Settlement',
    description: 'Recorded $450 CAD boutique terminal settlement for Genevieve Laurent.',
    target_id: 'bk-101',
    target_label: 'CV-2026-0891',
    timestamp: 'Yesterday at 5:15 PM',
    created_at: '2026-09-06T17:15:00Z',
  },
  {
    id: 'act-7',
    actor_type: 'admin',
    actor_name: 'Atelier Director',
    actor_email: 'admin@caramelvibe.com',
    actor_avatar: null,
    action_type: 'setting_updated',
    title: 'Studio Parameters Updated',
    description: 'Adjusted maximum advance reservation window to 30 calendar days.',
    target_id: 'max_booking_days_advance',
    target_label: 'App Settings',
    timestamp: '2 days ago',
    created_at: '2026-09-05T11:00:00Z',
  },
  {
    id: 'act-8',
    actor_type: 'client',
    actor_name: 'Vivienne Vance',
    actor_email: 'vivienne.vance@atelier-v.com',
    actor_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    action_type: 'booking_created',
    title: 'VIP Vault Soirée Reservation',
    description: 'Secured exclusive viewing seat for "Vintage Chanel 1980s–1990s 24K Gold Hardware Vault Salon" ($600 CAD).',
    target_id: 'bk-103',
    target_label: 'CV-2026-0893',
    timestamp: '2 days ago',
    created_at: '2026-09-05T14:40:00Z',
  },
  {
    id: 'act-9',
    actor_type: 'admin',
    actor_name: 'Atelier Director',
    actor_email: 'admin@caramelvibe.com',
    actor_avatar: null,
    action_type: 'client_status_changed',
    title: 'Client Moderation Action',
    description: 'Restricted account access for Marcus Rossi due to repeated session no-shows without notice.',
    target_id: 'usr-105',
    target_label: 'Marcus Rossi',
    timestamp: '3 days ago',
    created_at: '2026-09-04T10:10:00Z',
  },
]

