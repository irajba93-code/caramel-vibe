'use client'

import React, { useState } from 'react'
import { Calendar, Sparkles, ArrowRight } from 'lucide-react'
import { CalendlyModal } from './CalendlyModal'
import type { CalendlyPrefillOptions } from '@/lib/calendly/types'

export interface CalendlyTriggerButtonProps {
  label?: string
  url?: string
  prefill?: CalendlyPrefillOptions
  variant?: 'primary' | 'outline' | 'gold' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: 'calendar' | 'sparkles' | 'none'
  modalTitle?: string
  modalSubtitle?: string
  className?: string
  showArrow?: boolean
  onClick?: () => void
}

export function CalendlyTriggerButton({
  label = 'Book Private Consultation',
  url,
  prefill,
  variant = 'primary',
  size = 'md',
  icon = 'sparkles',
  modalTitle,
  modalSubtitle,
  className = '',
  showArrow = false,
  onClick,
}: CalendlyTriggerButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick()
      return
    }
    setIsModalOpen(true)
  }

  // Variant Styles
  const variantStyles = {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border border-transparent',
    outline:
      'bg-background border border-border hover:bg-muted text-foreground hover:border-primary/50 shadow-xs',
    gold:
      'bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 shadow-xs',
    ghost:
      'bg-transparent hover:bg-muted text-foreground border border-transparent',
  }

  // Size Styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-xs rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-sm rounded-2xl gap-2.5',
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all cursor-pointer select-none active:scale-[0.98] ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      >
        {icon === 'sparkles' && <Sparkles className="w-3.5 h-3.5 shrink-0" />}
        {icon === 'calendar' && <Calendar className="w-3.5 h-3.5 shrink-0" />}
        <span>{label}</span>
        {showArrow && <ArrowRight className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-1" />}
      </button>

      <CalendlyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        url={url}
        prefill={prefill}
        title={modalTitle}
        subtitle={modalSubtitle}
      />
    </>
  )
}
