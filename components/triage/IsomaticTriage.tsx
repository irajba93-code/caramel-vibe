'use client'

import React, { useState } from 'react'
import {
  Activity,
  Zap,
  Waves,
  HeartPulse,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Clock,
  FileCheck,
  Calendar,
  Building2,
  Stethoscope,
  ChevronRight,
  PhoneCall,
} from 'lucide-react'

/* ==========================================================================
   Type Definitions
   ========================================================================== */

export type ClinicalConcernId =
  | 'chronic-spine-joint'
  | 'acute-movement-injury'
  | 'deep-muscle-tension'
  | 'metabolic-health'

export type InsuranceCategoryId =
  | 'osteopathy-domp'
  | 'physiotherapy'
  | 'massage-rmt'
  | 'direct-billing-selfpay'

export interface TriageOption<T extends string> {
  id: T
  title: string
  subtitle: string
  icon: React.ElementType
  badge?: string
}

export interface TriageRecommendation {
  practitioner: string
  credentials: string
  visitType: string
  duration: string
  reasoning: string
  clinicalFocus: string[]
  benefitsNote: string
  directBillingAvailable: boolean
  bookingActionUrl?: string
  avatarInitials: string
}

export interface TriageAnswers {
  concern: ClinicalConcernId | null
  insurance: InsuranceCategoryId | null
}

export interface IsomaticTriageProps {
  /** Optional custom title override for the triage card */
  title?: string
  /** Optional custom subtitle override */
  subtitle?: string
  /** Custom destination for the Reserve Assessment button */
  bookingUrl?: string
  /** Callback fired when the primary CTA is triggered */
  onBookingClick?: (recommendation: TriageRecommendation, answers: TriageAnswers) => void
  /** Optional phone number for direct patient inquiries */
  phoneContact?: string
  /** Additional custom Tailwind CSS classes for the outer wrapper */
  className?: string
  /** Hide or show the clinic header badge */
  showHeaderBadge?: boolean
  /** Initial step to display (defaults to 1) */
  initialStep?: 1 | 2 | 3
}

/* ==========================================================================
   Step 1 & Step 2 Content Data
   ========================================================================== */

const CLINICAL_CONCERNS: TriageOption<ClinicalConcernId>[] = [
  {
    id: 'chronic-spine-joint',
    title: 'Chronic / Recurring Spine or Joint Pain',
    subtitle: 'Persistent spinal restriction, lower back aches, neck stiffness, or recurring joint wear lasting > 6 weeks.',
    icon: Activity,
    badge: 'Structural / Root-Cause',
  },
  {
    id: 'acute-movement-injury',
    title: 'Acute Movement Injury or Joint Restriction',
    subtitle: 'Recent sports sprain, sudden movement blockage, acute tendon strain, or sudden loss of functional range.',
    icon: Zap,
    badge: 'Rapid Rehab',
  },
  {
    id: 'deep-muscle-tension',
    title: 'Deep Muscle Tension & Neck/Back Stiffness',
    subtitle: 'High postural tone, desk-work tension headaches, upper trap knots, and stubborn myofascial tightness.',
    icon: Waves,
    badge: 'Soft-Tissue Relief',
  },
  {
    id: 'metabolic-health',
    title: 'Metabolic Health / Full Body Health Baseline',
    subtitle: 'Comprehensive somatic evaluation, autonomic regulation, whole-body mobility audit, and vitality baseline.',
    icon: HeartPulse,
    badge: 'Whole-Body Health',
  },
]

const INSURANCE_CATEGORIES: TriageOption<InsuranceCategoryId>[] = [
  {
    id: 'osteopathy-domp',
    title: 'Manual Osteopathy (DOMP)',
    subtitle: 'Gentle whole-body structural alignment, craniosacral & visceral mobilization. Extended health eligible.',
    icon: Stethoscope,
    badge: 'DOMP Coverage',
  },
  {
    id: 'physiotherapy',
    title: 'Physiotherapy',
    subtitle: 'Clinical biomechanics, active movement retraining, and joint stabilization. Extended health eligible.',
    icon: Activity,
    badge: 'PT Coverage',
  },
  {
    id: 'massage-rmt',
    title: 'Registered Massage Therapy (RMT)',
    subtitle: 'Therapeutic soft-tissue manipulation, myofascial release, and neuromuscular work. Extended health eligible.',
    icon: Waves,
    badge: 'RMT Coverage',
  },
  {
    id: 'direct-billing-selfpay',
    title: 'Direct Billing / Self-Pay (No Preference)',
    subtitle: 'Match me based purely on clinical efficacy. Direct submission available for major Canadian insurers.',
    icon: Building2,
    badge: 'All Insurers Welcome',
  },
]

