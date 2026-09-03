'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastContext'
import {
  ShieldAlert,
  LayoutDashboard,
  Calendar,
  Layers,
  BookOpen,
  Users,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Home,
  ShieldCheck
} from 'lucide-react'
import type { Profile } from '@/lib/supabase/types'

const NAV_ITEMS = [
  { label: 'Executive Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Studio Sessions', href: '/admin/sessions', icon: Calendar },
  { label: 'Session Templates', href: '/admin/session-types', icon: Layers },
  { label: 'Master Bookings', href: '/admin/bookings', icon: BookOpen },
  { label: 'Client Directory', href: '/admin/clients', icon: Users },
  { label: 'Analytics & Revenue', href: '/admin/reporting', icon: BarChart3 },
  { label: 'Audit & Access Logs', href: '/admin/logs', icon: FileText },
  { label: 'Atelier Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { showToast } = useToast()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdminAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?redirect=/admin/dashboard')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!data || data.role !== 'admin' || data.status !== 'active') {
        showToast('Unauthorized. Admin privileges required.', 'error')
        router.push('/unauthorized')
        return
      }

      setProfile(data as Profile)
      setLoading(false)
    }

    checkAdminAuth()
  }, [router, supabase, showToast])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    showToast('Signed out of Admin Console.', 'info')
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
        Verifying administrative credentials...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <Link href="/" className="font-display text-xl font-bold text-foreground hover:text-primary transition-colors block">
            caramel<span className="text-accent">.</span>vibe
          </Link>
          <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-[11px] font-bold uppercase tracking-wider text-primary">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User profile & quick sign out */}
        <div className="p-4 border-t border-border bg-background/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                A
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-foreground truncate">
                  {profile?.full_name || 'Admin'}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">{profile?.email}</div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-destructive transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <Home className="w-3 h-3" />
              <span>Storefront</span>
            </Link>
            <Link href="/client/dashboard" className="hover:text-primary transition-colors">
              Client View
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
