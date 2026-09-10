'use client'

import React, { useEffect } from 'react'
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Users,
  CheckCircle2,
  Download,
  Printer,
  ShieldCheck,
  QrCode,
} from 'lucide-react'
import { generateIcsFile } from '@/lib/client/calendarExport'
import { useToast } from '@/components/ui/ToastContext'

export interface ClientPassBooking {
  id: string
  booking_number: string
  slots_booked: number
  total_price: number
  currency: string
  status: string
  payment_status: string
  check_in_time: string | null
  client_notes: string | null
  created_at: string
  session: {
    id: string
    title: string
    category_name?: string
    description?: string | null
    start_time: string
    end_time: string
    location_address: string
    location_type: string
  }
}

interface ClientPassModalProps {
  booking: ClientPassBooking | null
  clientName: string
  clientEmail: string
  isOpen: boolean
  onClose: () => void
}

export function ClientPassModal({
  booking,
  clientName,
  clientEmail,
  isOpen,
  onClose,
}: ClientPassModalProps) {
  const { showToast } = useToast()

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
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !booking) return null

  const session = booking.session
  const startDate = new Date(session.start_time)
  const endDate = new Date(session.end_time)

  const handleDownloadCalendar = () => {
    try {
      generateIcsFile({
        title: session.title,
        description: `Caramel Vibe Atelier Appointment. Booking ref: ${booking.booking_number}. ${session.description || ''}`,
        location: session.location_address,
        startTime: session.start_time,
        endTime: session.end_time,
        bookingNumber: booking.booking_number,
      })
      showToast('Calendar event file downloaded.', 'success')
    } catch {
      showToast('Could not generate calendar file.', 'error')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Pass Modal Card */}
      <div className="relative w-full max-w-lg bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Top Gold Ribbon Accent */}
        <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-border flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Official Atelier Pass</span>
            </div>
            <h2 className="font-display font-bold text-2xl text-foreground">
              Atelier Access Pass
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Present this digital pass upon arrival at the studio concierge
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close pass modal"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pass Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Booking Reference Box */}
          <div className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Booking Reference
              </span>
              <div className="font-mono text-lg font-bold text-primary">
                {booking.booking_number}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                  booking.check_in_time
                    ? 'bg-[#3e6b48]/10 text-[#3e6b48] border-[#3e6b48]/25'
                    : 'bg-primary/10 text-primary border-primary/25'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>{booking.check_in_time ? 'Checked In' : 'Confirmed'}</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                {booking.payment_status === 'paid_on_premise'
                  ? 'Settled On-Premise'
                  : 'Pending On-Premise Settlement'}
              </span>
            </div>
          </div>

          {/* Session Details */}
          <div className="space-y-4">
            <div>
              {session.category_name && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/20">
                  {session.category_name}
                </span>
              )}
              <h3 className="font-display font-bold text-xl text-foreground mt-1.5">
                {session.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Date & Time */}
              <div className="p-3.5 rounded-xl bg-background/60 border border-border space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Scheduled Date</span>
                </div>
                <div className="font-bold text-foreground">
                  {startDate.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3 text-accent" />
                  <span>
                    {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                    {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Guest / Seat Allocation */}
              <div className="p-3.5 rounded-xl bg-background/60 border border-border space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                  <Users className="w-3.5 h-3.5 text-accent" />
                  <span>Party Allocation</span>
                </div>
                <div className="font-bold text-foreground">
                  {booking.slots_booked} {booking.slots_booked === 1 ? 'Guest Slot' : 'Guest Slots'}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  ${booking.total_price} {booking.currency} Total
                </div>
              </div>
            </div>

            {/* Studio Address */}
            <div className="p-3.5 rounded-xl bg-background/60 border border-border space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Atelier Location</span>
              </div>
              <div className="font-medium text-foreground">
                {session.location_address || 'Caramel Vibe Flagship Studio, Suite 402'}
              </div>
            </div>

            {/* Attendee Dossier Reference */}
            <div className="p-3.5 rounded-xl bg-background/60 border border-border text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Reserved For
                </span>
                <div className="font-bold text-foreground">{clientName || 'Atelier Client'}</div>
                <div className="text-[11px] text-muted-foreground">{clientEmail}</div>
              </div>
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            {/* QR Simulation / Digital Pass Stamp */}
            <div className="p-4 rounded-2xl bg-card border border-dashed border-border/80 text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-xl bg-background border border-border flex items-center justify-center text-primary shadow-xs">
                <QrCode className="w-8 h-8" />
              </div>
              <div className="font-mono text-[10px] text-muted-foreground tracking-widest">
                VERIFIED-CV-{booking.id.slice(0, 8).toUpperCase()}
              </div>
              <p className="text-[10px] text-muted-foreground max-w-xs mx-auto">
                Scan with studio concierge terminal for rapid attendance check-in.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-background border-t border-border flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCalendar}
              className="px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>Add to Calendar (.ics)</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Print</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer ml-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
