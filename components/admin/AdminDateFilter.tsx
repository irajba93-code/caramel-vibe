'use client'

import React, { useState } from 'react'
import { Calendar as CalendarIcon, X, SlidersHorizontal, Check } from 'lucide-react'

export interface DateFilterPreset {
  label: string
  value: string
}

interface AdminDateFilterProps {
  preset: string
  onPresetChange: (preset: string) => void
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onReset: () => void
  presetOptions?: DateFilterPreset[]
  label?: string
  className?: string
}

export const DEFAULT_DATE_PRESETS: DateFilterPreset[] = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'This Month', value: 'month' },
  { label: 'Last 30 Days', value: '30days' },
  { label: 'Custom Range', value: 'custom' },
]

export const SESSION_DATE_PRESETS: DateFilterPreset[] = [
  { label: 'All Dates', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Next 7 Days', value: 'next7days' },
  { label: 'This Month', value: 'month' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Custom Range', value: 'custom' },
]

export function AdminDateFilter({
  preset,
  onPresetChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onReset,
  presetOptions = DEFAULT_DATE_PRESETS,
  label = 'Date Filter',
  className = '',
}: AdminDateFilterProps) {
  const [showCustomInputs, setShowCustomInputs] = useState(preset === 'custom' || !!startDate || !!endDate)

  const handleSelectPreset = (value: string) => {
    onPresetChange(value)
    if (value === 'custom') {
      setShowCustomInputs(true)
    } else {
      setShowCustomInputs(false)
      onStartDateChange('')
      onEndDateChange('')
    }
  }

  const isFiltered = preset !== 'all' || startDate !== '' || endDate !== ''

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Preset Pills and Main Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold text-[11px] shrink-0">
            <CalendarIcon className="w-3.5 h-3.5 text-accent" />
            <span>{label}:</span>
          </div>

          {/* Quick Select Presets Pills */}
          <div className="inline-flex flex-wrap items-center p-0.5 rounded-xl bg-background border border-border gap-0.5">
            {presetOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelectPreset(opt.value)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  preset === opt.value
                    ? 'bg-primary text-primary-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Clear Filter Button if active */}
          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                onReset()
                setShowCustomInputs(false)
              }}
              title="Reset date filter to All Time"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border/80 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Range Pickers (shown when Custom Range is selected) */}
      {(preset === 'custom' || showCustomInputs) && (
        <div className="flex flex-wrap items-center gap-2.5 p-2.5 rounded-xl bg-background/80 border border-primary/20 animate-in fade-in slide-in-from-top-1 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1 shrink-0">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Custom Span:</span>
          </span>

          <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2.5 py-1 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                onStartDateChange(e.target.value)
                if (preset !== 'custom') onPresetChange('custom')
              }}
              className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2.5 py-1 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                onEndDateChange(e.target.value)
                if (preset !== 'custom') onPresetChange('custom')
              }}
              className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer"
            />
          </div>

          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                onStartDateChange('')
                onEndDateChange('')
              }}
              className="text-[11px] font-semibold text-muted-foreground hover:text-primary underline cursor-pointer px-1"
            >
              Clear dates
            </button>
          )}
        </div>
      )}
    </div>
  )
}
