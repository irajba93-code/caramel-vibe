'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastContext'
import { User, LogOut, Calendar, Home, Sparkles } from 'lucide-react'
import type { Profile } from '@/lib/supabase/types'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { showToast } = useToast()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUserProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data as Profile)
      }
      setLoading(false)
    }

    loadUserProfile()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    showToast('Signed out successfully.', 'info')
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Client Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container-cv py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-display text-xl font-bold text-foreground hover:text-primary transition-colors">
              caramel<span className="text-accent">.</span>vibe
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-xs font-semibold text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Member Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                <Home className="w-4 h-4" />
                <span>Storefront</span>
              </Link>
              <Link href="/dashboard" className="text-primary font-semibold flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            </nav>

            <div className="h-4 w-px bg-border hidden sm:block" />

            {/* Profile Pill & Sign Out */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-foreground leading-none">
                    {profile?.full_name || profile?.email?.split('@')[0] || 'Member'}
                  </div>
                  <div className="text-[10px] text-muted-foreground capitalize mt-0.5">
                    Role: {profile?.role || 'user'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8">{children}</main>
    </div>
  )
}
