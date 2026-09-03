'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastContext'
import { Sparkles, ArrowRight, Lock, Mail, User, Phone } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: 'user',
          },
        },
      })

      if (error) {
        setErrorMsg(error.message)
        showToast(error.message, 'error')
        return
      }

      // Check if session was automatically created or confirmation email sent
      if (data?.session) {
        showToast('Welcome to Caramel Vibe! Account created.', 'success')
        router.push('/dashboard')
        router.refresh()
      } else {
        showToast('Account created! Please check your email to confirm your account.', 'info')
        router.push('/login?message=confirmation_sent')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setErrorMsg(message)
      showToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group mb-4">
            <span className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
              caramel<span className="text-accent">.</span>vibe
            </span>
          </Link>
          <div className="eyebrow mb-2">Private Client Membership</div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Create Your Account
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Join Caramel Vibe for private atelier appointments & curated archives
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[#9e3b32]/10 border border-[#9e3b32]/30 text-[#9e3b32] text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Eleanor Vance"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
            </div>
          </div>

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
                placeholder="client@luxuryedit.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Phone Number <span className="text-muted-foreground/60 normal-case font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Password
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
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Minimum 6 characters
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <span>Register Membership</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          Already have an atelier account?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