/* ==========================================================================
   Clinical Recommendation Engine
   ========================================================================== */

export function calculateRecommendation(
  concern: ClinicalConcernId | null,
  insurance: InsuranceCategoryId | null,
  customBookingUrl?: string
): TriageRecommendation {
  const defaultBooking = customBookingUrl || '#book-assessment'

  // Primary Clinical Rule 1: Osteopathy / Chronic Spine & Joint Pain
  if (
    (concern === 'chronic-spine-joint' && (insurance === 'osteopathy-domp' || insurance === 'direct-billing-selfpay')) ||
    (insurance === 'osteopathy-domp' && concern !== 'acute-movement-injury')
  ) {
    return {
      practitioner: 'Andrew Chan, DOMP',
      credentials: 'Diploma in Osteopathic Manual Practice (DOMP) • Manual Osteopath',
      visitType: 'Root-Cause Assessment & Osteopathy',
      duration: '60 Minutes • Comprehensive Clinical Assessment & Hands-On Treatment',
      reasoning:
        'Andrew specializes in whole-body biomechanical relationships, addressing deep fascial restrictions and chronic spinal misalignments at their source rather than temporarily masking local symptoms.',
      clinicalFocus: [
        'Gentle craniosacral & visceral structural realignment',
        'Pelvic, sacral, and thoracic rib cage decompression',
        'Postural compensations driving recurring spinal strain',
        'Personalized somatic home movement integration',
      ],
      benefitsNote: 'Covered under Extended Health Care benefits for Manual Osteopathy (DOMP).',
      directBillingAvailable: true,
      bookingActionUrl: defaultBooking,
      avatarInitials: 'AC',
    }
  }

  // Primary Clinical Rule 2: Physio / Acute Movement Injury or Joint Restriction
  if (
    (concern === 'acute-movement-injury' && (insurance === 'physiotherapy' || insurance === 'direct-billing-selfpay')) ||
    (insurance === 'physiotherapy')
  ) {
    return {
      practitioner: 'Disha Patel, PT',
      credentials: 'Registered Physiotherapist (PT) • Orthopedic & Movement Specialist',
      visitType: 'Physiotherapy Initial Assessment',
      duration: '45–60 Minutes • Orthopedic Evaluation & Targeted Rehabilitation Plan',
      reasoning:
        'Disha combines orthopedic clinical diagnostics with targeted joint mobilization and active movement rehabilitation to rapidly reduce acute inflammation, protect vulnerable tissues, and restore functional mobility.',
      clinicalFocus: [
        'Targeted orthopedic joint & ligamentous stability testing',
        'Active range-of-motion recovery & progressive loading',
        'Mechanical muscle inhibition & neuromuscular reactivation',
        'Evidence-backed rapid return-to-sport or daily motion protocol',
      ],
      benefitsNote: 'Billed under Registered Physiotherapy extended health insurance.',
      directBillingAvailable: true,
      bookingActionUrl: defaultBooking,
      avatarInitials: 'DP',
    }
  }

  // Primary Clinical Rule 3: Muscle Tension / RMT
  if (
    (concern === 'deep-muscle-tension' && (insurance === 'massage-rmt' || insurance === 'direct-billing-selfpay')) ||
    (insurance === 'massage-rmt')
  ) {
    return {
      practitioner: 'Joey Dao, RMT',
      credentials: 'Registered Massage Therapist (RMT) • Myofascial Specialist',
      visitType: 'Targeted Therapeutic Massage',
      duration: '60 Minutes • Focused Neuromuscular Therapy & Soft-Tissue Decompression',
      reasoning:
        'Joey delivers clinical myofascial release and neuromuscular therapy targeting persistent trigger points, cervical strain, and compensatory muscle holding patterns for immediate decompression.',
      clinicalFocus: [
        'Deep trigger point therapy for neck, shoulder, and upper back knots',
        'Myofascial decompression & thoracic rib mobility restoration',
        'Nervous system down-regulation for stress-related tonicity',
        'Self-care postural releases and ergonomic recovery guidance',
      ],
      benefitsNote: 'Covered under Registered Massage Therapy (RMT) extended health plans.',
      directBillingAvailable: true,
      bookingActionUrl: defaultBooking,
      avatarInitials: 'JD',
    }
  }

  // Primary Clinical Rule 4: Metabolic Health / Full Body Health Baseline (Self-Pay or General)
  if (concern === 'metabolic-health') {
    return {
      practitioner: 'Andrew Chan, DOMP',
      credentials: 'Diploma in Osteopathic Manual Practice (DOMP) • Somatic Care Director',
      visitType: 'Root-Cause Assessment & Osteopathy',
      duration: '60 Minutes • Whole-Body Structural, Somatic & Autonomic Evaluation',
      reasoning:
        'Andrew conducts a systemic assessment evaluating diaphragmatic respiration, craniosacral rhythm, and autonomic nervous balance to establish a restorative baseline for chronic vitality and metabolic regulation.',
      clinicalFocus: [
        'Thoracic diaphragm & vagus nerve mobilization',
        'Systemic circulation, venous-lymphatic drainage audit',
        'Somatic tension storage and postural energy leakage mapping',
        'Integrative multi-practitioner collaborative roadmap',
      ],
      benefitsNote: 'Eligible for Manual Osteopathy extended insurance or direct health spending.',
      directBillingAvailable: true,
      bookingActionUrl: defaultBooking,
      avatarInitials: 'AC',
    }
  }

  // Fallback Safeguard (Defaults to Andrew Chan Root-Cause Osteopathy)
  return {
    practitioner: 'Andrew Chan, DOMP',
    credentials: 'Diploma in Osteopathic Manual Practice (DOMP) • Manual Osteopath',
    visitType: 'Root-Cause Assessment & Osteopathy',
    duration: '60 Minutes • Comprehensive Clinical Assessment & Hands-On Treatment',
    reasoning:
      'Andrew specializes in whole-body biomechanical relationships, addressing deep fascial restrictions and chronic spinal misalignments at their source rather than temporarily masking local symptoms.',
    clinicalFocus: [
      'Comprehensive whole-body posture and mechanical analysis',
      'Gentle joint realignment and fascial unwinding',
      'Root-cause resolution tailored to your personal physical demands',
    ],
    benefitsNote: 'Eligible for Extended Health Care benefits under Manual Osteopathy.',
    directBillingAvailable: true,
    bookingActionUrl: defaultBooking,
    avatarInitials: 'AC',
  }
}

