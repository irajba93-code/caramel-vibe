'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'

export function CalendlySkeleton() {
  return (
    <div
      className="w-full h-full min-h-[700px] bg-background rounded-3xl p-6 sm:p-8 flex flex-col justify-between animate-pulse select-none"
      aria-busy="true"
      aria-label="Loading Calendly scheduler"
    >

      {/* Top Header Placeholder */}
      <div className="space-y-4 pb-6 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-28 bg-muted rounded-full" />
              <div className="h-4 w-44 bg-muted/80 rounded-md" />
            </div>
          </div>
          <div className="h-6 w-24 bg-accent/20 rounded-full" />
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <div className="h-6 w-20 bg-muted/70 rounded-lg" />
          <div className="h-6 w-32 bg-muted/70 rounded-lg" />
          <div className="h-6 w-28 bg-muted/70 rounded-lg" />
        </div>
      </div>

      {/* Main Calendar Body Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 my-6 flex-1 items-start">
        {/* Left / Calendar Date Picker Area */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="h-5 w-36 bg-muted rounded-md" />
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-xl bg-muted/70" />
              <div className="w-8 h-8 rounded-xl bg-muted/70" />
            </div>
          </div>

          {/* Day of Week Labels */}
          <div className="grid grid-cols-7 gap-2 text-center pt-2">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
              <div key={d} className="h-3 w-6 mx-auto bg-muted/60 rounded-full" />
            ))}
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-7 gap-2.5 pt-2">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className={`h-10 rounded-2xl flex items-center justify-center transition-all ${
                  i % 4 === 1
                    ? 'bg-primary/20 border border-primary/30'
                    : i % 3 === 0
                    ? 'bg-muted/80'
                    : 'bg-muted/40'
                }`}
              />
            ))}
          </div>

          {/* Timezone Indicator */}
          <div className="flex items-center gap-2 pt-4 px-2">
            <div className="w-4 h-4 rounded-full bg-muted/80" />
            <div className="h-3 w-40 bg-muted/70 rounded-md" />
          </div>
        </div>

        {/* Right / Time Slots Column */}
        <div className="md:col-span-5 space-y-3 pt-2 md:border-l md:border-border/60 md:pl-8">
          <div className="h-4 w-32 bg-muted rounded-md mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 w-full rounded-2xl bg-muted/70 border border-border/60 flex items-center justify-between px-4"
            >
              <div className="h-3.5 w-16 bg-foreground/10 rounded-md" />
              <div className="h-6 w-16 bg-primary/20 rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer Branding Shimmer */}
      <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
          <span className="text-[11px] font-medium tracking-wide">Connecting to Atelier Schedule...</span>
        </div>
        <div className="h-3 w-28 bg-muted rounded-md" />
      </div>
    </div>
  )
}
