'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Loader2,
  Mail,
  Calendar,
  Info,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastContext'
import type { ClientPassBooking } from './ClientPassModal'

interface ClientCancelModalProps {
  booking: ClientPassBooking | null
  cancellationLeadHours?: number
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ClientCancelModal({
  booking,
  cancellationLeadHours = 24,
  isOpen,
  onClose,
  onSuccess,
}: ClientCancelModalProps) {
  const supabase = createClient()
  const { showToast } = useToast()

  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle Escape key to dismiss
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      setReason('')
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !booking) return null

  const session = booking.session
  const startTime = new Date(session.start_time).getTime()
  const now = Date.now()
  const diffHours = (startTime - now) / (1000 * 60 * 60)
  const isWithinLeadTime = diffHours >= cancellationLeadHours

  const handleConfirmCancellation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      showToast('Please specify a brief cancellation reason.', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const nowIso = new Date().toISOString()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // 1. Update booking record
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancel_reason: reason.trim(),
          cancelled_at: nowIso,
          cancelled_by: user?.id || null,
          updated_at: nowIso,
        })
        .eq('id', booking.id)

      if (bookingError) throw bookingError

      // 2. Decrement session booked_slots
      const { data: currentSession } = await supabase
        .from('sessions')
        .select('booked_slots')
        .eq('id', session.id)
        .single()

      if (currentSession) {
        const newBookedSlots = Math.max(0, (currentSession.booked_slots || 0) - booking.slots_booked)
        await supabase
          .from('sessions')
          .update({
            booked_slots: newBookedSlots,
            status: newBookedSlots === 0 ? 'published' : undefined,
            updated_at: nowIso,
          })
          .eq('id', session.id)
      }

      // 3. Log notification
      if (user?.email) {
        await supabase.from('system_notifications_log').insert({
          recipient_id: user.id,
          recipient_email: user.email,
          notification_type: 'booking_cancellation',
          channel: 'in_app',
          subject: `Reservation Cancelled: ${session.title}`,
          message: `Your appointment (#${booking.booking_number}) for ${session.title} on ${new Date(session.start_time).toLocaleDateString()} has been cancelled.`,
          status: 'sent',
          metadata: {
            booking_id: booking.id,
            booking_number: booking.booking_number,
            session_id: session.id,
            reason: reason.trim(),
          },
        })
      }

      showToast('Reservation successfully cancelled and slots released.', 'info')
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cancellation failed'
      showToast(`Error cancelling appointment: ${msg}`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#9e3b32]/10 text-[#9e3b32] border border-[#9e3b32]/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-foreground">
                Cancel Atelier Reservation
              </h2>
              <p className="text-xs text-muted-foreground">
                Booking Reference #{booking.booking_number}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-background border border-border space-y-2 text-xs">
            <div className="font-bold text-foreground">{session.title}</div>
            <div className="text-muted-foreground flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>
                {new Date(session.start_time).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                at {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
              <span>Reserved Allocation:</span>
              <span className="font-semibold text-foreground">
                {booking.slots_booked} {booking.slots_booked === 1 ? 'Slot' : 'Slots'} (${booking.total_price} {booking.currency})
              </span>
            </div>
          </div>

          {/* Cancellation Policy Window Check */}
          {!isWithinLeadTime ? (
            /* Late Cancellation Warning */
            <div className="p-4 rounded-2xl bg-[#9e3b32]/10 border border-[#9e3b32]/25 text-[#9e3b32] space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Atelier Lead Time Notice ({cancellationLeadHours}h Policy)</span>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                This appointment starts in less than {cancellationLeadHours} hours ({Math.max(0, Math.round(diffHours))}h remaining). Online self-service cancellations are locked within this window to protect atelier preparations.
              </p>
              <div className="pt-2 border-t border-[#9e3b32]/20 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Please reach out to atelier concierge:</span>
                <a
                  href="mailto:concierge@caramelvibe.com"
                  className="font-bold text-[#9e3b32] underline hover:opacity-80 flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>concierge@caramelvibe.com</span>
                </a>
              </div>
            </div>
          ) : (
            /* Policy Permitted Form */
            <form onSubmit={handleConfirmCancellation} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#3e6b48]/10 border border-[#3e6b48]/20 text-[#3e6b48] text-xs flex items-start gap-2">
                <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold">Cancellation is eligible.</span> You are requesting cancellation {Math.round(diffHours)} hours in advance (policy requirement: {cancellationLeadHours}h).
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  <span>Reason for Cancellation (Required)</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Schedule conflict, rescheduling to next week, traveling..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
                >
                  Keep Reservation
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !reason.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#9e3b32] hover:bg-[#9e3b32]/90 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <span>Confirm Cancellation</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {!isWithinLeadTime && (
          <div className="p-4 bg-background border-t border-border flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-bold uppercase tracking-wider transition-colors hover:bg-muted cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
