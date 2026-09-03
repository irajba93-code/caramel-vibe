'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastContext'
import {
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  User,
  ShoppingBag,
  Bell
} from 'lucide-react'
import type { Profile } from '@/lib/supabase/types'

export default function ClientDashboardPage() {
  const { showToast } = useToast()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
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

    loadData()
  }, [supabase])

  const testToast = () => {
    showToast('Top-left toast notification working seamlessly!', 'success')
  }

  if (loading) {
    return (
      <div className="container-cv py-12 text-center text-muted-foreground">
        Loading membership dashboard...
      </div>
    )
  }

  return (
    <div className="container-cv space-y-8">
      {/* Welcome Hero Card */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Membership Tier: {profile?.role?.toUpperCase()}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Welcome, {profile?.full_name || 'Valued Member'}
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Your private portal for bespoke atelier styling appointments, archival curation, and waitlist allocations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={testToast}
              className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-primary" />
              <span>Test Notification</span>
            </button>
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Role & Account Information Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span>Account Details</span>
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#3e6b48]/10 text-[#3e6b48] border border-[#3e6b48]/20">
              {profile?.status || 'Active'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-border/60">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium text-foreground">{profile?.email}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/60">
              <span className="text-muted-foreground">Assigned Role:</span>
              <span className="font-bold text-primary capitalize">{profile?.role}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/60">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium text-foreground">{profile?.phone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Member Since:</span>
              <span className="font-medium text-foreground">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Today'}
              </span>
            </div>
          </div>
        </div>

        {/* Role Lifecycle Explainer */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 md:col-span-2">
          <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>Role Progression & Privileges</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className={`p-4 rounded-xl border ${profile?.role === 'user' ? 'bg-primary/5 border-primary/40' : 'bg-muted/30 border-border'}`}>
              <div className="font-bold text-foreground mb-1 flex items-center justify-between">
                <span>Standard Member (`user`)</span>
                {profile?.role === 'user' && <span className="text-[10px] text-primary font-bold">CURRENT ROLE</span>}
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Registered account. You can browse all public archival pieces and book private styling appointments.
              </p>
            </div>

            <div className={`p-4 rounded-xl border ${profile?.role === 'client' ? 'bg-primary/5 border-primary/40' : 'bg-muted/30 border-border'}`}>
              <div className="font-bold text-foreground mb-1 flex items-center justify-between">
                <span>Atelier Client (`client`)</span>
                {profile?.role === 'client' && <span className="text-[10px] text-primary font-bold">CURRENT ROLE</span>}
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Automatically upgraded upon placing your first confirmed appointment reservation via automated database triggers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Upcoming Sessions & Orders */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-xl text-foreground">
              Your Atelier Appointments
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live reservations and waitlist positions for private sessions
            </p>
          </div>
          <span className="text-xs font-semibold text-primary px-3 py-1 rounded-full bg-primary/10">
            0 Active Sessions
          </span>
        </div>

        <div className="p-8 rounded-xl border border-dashed border-border text-center space-y-3">
          <Calendar className="w-8 h-8 text-muted-foreground/60 mx-auto" />
          <h4 className="font-medium text-sm text-foreground">No upcoming appointments yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Explore our curated calendar to book an in-person authentication review or archival leather consultation.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-2"
          >
            <span>Browse Available Atelier Sessions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
