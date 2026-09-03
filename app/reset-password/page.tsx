'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastContext'
import { Lock, ArrowRight } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match')
      return
    }

    setIsLoading(true)
    setErrorMsg(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        setErrorMsg(error.message)
        showToast(error.message, 'error')
        return
      }

      showToast('Password updated successfully. Please sign in.', 'success')
      router.push('/login')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update password'
      setErrorMsg(message)
      showToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group mb-4">
            <span className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
              caramel<span className="text-accent">.</span>vibe
            </span>
          </Link>
          <div className="eyebrow mb-2">Security</div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Set New Password
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a secure password for your Caramel Vibe account
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[#9e3b32]/10 border border-[#9e3b32]/30 text-[#9e3b32] text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
