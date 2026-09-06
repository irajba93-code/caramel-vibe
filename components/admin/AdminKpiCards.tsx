'use client'

import React, { useState } from 'react'
import {
  DollarSign,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Filter,
} from 'lucide-react'
import { KPI_DATA } from '@/lib/admin/mockData'

export function AdminKpiCards() {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week')
  const metrics = KPI_DATA[dateRange] || KPI_DATA.week

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'dollar':
        return <DollarSign className="w-4 h-4 text-primary" />
      case 'calendar':
        return <Calendar className="w-4 h-4 text-accent" />
      case 'bookings':
        return <Clock className="w-4 h-4 text-primary" />
      case 'users':
        return <Users className="w-4 h-4 text-accent" />
      default:
        return <Sparkles className="w-4 h-4 text-primary" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Date Range Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2">
          <div className="eyebrow">Studio Performance</div>
          <span className="text-xs text-muted-foreground">• Executive Snapshot</span>
        </div>

        {/* Date Filter Pills */}
        <div className="inline-flex items-center p-1 rounded-xl bg-card border border-border self-start sm:self-auto shadow-xs">
          <button
            type="button"
            onClick={() => setDateRange('today')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              dateRange === 'today'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setDateRange('week')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              dateRange === 'week'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setDateRange('month')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              dateRange === 'month'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => setDateRange('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              dateRange === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/40 hover:-translate-y-0.5 transition-all space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span>{metric.title}</span>
              <div className="p-2 rounded-xl bg-muted/50">{getIcon(metric.iconName)}</div>
            </div>

            <div>
              <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {metric.value}
              </div>
            </div>

            {/* Trend Indicator Row */}
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 font-bold text-[#3e6b48]">
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                )}
                <span>{metric.change}</span>
              </div>
              <span className="text-muted-foreground truncate max-w-[120px]">
                {metric.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
