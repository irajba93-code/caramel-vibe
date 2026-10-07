'use client'

import React, { useEffect } from 'react'
import { X, Sparkles, ShieldCheck, Clock } from 'lucide-react'
import { CalendlyInlineWidget } from './CalendlyInlineWidget'
import type { CalendlyPrefillOptions } from '@/lib/calendly/types'
import { CALENDLY_DEFAULTS } from '@/lib/calendly/config'

export interface CalendlyModalProps {
  isOpen: boolean
  onClose: () => void
  url?: string
  prefill?: CalendlyPrefillOptions
  title?: string
  subtitle?: string
  onSuccess?: () => void
}

export function CalendlyModal({
  isOpen,
  onClose,
  url = CALENDLY_DEFAULTS.eventUrl,
  prefill,
  title = 'Book Private Atelier Consultation',
  subtitle = 'Select a date with our master curators for bespoke styling or leather authentication.',
  onSuccess,
}: CalendlyModalProps) {
  // ESC key and body scroll lock
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over Container */}
      <div className="relative w-full max-w-2xl bg-background border-l border-border h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-border flex items-start justify-between bg-background/95 backdrop-blur-md">
          <div className="space-y-1 pr-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Bespoke Concierge Service</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close booking modal"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-background">
          <CalendlyInlineWidget
            url={url}
            prefill={prefill}
            minHeight={680}
            backgroundColor="f8f3eb"
            textColor="3b2720"
            primaryColor="a85d35"
            hideGdprBanner={true}
            hideLandingPageDetails={true}
            onScheduled={() => {
              onSuccess?.()
              setTimeout(() => {
                onClose()
              }, 3000)
            }}
          />

          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border/80 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
              <span className="font-medium">100% Confidential</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border/80 shadow-2xs">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium">Instant Confirmation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
