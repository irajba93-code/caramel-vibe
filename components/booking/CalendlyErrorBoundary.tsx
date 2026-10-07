'use client'

import React from 'react'
import { Calendar, ExternalLink, MessageCircle, RefreshCw } from 'lucide-react'

interface CalendlyErrorBoundaryProps {
  fallbackUrl: string
  onRetry?: () => void
}

export function CalendlyErrorBoundary({ fallbackUrl, onRetry }: CalendlyErrorBoundaryProps) {
  return (
    <div className="rounded-3xl border border-border bg-background p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 shadow-xs animate-in fade-in">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20 shadow-xs">

        <Calendar className="w-7 h-7" />
      </div>

      <div className="space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-[11px] font-bold uppercase tracking-wider">
          <span>Concierge Fallback</span>
        </div>
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          Schedule Your Atelier Session
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          Your browser privacy settings or content filter may be blocking the interactive scheduler. You can open our direct booking portal or connect with our master concierge team.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <span>Open Booking Window</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <a
          href="https://wa.me/93700000000?text=Hello%20Caramel%20Vibe%20Concierge,%20I%20would%20like%20to%20schedule%20a%20private%20atelier%20consultation."
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs"
        >
          <MessageCircle className="w-3.5 h-3.5 text-accent" />
          <span>WhatsApp Concierge</span>
        </a>
      </div>

      {onRetry && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try loading interactive view again</span>
          </button>
        </div>
      )}
    </div>
  )
}
