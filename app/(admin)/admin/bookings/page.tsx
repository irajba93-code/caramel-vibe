'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Plus,
  User,
  Calendar,
  X,
  MapPin,
  FileText,
  Save,
  Check,
  Ban,
  ArrowRight,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminDateFilter, DEFAULT_DATE_PRESETS } from '@/components/admin/AdminDateFilter'
import { SortableHeader } from '@/components/admin/SortableHeader'
import { matchesDateRange, sortItems } from '@/lib/admin/filterUtils'
import { useAdminMock } from '@/context/AdminMockContext'
import { AdminBooking } from '@/lib/admin/mockData'

export default function AdminBookingsPage() {
  const {
    bookings,
    addBooking,
    updateBookingPayment,
    checkInBooking,
    cancelBooking,
    updateBookingNotes,
    sessions,
    clients,
  } = useAdminMock()

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')

  // Date Range Filter State
  const [datePreset, setDatePreset] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Column Sorting State
  const [sortField, setSortField] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Selected Booking Drawer
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null)
  const [dossierOpen, setDossierOpen] = useState(false)
  const [adminNotesText, setAdminNotesText] = useState('')

  // Cancel Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReasonText, setCancelReasonText] = useState('')

  // Walk-in Booking Modal
  const [walkInModalOpen, setWalkInModalOpen] = useState(false)
  const [walkInForm, setWalkInForm] = useState({
    session_id: sessions[0]?.id || '',
    user_id: clients[0]?.id || '',
    client_name: clients[0]?.full_name || '',
    client_email: clients[0]?.email || '',
    client_phone: clients[0]?.phone || '',
    slots_booked: 1,
    payment_status: 'paid_on_premise' as AdminBooking['payment_status'],
    client_notes: 'Walk-in boutique client reservation',
    admin_notes: '',
  })

  // Global Escape key listener to dismiss any active drawer or modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDossierOpen(false)
        setCancelModalOpen(false)
        setWalkInModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      // Default to desc for prices, dates, and slots; asc for text names
      if (['total_price', 'slots_booked', 'created_at', 'session_date'].includes(field)) {
        setSortDirection('desc')
      } else {
        setSortDirection('asc')
      }
    }
  }

  // Filter & Sort Bookings
  const processedBookings = useMemo(() => {
    const filtered = bookings.filter((bk) => {
      const matchesStatus = statusFilter === 'all' || bk.status === statusFilter
      const matchesPayment = paymentFilter === 'all' || bk.payment_status === paymentFilter
      const matchesSearch =
        bk.booking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bk.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bk.client_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bk.session_title.toLowerCase().includes(searchQuery.toLowerCase())

      // Find linked session start_time if available for exact date matching
      const linkedSession = sessions.find((s) => s.id === bk.session_id)
      const targetDate = linkedSession?.start_time || bk.created_at

      const matchesDate = matchesDateRange(targetDate, datePreset, startDate, endDate)

      return matchesStatus && matchesPayment && matchesSearch && matchesDate
    })

    return sortItems<AdminBooking>(filtered, sortField, sortDirection, {
      session_date: (b) => {
        const s = sessions.find((x) => x.id === b.session_id)
        return s?.start_time || b.created_at
      },
      check_in_time: (b) => (b.check_in_time ? new Date(b.check_in_time).getTime() : 0),
    })
  }, [bookings, sessions, statusFilter, paymentFilter, searchQuery, datePreset, startDate, endDate, sortField, sortDirection])

  const openDossier = (bk: AdminBooking) => {
    setSelectedBooking(bk)
    setAdminNotesText(bk.admin_notes || '')
    setDossierOpen(true)
  }

  const handleSaveNotes = () => {
    if (!selectedBooking) return
    updateBookingNotes(selectedBooking.id, adminNotesText)
    setSelectedBooking((prev) => (prev ? { ...prev, admin_notes: adminNotesText } : null))
  }

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return
    cancelBooking(selectedBooking.id, cancelReasonText.trim() || 'Client requested cancellation')
    setSelectedBooking((prev) =>
      prev
        ? {
            ...prev,
            status: 'cancelled',
            cancel_reason: cancelReasonText.trim() || 'Client requested cancellation',
          }
        : null
    )
    setCancelModalOpen(false)
    setCancelReasonText('')
  }

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetSession = sessions.find((s) => s.id === walkInForm.session_id) || sessions[0]
    if (!targetSession) return

    addBooking({
      session_id: targetSession.id,
      session_title: targetSession.title,
      session_date: new Date(targetSession.start_time).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      user_id: walkInForm.user_id,
      client_name: walkInForm.client_name,
      client_email: walkInForm.client_email,
      client_phone: walkInForm.client_phone,
      slots_booked: walkInForm.slots_booked,
      total_price: targetSession.price * walkInForm.slots_booked,
      currency: targetSession.currency,
      status: 'confirmed',
      payment_status: walkInForm.payment_status,
      payment_notes: 'Walk-in client registered at studio front desk.',
      client_notes: walkInForm.client_notes,
      admin_notes: walkInForm.admin_notes,
      cancel_reason: null,
      cancelled_at: null,
    })

    setWalkInModalOpen(false)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setPaymentFilter('all')
    setDatePreset('all')
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Admin Header */}
      <AdminHeader
        breadcrumbs={[
          { label: 'Admin Console', href: '/admin/dashboard' },
          { label: 'Master Bookings Ledger' },
        ]}
        title="Master Bookings &amp; Attendance"
        subtitle="Track appointments, filter by date ranges, sort by columns, process in-person settlements, and perform check-ins."
        actionButton={{
          label: 'Record Booking',
          onClick: () => setWalkInModalOpen(true),
          icon: Plus,
        }}
      />

      {/* Main Content Area */}
      <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Search & Multi-Filters Control Panel */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by booking #, client, or session..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Booking Status Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground font-semibold text-[11px]">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>

              {/* Payment Status Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground font-semibold text-[11px]">Payment:</span>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="all">All Settlements</option>
                  <option value="paid_on_premise">Paid on Premise</option>
                  <option value="pending_on_premise">Pending on Premise</option>
                  <option value="waived">Waived / VIP</option>
                </select>
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
              label="Appointment Date"
            />

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-semibold text-[11px]">
                Showing <strong className="text-foreground">{processedBookings.length}</strong> of{' '}
                <strong className="text-foreground">{bookings.length}</strong> bookings
              </span>
              {(searchQuery || statusFilter !== 'all' || paymentFilter !== 'all' || datePreset !== 'all' || startDate || endDate) && (
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
        </div>

        {/* Bookings Ledger Table with Click-to-Sort Headers */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/70 text-muted-foreground uppercase font-bold tracking-wider text-[10px]">
                  <SortableHeader
                    field="client_name"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Booking &amp; Customer
                  </SortableHeader>

                  <SortableHeader
                    field="session_title"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Atelier Session
                  </SortableHeader>

                  <SortableHeader
                    field="session_date"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Appointment Date
                  </SortableHeader>

                  <SortableHeader
                    field="total_price"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Slots &amp; Price
                  </SortableHeader>

                  <SortableHeader
                    field="payment_status"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Settlement Status
                  </SortableHeader>

                  <SortableHeader
                    field="check_in_time"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Check-In
                  </SortableHeader>

                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {processedBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No bookings matching search and date filter criteria.
                    </td>
                  </tr>
                ) : (
                  processedBookings.map((bk) => (
                    <tr
                      key={bk.id}
                      onClick={() => openDossier(bk)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      {/* Booking & Customer */}
                      <td className="py-4 px-4 space-y-1">
                        <span className="font-mono text-xs font-bold text-primary">
                          {bk.booking_number}
                        </span>
                        <div className="font-bold text-foreground text-sm">{bk.client_name}</div>
                        <div className="text-[11px] text-muted-foreground">{bk.client_email}</div>
                      </td>

                      {/* Session */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="font-semibold text-foreground max-w-xs truncate">
                          {bk.session_title}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {bk.client_phone || 'No phone'}
                        </div>
                      </td>

                      {/* Appointment Date */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span>{bk.session_date}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Booked {new Date(bk.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Slots & Price */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-foreground text-sm">
                          ${bk.total_price} {bk.currency}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {bk.slots_booked} {bk.slots_booked > 1 ? 'slots' : 'slot'}
                        </div>
                      </td>

                      {/* Settlement */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={bk.payment_status}
                          onChange={(e) =>
                            updateBookingPayment(
                              bk.id,
                              e.target.value as AdminBooking['payment_status']
                            )
                          }
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                            bk.payment_status === 'paid_on_premise'
                              ? 'bg-[#3e6b48]/10 text-[#3e6b48] border-[#3e6b48]/30'
                              : bk.payment_status === 'pending_on_premise'
                              ? 'bg-accent/15 text-accent border-accent/30'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          <option value="paid_on_premise">Paid on Premise</option>
                          <option value="pending_on_premise">Pending Payment</option>
                          <option value="waived">Waived / VIP</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>

                      {/* Check-In */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        {bk.check_in_time ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#3e6b48]/10 text-[#3e6b48] text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Checked In</span>
                          </div>
                        ) : bk.status === 'cancelled' ? (
                          <span className="text-[10px] text-destructive font-bold uppercase tracking-wider">
                            Cancelled
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => checkInBooking(bk.id)}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Check In
                          </button>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            openDossier(bk)
                          }}
                          className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-primary transition-colors cursor-pointer shadow-2xs"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BOOKING DOSSIER SLIDE-OVER DRAWER */}
      {dossierOpen && selectedBooking && (
        <div
          onClick={() => setDossierOpen(false)}
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-card border-l border-border h-full overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl flex flex-col justify-between cursor-default"
          >
            <div className="space-y-6">
              {/* Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <span className="font-mono text-xs font-bold text-primary">
                    {selectedBooking.booking_number}
                  </span>
                  <h3 className="font-display font-bold text-xl text-foreground">
                    Appointment Dossier
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setDossierOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Tags */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                    selectedBooking.status === 'confirmed'
                      ? 'bg-[#3e6b48]/10 text-[#3e6b48] border-[#3e6b48]/30'
                      : selectedBooking.status === 'completed'
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-destructive/10 text-destructive border-destructive/30'
                  }`}
                >
                  Booking: {selectedBooking.status}
                </span>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                    selectedBooking.payment_status === 'paid_on_premise'
                      ? 'bg-[#3e6b48]/10 text-[#3e6b48] border-[#3e6b48]/30'
                      : 'bg-accent/15 text-accent border-accent/30'
                  }`}
                >
                  Settlement: {selectedBooking.payment_status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Client & Session Info Card */}
              <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Client Details
                  </div>
                  <div className="font-bold text-foreground text-sm">
                    {selectedBooking.client_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedBooking.client_email} • {selectedBooking.client_phone}
                  </div>
                </div>

                <div className="pt-2 border-t border-border space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Atelier Session
                  </div>
                  <div className="font-bold text-foreground text-sm">
                    {selectedBooking.session_title}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>{selectedBooking.session_date}</span>
                    <span>•</span>
                    <span>{selectedBooking.slots_booked} slots booked</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total In-Person Charge:</span>
                  <span className="font-display font-bold text-base text-foreground">
                    ${selectedBooking.total_price} {selectedBooking.currency}
                  </span>
                </div>
              </div>

              {/* Client Notes */}
              {selectedBooking.client_notes && (
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-1 text-xs">
                  <span className="font-bold text-accent uppercase tracking-wider text-[10px]">
                    Guest Special Requests / Notes
                  </span>
                  <p className="text-foreground italic">
                    &ldquo;{selectedBooking.client_notes}&rdquo;
                  </p>
                </div>
              )}

              {/* Private Admin Notes */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                  <span>Private Administrative Notes</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Internal only</span>
                </label>
                <textarea
                  rows={3}
                  value={adminNotesText}
                  onChange={(e) => setAdminNotesText(e.target.value)}
                  placeholder="Record champagne preferences, handbag provenance details, workstation setup..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>
              </div>

              {/* Actions Row */}
              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-foreground">
                    Operational Actions
                  </div>
                  {selectedBooking.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => setCancelModalOpen(true)}
                      className="text-xs font-semibold text-destructive hover:underline cursor-pointer"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>

                {!selectedBooking.check_in_time && selectedBooking.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => {
                      checkInBooking(selectedBooking.id)
                      setSelectedBooking((prev) =>
                        prev
                          ? { ...prev, check_in_time: new Date().toISOString(), status: 'completed' }
                          : null
                      )
                    }}
                    className="w-full py-3 rounded-xl bg-[#3e6b48] text-[#fffaf3] text-xs font-bold uppercase tracking-widest hover:bg-[#3e6b48]/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Guest Check-In</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL BOOKING MODAL */}
      {cancelModalOpen && selectedBooking && (
        <div
          onClick={() => setCancelModalOpen(false)}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card border border-destructive/40 rounded-2xl p-6 shadow-2xl space-y-4 cursor-default"
          >
            <div className="flex items-center gap-2 text-destructive font-bold text-base">
              <Ban className="w-5 h-5" />
              <span>Cancel Reservation {selectedBooking.booking_number}</span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Cancelling this reservation will release <span className="font-bold text-foreground">{selectedBooking.slots_booked} slot(s)</span> back to the session capacity.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Cancellation Reason
                </label>
                <textarea
                  rows={2}
                  required
                  value={cancelReasonText}
                  onChange={(e) => setCancelReasonText(e.target.value)}
                  placeholder="e.g. Client requested reschedule, travel conflict..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/40"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground cursor-pointer"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold uppercase tracking-wider hover:bg-destructive/90 transition-all cursor-pointer shadow-xs"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD WALK-IN BOOKING MODAL */}
      {walkInModalOpen && (
        <div
          onClick={() => setWalkInModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4 cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display font-bold text-lg text-foreground">
                Record Walk-In Atelier Appointment
              </h3>
              <button
                type="button"
                onClick={() => setWalkInModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-4">
              {/* Session select */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Atelier Session
                </label>
                <select
                  value={walkInForm.session_id}
                  onChange={(e) => setWalkInForm({ ...walkInForm, session_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} (${s.price} CAD - {s.max_slots - s.booked_slots} slots left)
                    </option>
                  ))}
                </select>
              </div>

              {/* Client Name & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Guest Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={walkInForm.client_name}
                    onChange={(e) => setWalkInForm({ ...walkInForm, client_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Guest Email
                  </label>
                  <input
                    type="email"
                    required
                    value={walkInForm.client_email}
                    onChange={(e) => setWalkInForm({ ...walkInForm, client_email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              {/* Slots & Payment Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Slots Booked
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={walkInForm.slots_booked}
                    onChange={(e) => setWalkInForm({ ...walkInForm, slots_booked: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Settlement Status
                  </label>
                  <select
                    value={walkInForm.payment_status}
                    onChange={(e) =>
                      setWalkInForm({
                        ...walkInForm,
                        payment_status: e.target.value as AdminBooking['payment_status'],
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="paid_on_premise">Paid on Premise</option>
                    <option value="pending_on_premise">Pending on Premise</option>
                    <option value="waived">Waived / VIP</option>
                  </select>
                </div>
              </div>

              {/* Client Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Front Desk Notes
                </label>
                <input
                  type="text"
                  value={walkInForm.client_notes}
                  onChange={(e) => setWalkInForm({ ...walkInForm, client_notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWalkInModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                >
                  Confirm Walk-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
