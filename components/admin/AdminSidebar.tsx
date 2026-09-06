'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Calendar,
  Users,
  BookOpen,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Home,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useAdminMock } from '@/context/AdminMockContext'

export function AdminSidebar() {
  const pathname = usePathname()
  const { isSidebarCollapsed, toggleSidebar, sessions, clients, bookings } = useAdminMock()

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Sessions',
      href: '/admin/sessions',
      icon: Calendar,
      badge: sessions.filter((s) => s.status === 'published' || s.status === 'full').length,
    },
    {
      label: 'Clients',
      href: '/admin/clients',
      icon: Users,
      badge: clients.length,
    },
    {
      label: 'Bookings',
      href: '/admin/bookings',
      icon: BookOpen,
      badge: bookings.filter((b) => b.status === 'confirmed').length,
    },
  ]

  return (
    <aside
      className={`border-b md:border-b-0 md:border-r border-border bg-card flex flex-col shrink-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'md:w-20' : 'md:w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 md:p-5 border-b border-border flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2.5 overflow-hidden group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground font-display font-bold flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            CV
          </div>
          {!isSidebarCollapsed && (
            <div className="truncate">
              <div className="font-display text-lg font-bold text-foreground leading-none">
                caramel<span className="text-accent">.</span>vibe
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-primary mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Admin Suite</span>
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isSidebarCollapsed ? item.label : undefined}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
                  }`}
                />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </div>

              {!isSidebarCollapsed && item.badge !== null && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Quick Footers & Collapse Toggle */}
      <div className="p-3 border-t border-border bg-background/50 space-y-2">
        <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
          <Link
            href="/"
            title="View Public Storefront"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted/60 hover:text-primary transition-colors"
          >
            <Home className="w-3.5 h-3.5 shrink-0" />
            {!isSidebarCollapsed && <span>Storefront</span>}
          </Link>
          <Link
            href="/client/profile"
            title="My Profile Settings"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted/60 hover:text-primary transition-colors"
          >
            <UserIcon className="w-3.5 h-3.5 shrink-0" />
            {!isSidebarCollapsed && <span>Admin Profile</span>}
          </Link>
        </div>

        {/* Collapse button (Desktop only) */}
        <div className="pt-2 border-t border-border hidden md:block">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-full py-1.5 px-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[11px]">Collapse Menu</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
