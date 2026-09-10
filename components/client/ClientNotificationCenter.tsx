'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Bell,
  Check,
  CheckCheck,
  Sparkles,
  Calendar,
  ShieldCheck,
  AlertCircle,
  X,
  Clock,
  Inbox,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastContext'
import type { SystemNotificationLog } from '@/lib/supabase/types'

interface ClientNotificationCenterProps {
  userId?: string
}

export function ClientNotificationCenter({ userId }: ClientNotificationCenterProps) {
  const supabase = createClient()
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState<SystemNotificationLog[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Fetch initial notifications
  useEffect(() => {
    if (!userId) return

    async function fetchNotifications() {
      const { data, error } = await supabase
        .from('system_notifications_log')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        const notifs = data as SystemNotificationLog[]
        setNotifications(notifs)
        // Count unread: metadata?.is_read === false or status !== 'read'
        const unread = notifs.filter(
          (n) => n.status !== 'read' && (!n.metadata || (n.metadata as any).is_read !== true)
        ).length
        setUnreadCount(unread)
      }
    }

    fetchNotifications()

    // Supabase Realtime CDC subscription for live notification arrival
    const channel = supabase
      .channel(`client-notifs-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_notifications_log',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as SystemNotificationLog
          setNotifications((prev) => [newNotif, ...prev])
          setUnreadCount((prev) => prev + 1)
          showToast(`🔔 ${newNotif.subject || 'New atelier alert received'}`, 'info')
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, showToast])

  // Handle outside click / escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleMarkAsRead = async (notifId: string) => {
    try {
      const { error } = await supabase
        .from('system_notifications_log')
        .update({
          status: 'read',
          metadata: { is_read: true },
        })
        .eq('id', notifId)

      if (!error) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notifId ? { ...n, status: 'read', metadata: { ...n.metadata, is_read: true } } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch {
      // ignore
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!userId || unreadCount === 0) return
    try {
      const { error } = await supabase
        .from('system_notifications_log')
        .update({
          status: 'read',
          metadata: { is_read: true },
        })
        .eq('recipient_id', userId)

      if (!error) {
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            status: 'read',
            metadata: { ...n.metadata, is_read: true },
          }))
        )
        setUnreadCount(0)
        showToast('All notifications marked as read.', 'info')
      }
    } catch {
      // ignore
    }
  }

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmation':
        return <Calendar className="w-4 h-4 text-primary" />
      case 'booking_cancellation':
        return <AlertCircle className="w-4 h-4 text-[#9e3b32]" />
      case 'waitlist_promoted':
        return <Sparkles className="w-4 h-4 text-accent" />
      default:
        return <ShieldCheck className="w-4 h-4 text-accent" />
    }
  }

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - d.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Atelier notifications"
        aria-expanded={isOpen}
        className="relative p-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-card border border-border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-card">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-foreground">
                Atelier Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List of Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2 text-muted-foreground">
                <Inbox className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs font-medium">No alerts or notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const isRead = n.status === 'read' || (n.metadata as any)?.is_read === true
                return (
                  <div
                    key={n.id}
                    onClick={() => !isRead && handleMarkAsRead(n.id)}
                    className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                      isRead ? 'bg-card hover:bg-muted/40 opacity-75' : 'bg-primary/5 hover:bg-primary/10'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-background border border-border shrink-0 mt-0.5 shadow-xs">
                      {getNotifIcon(n.notification_type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-foreground truncate">{n.subject}</h4>
                        <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatTimestamp(n.created_at)}</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>

                    {!isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