/* ==========================================================================
   Main Component: IsomaticTriage
   ========================================================================== */

export function IsomaticTriage({
  title = 'Patient Care Triage',
  subtitle = 'Find the right practitioner, clinical approach, and insurance pathway in under 60 seconds.',
  bookingUrl,
  onBookingClick,
  phoneContact = '(416) 555-0198',
  className = '',
  showHeaderBadge = true,
  initialStep = 1,
}: IsomaticTriageProps) {
  const [step, setStep] = useState<1 | 2 | 3>(initialStep)
  const [concern, setConcern] = useState<ClinicalConcernId | null>(null)
  const [insurance, setInsurance] = useState<InsuranceCategoryId | null>(null)

  const recommendation = calculateRecommendation(concern, insurance, bookingUrl)

  const handleSelectConcern = (selectedId: ClinicalConcernId) => {
    setConcern(selectedId)
    setStep(2)
  }

  const handleSelectInsurance = (selectedId: InsuranceCategoryId) => {
    setInsurance(selectedId)
    setStep(3)
  }

  const handleReset = () => {
    setConcern(null)
    setInsurance(null)
    setStep(1)
  }

  const handlePrimaryCta = () => {
    if (onBookingClick) {
      onBookingClick(recommendation, { concern, insurance })
      return
    }

    if (recommendation.bookingActionUrl?.startsWith('http') || recommendation.bookingActionUrl?.startsWith('/')) {
      window.location.href = recommendation.bookingActionUrl
      return
    }

    // Default smooth scroll to any booking element on the page, or fallback alert
    const targetElement = document.getElementById('booking-section') || document.getElementById('consultation-widget')
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = '#reserve'
    }
  }

  return (
    <div
      className={`w-full max-w-2xl mx-auto rounded-3xl bg-[#fffaf3] border border-[#dfcdbb] shadow-xl overflow-hidden text-[#3b2720] transition-all duration-300 ${className}`}
      data-testid="isomatic-triage-card"
    >
      {/* ------------------------------------------------------------------
          Card Header & Brand Banner
          ------------------------------------------------------------------ */}
      <div className="relative px-6 py-7 sm:px-8 sm:py-8 bg-[#f8f3eb] border-b border-[#dfcdbb] overflow-hidden">
        {/* Subtle Decorative Ambient Glow */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#a85d35]/10 blur-2xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-[#c99555]/15 blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 space-y-2">
          {showHeaderBadge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a85d35]/10 border border-[#a85d35]/20 text-[#a85d35] text-[11px] font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#a85d35]" />
              <span>ISOMATIC Integrative Health Centre</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#3b2720] tracking-tight">
              {title}
            </h2>
            <span className="text-xs font-semibold text-[#a85d35] uppercase tracking-wider">
              Step {step} of 3
            </span>
          </div>

          <p className="text-sm text-[#806d61] leading-relaxed max-w-xl">
            {subtitle}
          </p>
        </div>

        {/* Step Progress Indicator Bar */}
        <div className="mt-5 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: 1, label: 'Clinical Concern' },
              { num: 2, label: 'Benefit / Insurance' },
              { num: 3, label: 'Recommendation' },
            ].map((s) => {
              const isCurrent = step === s.num
              const isPassed = step > s.num
              return (
                <div key={s.num} className="flex flex-col gap-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      isPassed
                        ? 'bg-[#a85d35]'
                        : isCurrent
                        ? 'bg-[#c99555]'
                        : 'bg-[#dfcdbb]/60'
                    }`}
                  />
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold tracking-wide uppercase transition-colors ${
                        isCurrent
                          ? 'text-[#a85d35]'
                          : isPassed
                          ? 'text-[#3b2720]'
                          : 'text-[#806d61]/60'
                      }`}
                    >
                      {s.num}. {s.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          Card Body: Dynamic Step Content
          ------------------------------------------------------------------ */}
      <div className="p-6 sm:p-8">
        {/* ================= STEP 1: Clinical Concern ================= */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#a85d35]">
                Step 1
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#3b2720] mt-0.5">
                What is your primary clinical concern?
              </h3>
              <p className="text-xs sm:text-sm text-[#806d61] mt-1">
                Select the symptom pattern or health goal that best describes what brings you to ISOMATIC today.
              </p>
            </div>

            <div className="space-y-3">
              {CLINICAL_CONCERNS.map((item) => {
                const IconComponent = item.icon
                const isSelected = concern === item.id

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectConcern(item.id)}
                    className={`group w-full p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                      isSelected
                        ? 'bg-[#f8f3eb] border-[#a85d35] ring-2 ring-[#a85d35]/30 shadow-sm'
                        : 'bg-white border-[#dfcdbb] hover:border-[#a85d35]/70 hover:bg-[#fffaf3] hover:shadow-md'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#a85d35] text-white'
                          : 'bg-[#f8f3eb] text-[#a85d35] group-hover:bg-[#a85d35] group-hover:text-white'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm sm:text-base text-[#3b2720] group-hover:text-[#a85d35] transition-colors">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f8f3eb] text-[#806d61] border border-[#dfcdbb]">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#806d61] leading-relaxed">
                        {item.subtitle}
                      </p>
                    </div>

                    <div className="shrink-0 self-center pl-1 text-[#dfcdbb] group-hover:text-[#a85d35] transition-transform group-hover:translate-x-1">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 2: Benefit / Insurance Category ================= */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#a85d35]">
                Step 2
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#3b2720] mt-0.5">
                Select your benefit or insurance category
              </h3>
              <p className="text-xs sm:text-sm text-[#806d61] mt-1">
                Help us align your clinical protocol with your extended health coverage or billing preferences.
              </p>
            </div>

            <div className="space-y-3">
              {INSURANCE_CATEGORIES.map((item) => {
                const IconComponent = item.icon
                const isSelected = insurance === item.id

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectInsurance(item.id)}
                    className={`group w-full p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                      isSelected
                        ? 'bg-[#f8f3eb] border-[#a85d35] ring-2 ring-[#a85d35]/30 shadow-sm'
                        : 'bg-white border-[#dfcdbb] hover:border-[#a85d35]/70 hover:bg-[#fffaf3] hover:shadow-md'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#a85d35] text-white'
                          : 'bg-[#f8f3eb] text-[#a85d35] group-hover:bg-[#a85d35] group-hover:text-white'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm sm:text-base text-[#3b2720] group-hover:text-[#a85d35] transition-colors">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f8f3eb] text-[#806d61] border border-[#dfcdbb]">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#806d61] leading-relaxed">
                        {item.subtitle}
                      </p>
                    </div>

                    <div className="shrink-0 self-center pl-1 text-[#dfcdbb] group-hover:text-[#a85d35] transition-transform group-hover:translate-x-1">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Back Button */}
            <div className="pt-2 flex items-center justify-between border-t border-[#dfcdbb]/60">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#806d61] hover:text-[#a85d35] transition-colors py-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Clinical Concern</span>
              </button>

              {concern && (
                <span className="text-[11px] text-[#806d61] hidden sm:inline">
                  Selected: <strong className="text-[#3b2720]">{CLINICAL_CONCERNS.find((c) => c.id === concern)?.title.split(' ')[0]}...</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 3: Recommendation Screen ================= */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Top Match Card */}
            <div className="rounded-2xl border border-[#a85d35]/30 bg-gradient-to-br from-[#f8f3eb] via-[#fffaf3] to-[#f4ebe1] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#a85d35] text-white text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                  <Sparkles className="w-3 h-3" />
                  <span>Optimal Clinical Match</span>
                </div>

                <div className="text-[11px] font-medium text-[#806d61] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#a85d35]" />
                  <span>Private 1-on-1 Suite</span>
                </div>
              </div>

              {/* Practitioner Banner */}
              <div className="flex items-center gap-4 pt-1">
                <div className="w-14 h-14 rounded-2xl bg-[#a85d35] text-[#fffaf3] flex items-center justify-center font-serif text-lg font-bold shadow-sm shrink-0 border border-[#dfcdbb]">
                  {recommendation.avatarInitials}
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#3b2720] leading-tight">
                    {recommendation.practitioner}
                  </h3>
                  <p className="text-xs text-[#a85d35] font-semibold mt-0.5">
                    {recommendation.credentials}
                  </p>
                  <p className="text-xs text-[#806d61] mt-0.5 font-medium">
                    Recommended Visit: <span className="text-[#3b2720] font-semibold">{recommendation.visitType}</span>
                  </p>
                </div>
              </div>

              {/* Duration pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 border border-[#dfcdbb] text-xs text-[#3b2720]">
                <Clock className="w-3.5 h-3.5 text-[#c99555]" />
                <span className="font-medium">{recommendation.duration}</span>
              </div>

              {/* Clinical Reasoning Section */}
              <div className="rounded-xl bg-white/90 border border-[#dfcdbb] p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#a85d35]">
                  <CheckCircle2 className="w-4 h-4 text-[#a85d35]" />
                  <span>Clinical Reasoning & Care Rationale</span>
                </div>
                <p className="text-xs sm:text-sm text-[#3b2720] leading-relaxed">
                  {recommendation.reasoning}
                </p>
              </div>

              {/* What to Expect Bullets */}
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#806d61]">
                  What your assessment includes:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recommendation.clinicalFocus.map((focusItem, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-[#3b2720] leading-snug bg-white/60 p-2.5 rounded-lg border border-[#dfcdbb]/60"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-[#a85d35] shrink-0 mt-0.5" />
                      <span>{focusItem}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Insurance note */}
              <div className="p-3 rounded-xl bg-[#c99555]/10 border border-[#c99555]/30 text-xs text-[#3b2720] flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-[#a85d35] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-semibold text-[#a85d35]">Coverage Note: </strong>
                  <span>{recommendation.benefitsNote}</span>
                </div>
              </div>
            </div>

            {/* Primary Action Button (Reserve Assessment) */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handlePrimaryCta}
                className="group w-full py-4 px-6 rounded-2xl bg-[#a85d35] hover:bg-[#924f2c] active:scale-[0.99] text-[#fffaf3] font-bold text-sm sm:text-base tracking-wide uppercase transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#fffaf3]/90" />
                <span>Reserve Assessment</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Trust Badge */}
              <div className="rounded-xl bg-[#f8f3eb] border border-[#dfcdbb] p-3 text-center space-y-1.5">
                <div className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#3b2720]">
                  <ShieldCheck className="w-4 h-4 text-[#a85d35]" />
                  <span>Direct billing available for major Canadian insurers</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#806d61] pt-0.5">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#dfcdbb] font-medium text-[#3b2720]">
                    Canada Life
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#dfcdbb] font-medium text-[#3b2720]">
                    Sun Life
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#dfcdbb] font-medium text-[#3b2720]">
                    Manulife
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#dfcdbb] font-medium text-[#3b2720]">
                    Telus Health
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#dfcdbb] font-medium text-[#3b2720]">
                    Blue Cross
                  </span>
                </div>
              </div>

              {/* Footer Utility Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#806d61]">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 font-medium hover:text-[#a85d35] transition-colors py-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart Triage or Change Answers</span>
                </button>

                {phoneContact && (
                  <a
                    href={`tel:${phoneContact.replace(/[^\d+]/g, '')}`}
                    className="inline-flex items-center gap-1.5 font-medium hover:text-[#a85d35] transition-colors py-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#a85d35]" />
                    <span>Questions? Call {phoneContact}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default IsomaticTriage
