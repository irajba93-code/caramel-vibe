'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  DollarSign,
  Settings,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Activity,
  Layers,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useAdminMock } from '@/context/AdminMockContext'
import { AdminActivity } from '@/lib/admin/mockData'

export type ActivityFilterType = 'all' | 'admin' | 'client'

export function AdminRecentActivities() {
  const { activities } = useAdminMock()

  const [actorFilter, setActorFilter] = useState<ActivityFilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  // Filter Activities based on Actor Type and Search Query
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // 1. Actor type filter
      if (actorFilter === 'admin' && act.actor_type !== 'admin') return false
      if (actorFilter === 'client' && act.actor_type !== 'client') return false

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = act.title.toLowerCase().includes(q)
        const matchDesc = act.description.toLowerCase().includes(q)
        const matchName = act.actor_name.toLowerCase().includes(q)
        const matchEmail = act.actor_email.toLowerCase().includes(q)
        const matchTarget = act.target_label?.toLowerCase().includes(q) || false
        if (!matchTitle && !matchDesc && !matchName && !matchEmail && !matchTarget) {
          return false
        }
      }

      return true
    })
  }, [activities, actorFilter, searchQuery])

  // Counts for Filter Badges
  const adminCount = useMemo(() => activities.filter((a) => a.actor_type === 'admin').length, [activities])
  const clientCount = useMemo(() => activities.filter((a) => a.actor_type === 'client').length, [activities])
  const allCount = activities.length

  // Display Limit (e.g. 5 default, all if expanded)
  const displayedActivities = isExpanded ? filteredActivities : filteredActivities.slice(0, 5)

  const getActionIcon = (actionType: AdminActivity['action_type'], actorType: AdminActivity['actor_type']) => {
    switch (actionType) {
      case 'booking_checked_in':
        return <CheckCircle2 className="w-4 h-4 text-[#3e6b48]" />
      case 'booking_created':
        return <BookOpen className="w-4 h-4 text-accent" />
      case 'booking_cancelled':
        return <AlertCircle className="w-4 h-4 text-destructive" />
      case 'payment_updated':
        return <DollarSign className="w-4 h-4 text-primary" />
      case 'session_created':
      case 'session_updated':
        return <Calendar className="w-4 h-4 text-primary" />
      case 'client_registered':
      case 'client_profile_updated':
        return <Users className="w-4 h-4 text-accent" />
      case 'client_status_changed':
        return <ShieldCheck className="w-4 h-4 text-destructive" />
      case 'setting_updated':
        return <Settings className="w-4 h-4 text-primary" />
      default:
        return actorType === 'admin' ? (
          <ShieldCheck className="w-4 h-4 text-primary" />
        ) : (
          <Sparkles className="w-4 h-4 text-accent" />
        )
    }
  }

  const getActionBadgeColor = (actionType: AdminActivity['action_type']) => {
    switch (actionType) {
      case 'booking_checked_in':
        return 'bg-[#3e6b48]/10 text-[#3e6b48] border-[#3e6b48]/20'
      case 'booking_created':
        return 'bg-accent/15 text-accent border-accent/20'
      case 'booking_cancelled':
      case 'client_status_changed':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'payment_updated':
      case 'session_created':
      case 'setting_updated':
        return 'bg-primary/10 text-primary border-primary/20'
      default:
        return 'bg-muted text-foreground border-border'
    }
  }

  const getTargetLink = (act: AdminActivity) => {
    if (act.action_type.startsWith('booking')) return '/admin/bookings'
    if (act.action_type.startsWith('session')) return '/admin/sessions'
    if (act.action_type.startsWith('client')) return '/admin/clients'
    if (act.action_type.startsWith('setting')) return '/admin/sessions'
    return '/admin/dashboard'
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Card Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-display font-bold text-lg text-foreground">
              Recent Activities &amp; Audit Log
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time feed of administrator updates and client reservation events
          </p>
        </div>

        {/* Actor Filter Switcher (All / Admin / Client) */}
        <div className="inline-flex items-center p-1 rounded-xl bg-background border border-border self-start sm:self-auto shadow-xs">
          <button
            type="button"
            onClick={() => setActorFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              actorFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>All</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                actorFilter === 'all' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {allCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActorFilter('admin')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              actorFilter === 'admin'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                actorFilter === 'admin' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {adminCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActorFilter('client')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              actorFilter === 'client'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Clients</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                actorFilter === 'client' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {clientCount}
            </span>
          </button>
        </div>
      </div>

      {/* Quick Search & Sub-Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search activity by title, client name, booking #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
          />
        </div>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="px-2.5 py-1.5 rounded-xl border border-border bg-background text-xs text-muted-foreground hover:text-foreground cursor-pointer shadow-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Activity Timeline Feed */}
      <div className="space-y-3">
        {displayedActivities.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-background/30 space-y-3">
            <Activity className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
            <p className="text-xs text-muted-foreground font-medium">
              No activities found matching your filter criteria.
            </p>
            <button
              type="button"
              onClick={() => {
                setActorFilter('all')
                setSearchQuery('')
              }}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold cursor-pointer shadow-xs active:scale-95"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          displayedActivities.map((act) => (
            <div
              key={act.id}
              className="p-3.5 sm:p-4 rounded-xl border border-border bg-background/50 hover:border-border/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-2xs"
            >
              <div className="flex items-start gap-3 min-w-0">
                {/* Actor Avatar / Icon Indicator */}
                <div
                  className={`p-2 rounded-xl shrink-0 border ${
                    act.actor_type === 'admin'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-accent/15 text-accent border-accent/20'
                  }`}
                >
                  {getActionIcon(act.action_type, act.actor_type)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Actor Role Pill */}
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        act.actor_type === 'admin'
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-accent/15 text-accent border-accent/20'
                      }`}
                    >
                      {act.actor_type === 'admin' ? 'Admin Action' : 'Client Action'}
                    </span>

                    {/* Action Category Badge */}
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getActionBadgeColor(
                        act.action_type
                      )}`}
                    >
                      {act.action_type.replace(/_/g, ' ')}
                    </span>

                    {/* Target Label */}
                    {act.target_label && (
                      <span className="font-mono text-[10px] font-bold text-muted-foreground px-1.5 py-0.5 rounded-md bg-muted/60">
                        {act.target_label}
                      </span>
                    )}
                  </div>

                  {/* Activity Title */}
                  <h4 className="text-xs font-bold text-foreground truncate">{act.title}</h4>

                  {/* Activity Description */}
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                    {act.description}
                  </p>

                  {/* Actor Details & Time */}
                  <div className="text-[10px] text-muted-foreground flex items-center gap-2 pt-0.5 flex-wrap">
                    <span className="font-medium text-foreground">{act.actor_name}</span>
                    <span>•</span>
                    <span className="truncate max-w-[150px]">{act.actor_email}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-primary">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{act.timestamp}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <Link
                href={getTargetLink(act)}
                className="self-end sm:self-center px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-semibold transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs active:scale-95"
              >
                <span>View</span>
                <ArrowRight className="w-3 h-3 text-primary" />
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Expand / Collapse Toggle Button */}
      {filteredActivities.length > 5 && (
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>{isExpanded ? 'Show Less' : `View All Activities (${filteredActivities.length})`}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  )
}
