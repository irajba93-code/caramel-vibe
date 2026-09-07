'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  ChevronDown,
  User as UserIcon,
  Calendar,
  ShieldCheck,
  LogOut,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  BookOpen,
  Plus,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useAdminMock } from '@/context/AdminMockContext'
import { useToast } from '@/components/ui/ToastContext'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

interface AdminHeaderProps {
  breadcrumbs?: { label: string; href?: string }[]
  title?: string
  subtitle?: string
  actionButton?: {
    label: string
    onClick: () => void
    icon?: React.ComponentType<{ className?: string }>
  }
}

export function AdminHeader({
  breadcrumbs = [{ label: 'Admin', href: '/admin/dashboard' }],
  title,
  subtitle,
  actionButton,
}: AdminHeaderProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const supabase = createClient()
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    isSidebarCollapsed,
    toggleSidebar,
    toggleMobileDrawer,
  } = useAdminMock()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    async function loadAdminUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          setProfile(data as Profile)
        }
      }
    }

    loadAdminUser()
  }, [supabase])

  // Click-outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    showToast('Signed out of Admin Console.', 'info')
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 py-3.5 md:py-4">
      {/* Top Row: Breadcrumbs & Header Controls */}
      <div className="flex items-center justify-between gap-3 md:gap-4">
        {/* Left: Sidebar Collapse/Expand Triggers (Mobile & Desktop) + Breadcrumbs */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Hamburger Trigger (md:hidden) - Outside Drawer */}
          <button
            type="button"
            onClick={toggleMobileDrawer}
            title="Open navigation drawer"
            aria-label="Open mobile navigation drawer"
            className="md:hidden p-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-xs active:scale-95"
          >
            <Menu className="w-4 h-4 text-foreground" />
          </button>

          {/* Desktop Sidebar Collapse/Expand Trigger (hidden md:flex) - Outside Sidebar */}
          <button
            type="button"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? 'Expand sidebar menu' : 'Collapse sidebar menu'}
            aria-label={isSidebarCollapsed ? 'Expand sidebar menu' : 'Collapse sidebar menu'}
            className="hidden md:flex p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer items-center justify-center shrink-0 shadow-xs active:scale-95 group"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-transform" />
            )}
          </button>

          {/* Breadcrumbs Navigation in Small Text */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto no-scrollbar py-0.5">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1
              return (
                <React.Fragment key={crumb.label}>
                  {idx > 0 && <span className="text-border shrink-0">/</span>}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-primary transition-colors font-medium whitespace-nowrap"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'text-foreground font-semibold whitespace-nowrap' : 'whitespace-nowrap'}>
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              )
            })}
          </nav>
        </div>

        {/* Right Controls: Contextual Action, Notifications & Root Profile Dropdown */}
        <div className="flex items-center gap-3">
          {/* Contextual Action Button */}
          {actionButton && (
            <button
              type="button"
              onClick={actionButton.onClick}
              className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-98"
            >
              {actionButton.icon ? (
                <actionButton.icon className="w-3.5 h-3.5" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>{actionButton.label}</span>
            </button>
          )}

          {/* Minimal Real-Time Notification Center */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((prev) => !prev)}
              aria-label="Atelier notifications"
              className="p-2 rounded-xl border border-border bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover Drawer */}
            {notifOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-card border border-border shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="font-display font-bold text-sm text-foreground">
                      Real-Time Atelier Feed
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      No recent activity notifications.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          notif.read
                            ? 'bg-background/40 border-border/60 opacity-75'
                            : 'bg-primary/5 border-primary/20 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-foreground">
                            {notif.title}
                          </span>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                          {notif.message}
                        </p>
                        <div className="text-[10px] text-muted-foreground/70 mt-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{notif.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-border text-center">
                  <span className="text-[10px] text-muted-foreground">
                    Supabase Realtime CDC stream active
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Root-Consistent Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label="Admin profile menu"
              aria-expanded={dropdownOpen}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-full border border-border bg-card hover:bg-muted/60 transition-all cursor-pointer shadow-sm hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <Avatar
                src={profile?.avatar_url}
                name={profile?.full_name || profile?.email || 'Admin'}
                size="sm"
                className="w-7 h-7"
              />
              <span className="hidden sm:inline text-xs font-semibold text-foreground max-w-[120px] truncate">
                {profile?.full_name || profile?.email?.split('@')[0] || 'Administrator'}
              </span>
              <ChevronDown
                size={14}
                className={`text-muted-foreground mr-1 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-primary' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-card border border-border shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
                {/* User Summary */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background border border-border/80">
                  <Avatar
                    src={profile?.avatar_url}
                    name={profile?.full_name || profile?.email || 'Admin'}
                    size="md"
                    className="w-10 h-10 ring-2 ring-primary/20"
                  />
                  <div className="truncate flex-1">
                    <div className="text-xs font-bold text-foreground truncate">
                      {profile?.full_name || 'Administrator'}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {profile?.email || 'admin@caramelvibe.com'}
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-[9px] font-bold uppercase tracking-wider text-primary">
                      <span>ADMIN CONSOLE</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border my-2" />

                {/* Navigation Options */}
                <div className="space-y-1">
                  <Link
                    href="/client/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/80 hover:text-primary transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-primary" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/admin/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/80 hover:text-primary transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>Admin Dashboard</span>
                  </Link>

                  <Link
                    href="/"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/80 hover:text-primary transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>View Storefront</span>
                  </Link>
                </div>

                <div className="h-px bg-border my-2" />

                {/* Sign Out Action */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Optional Title Row */}
      {title && (
        <div className="mt-4 pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}
    </header>
  )
}
