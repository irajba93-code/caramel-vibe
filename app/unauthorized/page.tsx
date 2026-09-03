'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShieldAlert, ArrowLeft, Home, LogOut, Lock } from 'lucide-react'
import type { Profile } from '@/lib/supabase/types'

export default function UnauthorizedPage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
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
      setLoading(false)
    }

    loadUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-background">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm text-center">
        {/* Brand Header */}
        <Link href="/" className="inline-block group mb-6">
          <span className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
            caramel<span className="text-accent">.</span>vibe
          </span>
        </Link>

        {/* Shield Alert Icon */}
        <div className="w-16 h-16 rounded-full bg-[#9e3b32]/10 border border-[#9e3b32]/30 flex items-center justify-center mx-auto mb-6 text-[#9e3b32]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="eyebrow text-[#9e3b32] mb-2">Administrative Security</div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-3">
          Access Restricted
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto mb-6">
          You do not have administrative authorization to view or manage studio operations. This section is strictly reserved for the Atelier Director and operational staff.
        </p>

        {/* Current Account Details Banner */}
        {profile && (
          <div className="mb-8 p-4 rounded-xl bg-background/70 border border-border text-left text-xs space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground font-semibold">
              <span>Signed In As:</span>
              <span className="text-foreground">{profile.email}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground font-semibold">
              <span>Current Role:</span>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold uppercase tracking-wider text-[10px]">
                {profile.role}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Go to Member Dashboard</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-medium text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Storefront</span>
          </Link>
        </div>

        {/* Sign in with different account */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Need admin access?</span>
          <button
            onClick={handleSignOut}
            className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign in with an Admin account</span>
          </button>
        </div>
      </div>
    </div>
  )
}
