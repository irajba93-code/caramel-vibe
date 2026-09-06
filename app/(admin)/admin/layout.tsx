'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastContext'
import { AdminMockProvider } from '@/context/AdminMockContext'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import type { Profile } from '@/lib/supabase/types'

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
  }, [router, supabase, showToast, pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-xs tracking-wider uppercase font-bold">
        Verifying administrative credentials...
      </div>
    )
  }

  return (
    <AdminMockProvider>
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        {/* Collapsible Admin Sidebar */}
        <AdminSidebar />

        {/* Main Admin Content Stream */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </div>
      </div>
    </AdminMockProvider>
  )
}
