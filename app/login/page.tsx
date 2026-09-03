'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastContext'
import { ArrowRight, Lock, Mail, ShieldCheck, UserCheck } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    const messageParam = searchParams.get('message')

    if (errorParam === 'unauthorized') {
      setErrorMsg('You do not have administrative privileges to access that section.')
    } else if (errorParam === 'account_restricted') {
      setErrorMsg('Your account has been restricted or suspended. Please contact studio support.')
    } else if (messageParam === 'confirmation_sent') {
      showToast('Registration email sent. Please verify before signing in.', 'info')
    }
  }, [searchParams, showToast])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMsg(error.message)
        showToast(error.message, 'error')
        return
      }

      if (data?.user) {
        // Record login history in background
        fetch('/api/auth/record-login', { method: 'POST' }).catch((e) =>
          console.warn('Could not record login activity:', e)
        )

        // Retrieve role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, status')
          .eq('id', data.user.id)
          .single()

        showToast('Signed in successfully.', 'success')

        const redirectUrl = searchParams.get('redirect')

        if (profile?.role === 'admin') {
          router.push(redirectUrl && redirectUrl.startsWith('/admin') ? redirectUrl : '/admin/dashboard')
        } else {
          router.push(redirectUrl && !redirectUrl.startsWith('/admin') ? redirectUrl : '/dashboard')
        }
        router.refresh()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in'
      setErrorMsg(message)
      showToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Quick helper for easy testing during development
  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail)
    setPassword(demoPass)
  }

  return (
    <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm">
      {/* Brand header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block group mb-4">
          <span className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
            caramel<span className="text-accent">.</span>vibe
          </span>
        </Link>
        <div className="eyebrow mb-2">Member & Admin Portal</div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Welcome Back
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to manage appointments, curated orders, and studio operations
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-[#9e3b32]/10 border border-[#9e3b32]/30 text-[#9e3b32] text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@luxuryedit.com or admin@caramelvibe.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/60 transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo helper */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center mb-3">
          Quick Demo Credentials Switcher
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('admin@caramelvibe.com', 'admin123456')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border bg-background/80 hover:bg-muted text-xs text-foreground font-medium transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Admin Preset</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('client@caramelvibe.com', 'client123456')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border bg-background/80 hover:bg-muted text-xs text-foreground font-medium transition-colors cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-accent" />
            <span>Client Preset</span>
          </button>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted-foreground">
        Don&apos;t have an account yet?{' '}
        <Link href="/signup" className="text-primary font-semibold hover:underline">
          Register Here
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-background">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
