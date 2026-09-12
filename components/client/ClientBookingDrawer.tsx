'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Users,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  CreditCard,
  Info,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastContext'
import type { Session } from '@/lib/supabase/types'

interface ClientBookingDrawerProps {
  session: (Session & { category_name?: string }) | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ClientBookingDrawer({
  session,
  isOpen,
  onClose,
  onSuccess,
}: ClientBookingDrawerProps) {
  const supabase = createClient()
  const { showToast } = useToast()

  const [slots, setSlots] = useState(1)
  const [clientNotes, setClientNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form and handle Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      setSlots(1)
      setClientNotes('')
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !session) return null

  const availableSlots = Math.max(1, (session.max_slots || 1) - (session.booked_slots || 0))
  const maxSelectable = Math.min(4, availableSlots)
  const totalPrice = (session.price || 0) * slots
  const startDate = new Date(session.start_time)
  const endDate = new Date(session.end_time)

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        showToast('Please sign in to complete your reservation.', 'error')
        return
      }

      const bookingNumber = `BK-${Date.now().toString().slice(-6)}`
      const nowIso = new Date().toISOString()

      // 1. Create booking in Supabase
      const { error: bookingError } = await supabase.from('bookings').insert({
        booking_number: bookingNumber,
        session_id: session.id,
        user_id: user.id,
        slots_booked: slots,
        total_price: totalPrice,
        currency: session.currency || 'CAD',
        status: 'confirmed',
        payment_status: 'pending_on_premise',
        client_notes: clientNotes.trim() || null,
        created_at: nowIso,
        updated_at: nowIso,
      })

      if (bookingError) throw bookingError

      // 2. Increment session booked_slots
      const newBookedCount = (session.booked_slots || 0) + slots
      const newStatus = newBookedCount >= session.max_slots ? 'full' : 'published'

      await supabase
        .from('sessions')
        .update({
          booked_slots: newBookedCount,
          status: newStatus,
          updated_at: nowIso,
        })
        .eq('id', session.id)

      // 3. Insert notification record for real-time alerting
      if (user.email) {
        await supabase.from('system_notifications_log').insert({
          recipient_id: user.id,
          recipient_email: user.email,
          notification_type: 'booking_confirmation',
          channel: 'in_app',
          subject: `Atelier Reservation Confirmed: ${session.title}`,
          message: `Your booking (#${bookingNumber}) for ${slots} guest(s) on ${startDate.toLocaleDateString()} has been placed. Payment is settled on-premise.`,
          status: 'unread',
          metadata: {
            is_read: false,
            booking_number: bookingNumber,
            session_id: session.id,
            session_title: session.title,
            slots_booked: slots,
            total_price: totalPrice,
            currency: session.currency || 'CAD',
            created_at: nowIso,
          },
        })
      }

      // 4. Log to admin audit logs
      await supabase.from('admin_audit_logs').insert({
        admin_id: null,
        target_type: 'booking',
        target_id: bookingNumber,
        action: 'create_booking',
        reason: `Client ${user.email} confirmed reservation for session ${session.title}`,
        details: {
          booking_number: bookingNumber,
          session_id: session.id,
          user_id: user.id,
          slots_booked: slots,
          total_price: totalPrice,
        },
      })

      showToast(`Reservation #${bookingNumber} confirmed! Digital pass generated.`, 'success')
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reservation failed'
      showToast(`Failed to reserve session: ${msg}`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-10">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-border flex items-start justify-between bg-card">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3 h-3" />
                <span>Reserve Atelier Experience</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-foreground">
                Confirm Reservation
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close reservation drawer"
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form / Scrollable Content */}
          <form onSubmit={handleBookingSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Session Overview Card */}
            <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
              {session.category_name && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/20">
                  {session.category_name}
                </span>
              )}
              <h3 className="font-display font-bold text-lg text-foreground">
                {session.title}
              </h3>

              <div className="space-y-2 text-xs divide-y divide-border/60 pt-1">
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>Date & Time</span>
                  </span>
                  <span className="font-semibold text-foreground">
                    {startDate.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    • {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>Location</span>
                  </span>
                  <span className="font-medium text-foreground truncate max-w-[180px]">
                    {session.location_address || 'Flagship Studio'}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-accent" />
                    <span>Remaining Capacity</span>
                  </span>
                  <span className="font-bold text-primary">
                    {availableSlots} {availableSlots === 1 ? 'Slot Available' : 'Slots Available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Slots Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                <span>Number of Guest Slots</span>
                <span className="text-muted-foreground font-normal normal-case">
                  ${session.price} {session.currency} / person
                </span>
              </label>

              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: maxSelectable }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSlots(num)}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      slots === num
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-background hover:bg-muted text-foreground'
                    }`}
                  >
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Requests / Styling Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary" />
                <span>Special Requests / Atelier Notes (Optional)</span>
              </label>
              <textarea
                rows={3}
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="e.g. Inquiring about archival Kelly restoration, anniversary styling..."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground"
              />
            </div>

            {/* Settlement Policy Notice */}
            <div className="p-4 rounded-2xl bg-[#3e6b48]/10 border border-[#3e6b48]/20 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#3e6b48]">
                <CreditCard className="w-4 h-4" />
                <span>On-Premise Settlement Policy</span>
              </div>
              <p className="text-foreground/80 leading-relaxed text-[11px]">
                No upfront online charges. Your reservation is held immediately and settlement (${totalPrice} {session.currency}) is completed on-premise at the studio upon check-in.
              </p>
            </div>

            {/* VIP Role Elevation Explainer */}
            <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/25 text-xs flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-accent shrink-0" />
              <p className="text-[11px] text-foreground leading-relaxed">
                Placing this reservation will automatically elevate your account to <strong className="text-accent font-bold">Verified Atelier Client</strong> standing.
              </p>
            </div>

            {/* Price Summary & Submit */}
            <div className="pt-4 border-t border-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Total Due On-Premise
                </span>
                <span className="font-display font-bold text-2xl text-foreground">
                  ${totalPrice} <span className="text-xs font-sans text-muted-foreground">{session.currency}</span>
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming Pass...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Atelier Reservation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
