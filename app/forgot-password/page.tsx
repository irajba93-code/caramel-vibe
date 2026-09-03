'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastContext'
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { showToast } = useToast()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setErrorMsg(error.message)
        showToast(error.message, 'error')
        return
      }

      setIsSubmitted(true)
      showToast('Password reset link sent to your email.', 'success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset link'
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
          <div className="eyebrow mb-2">Account Recovery</div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Reset Your Password
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your registered email address to receive recovery instructions
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[#9e3b32]/10 border border-[#9e3b32]/30 text-[#9e3b32] text-sm">
            {errorMsg}
          </div>
        )}

        {isSubmitted ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-[#3e6b48] mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-foreground mb-2">
              Check Your Inbox
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              We have dispatched password reset instructions to <strong className="text-foreground">{email}</strong>.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>

            <div className="mt-6 pt-4 border-t border-border text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
