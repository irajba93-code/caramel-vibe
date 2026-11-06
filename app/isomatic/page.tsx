'use client'

import React, { useState } from 'react'
import { IsomaticTriage } from '@/components/triage/IsomaticTriage'
import type { TriageRecommendation, TriageAnswers } from '@/components/triage/IsomaticTriage'
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Calendar,
  X,
  HeartHandshake,
} from 'lucide-react'

export default function IsomaticTriageShowcasePage() {
  const [selectedBooking, setSelectedBooking] = useState<{
    recommendation: TriageRecommendation
    answers: TriageAnswers
  } | null>(null)

  const handleBookingClick = (
    recommendation: TriageRecommendation,
    answers: TriageAnswers
  ) => {
    setSelectedBooking({ recommendation, answers })
  }

  return (
    <div className="min-h-screen bg-[#f8f3eb] text-[#3b2720] flex flex-col font-sans selection:bg-[#c99555] selection:text-[#3b2720]">
      {/* Top Announcement Bar */}
      <div className="bg-[#a85d35] text-[#fffaf3] px-4 py-2 text-center text-xs font-medium tracking-wide">
        Direct Billing Available for Canada Life, Sun Life, Manulife & Major Insurers • Accepting New Patients
      </div>

      {/* Main Clinic Header */}
      <header className="border-b border-[#dfcdbb] bg-[#fffaf3]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#a85d35] text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              I
            </div>
            <div>
              <span className="block font-serif font-bold text-lg sm:text-xl tracking-tight text-[#3b2720]">
                ISOMATIC
              </span>
              <span className="block text-[10px] font-bold tracking-widest uppercase text-[#a85d35]">
                Integrative Health Centre
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#806d61]">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#a85d35]" />
              Yorkville & Downtown Toronto
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#a85d35]" />
              Mon–Sat: 8am – 7pm
            </span>
            <a
              href="tel:4165550198"
              className="flex items-center gap-1.5 text-[#a85d35] hover:text-[#924f2c] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              (416) 555-0198
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a85d35]/10 border border-[#a85d35]/20 text-[#a85d35] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Care Concierge</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#3b2720] tracking-tight leading-tight">
            Personalized Clinical Care, Tailored in Seconds.
          </h1>

          <p className="text-sm sm:text-base text-[#806d61] leading-relaxed">
            Match with our manual osteopaths, orthopedic physiotherapists, or registered massage therapists based on your exact symptom profile and insurance pool.
          </p>
        </div>

        {/* Embeddable Isomatic Triage Component */}
        <section aria-label="Patient Triage">
          <IsomaticTriage
            onBookingClick={handleBookingClick}
            phoneContact="(416) 555-0198"
          />
        </section>

        {/* Trust & Accreditations Banner */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-[#dfcdbb]/70">
          <div className="bg-[#fffaf3] p-5 rounded-2xl border border-[#dfcdbb] flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#a85d35]/10 text-[#a85d35] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#3b2720]">Direct Insurer Billing</h4>
              <p className="text-xs text-[#806d61] mt-0.5 leading-relaxed">
                Direct billing submitted electronically for Sun Life, Canada Life, Manulife, Desjardins, and Telus Health.
              </p>
            </div>
          </div>

          <div className="bg-[#fffaf3] p-5 rounded-2xl border border-[#dfcdbb] flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#a85d35]/10 text-[#a85d35] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#3b2720]">Root-Cause Diagnostics</h4>
              <p className="text-xs text-[#806d61] mt-0.5 leading-relaxed">
                Uncompromising 1-on-1 private rooms. No double booking, no generic exercise handouts.
              </p>
            </div>
          </div>

          <div className="bg-[#fffaf3] p-5 rounded-2xl border border-[#dfcdbb] flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#a85d35]/10 text-[#a85d35] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#3b2720]">Integrative Collaboration</h4>
              <p className="text-xs text-[#806d61] mt-0.5 leading-relaxed">
                Seamless internal co-management across Osteopathy, Physiotherapy, and Registered Massage Therapy.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Assessment Booking Modal (Triggered by onBookingClick) */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-[#fffaf3] rounded-3xl border border-[#dfcdbb] shadow-2xl overflow-hidden p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-[#806d61] hover:text-[#3b2720] hover:bg-[#eadfd2] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#a85d35]/15 text-[#a85d35] text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>Assessment Reservation</span>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-[#3b2720]">
                  {selectedBooking.recommendation.visitType}
                </h3>
                <p className="text-xs text-[#a85d35] font-semibold mt-0.5">
                  Lead Clinician: {selectedBooking.recommendation.practitioner}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#f8f3eb] border border-[#dfcdbb] text-xs space-y-2 text-[#3b2720]">
                <p className="font-medium">
                  <strong>Duration:</strong> {selectedBooking.recommendation.duration}
                </p>
                <p>
                  <strong>Insurance Note:</strong> {selectedBooking.recommendation.benefitsNote}
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-[#a85d35] font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Direct billing available for this practitioner</span>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  alert(
                    `Appointment confirmed for ${selectedBooking.recommendation.visitType} with ${selectedBooking.recommendation.practitioner}!`
                  )
                  setSelectedBooking(null)
                }}
                className="space-y-3 pt-2"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#3b2720] mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Smith"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfcdbb] bg-white text-sm text-[#3b2720] focus:outline-none focus:ring-2 focus:ring-[#a85d35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3b2720] mb-1">
                    Phone / Email
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. jordan@example.com or 416-555-0199"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfcdbb] bg-white text-sm text-[#3b2720] focus:outline-none focus:ring-2 focus:ring-[#a85d35]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#a85d35] hover:bg-[#924f2c] text-white font-bold text-sm uppercase tracking-wider transition-colors shadow-md mt-2 cursor-pointer"
                >
                  Confirm Assessment Slot
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-[#dfcdbb] bg-[#fffaf3] py-6 text-center text-xs text-[#806d61]">
        <div className="max-w-6xl mx-auto px-4">
          <p>© {new Date().getFullYear()} ISOMATIC Integrative Health Centre. All rights reserved.</p>
          <p className="mt-1 text-[11px] text-[#806d61]/70">
            Manual Osteopathy • Orthopedic Physiotherapy • Registered Massage Therapy • Metabolic Baseline
          </p>
        </div>
      </footer>
    </div>
  )
}
