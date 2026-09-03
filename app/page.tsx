'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
  User as UserIcon,
  LogOut,
  Calendar,
  LayoutDashboard
} from 'lucide-react'
import { products, type Product } from '../lib/products'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastContext'
import { Avatar } from '@/components/ui/Avatar'
import type { Profile } from '@/lib/supabase/types'

function Header({ onBag }: { onBag: () => void }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const { showToast } = useToast()

  useEffect(() => {
    async function checkAuth() {
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
      } else {
        setProfile(null)
      }
      setIsAuthLoading(false)
    }

    checkAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          if (data) setProfile(data as Profile)
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [supabase])

  // Close dropdown on outside click or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [dropdownOpen])

  const handleSignOut = async () => {
    setDropdownOpen(false)
    await supabase.auth.signOut()
    setProfile(null)
    showToast('Signed out successfully.', 'info')
  }

  return (
    <header className="container-cv flex items-center justify-between py-6">
      <button className="md:hidden" aria-label="Open menu"><Menu size={20}/></button>
      <a href="#top" className="font-display text-2xl tracking-tight">caramel<span className="text-primary">.</span>vibe</a>
      <nav className="hidden gap-8 text-xs font-bold uppercase tracking-widest md:flex">
        <a href="#edit">The edit</a>
        <a href="#story">Our story</a>
        <a href="#faq">Questions</a>
      </nav>
      <div className="flex items-center gap-4">
        {isAuthLoading ? (
          <div className="w-8 h-8 rounded-full bg-muted/60 animate-pulse" />
        ) : profile ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label="User profile menu"
              aria-expanded={dropdownOpen}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-full border border-border bg-card hover:bg-muted/60 transition-all cursor-pointer shadow-sm hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <Avatar
                src={profile.avatar_url}
                name={profile.full_name || profile.email}
                size="sm"
                className="w-7 h-7"
              />
              <span className="hidden sm:inline text-xs font-semibold text-foreground max-w-[120px] truncate">
                {profile.full_name || profile.email.split('@')[0]}
              </span>
              <ChevronDown
                size={14}
                className={`text-muted-foreground mr-1 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-primary' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-card border border-border shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
                {/* User Header Summary */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background border border-border/80">
                  <Avatar
                    src={profile.avatar_url}
                    name={profile.full_name || profile.email}
                    size="md"
                    className="w-10 h-10 ring-2 ring-primary/20"
                  />
                  <div className="truncate flex-1">
                    <div className="text-xs font-bold text-foreground truncate">
                      {profile.full_name || 'Member'}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {profile.email}
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-[9px] font-bold uppercase tracking-wider text-primary">
                      <span>{profile.role}</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border my-2" />

                {/* Navigation Options */}
                <div className="space-y-1">
                  <Link
                    href="/client/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/80 hover:text-primary transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-primary" />
                    <span>My Profile</span>
                  </Link>

                  {(profile.role === 'user' || profile.role === 'client') && (
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/80 hover:text-primary transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-accent" />
                      <span>Dashboard</span>
                    </Link>
                  )}

                  {profile.role === 'admin' && (
                    <>
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/80 hover:text-primary transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <span>Admin</span>
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/80 hover:text-primary transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-accent" />
                        <span>Member View</span>
                      </Link>
                    </>
                  )}
                </div>

                <div className="h-px bg-border my-2" />

                {/* Sign Out Action */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            Sign In
          </Link>
        )}

        <button
          onClick={onBag}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-primary/20 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
        >
          <span className="hidden sm:inline">Reserve</span>
          <span>(01)</span>
        </button>
      </div>
    </header>
  )
}

function Checkout({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  const [sent, setSent] = useState(false)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/35">
      <div className="h-full w-full max-w-md overflow-y-auto bg-card p-6 shadow-2xl sm:p-10">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Private reservation</p>
          <button onClick={onClose} aria-label="Close"><X size={20}/></button>
        </div>
        {sent ? (
          <div className="flex min-h-[70vh] flex-col items-start justify-center gap-5">
            <Sparkles className="text-primary" size={32}/>
            <h2 className="font-display text-5xl">It&apos;s yours.</h2>
            <p className="leading-7 text-muted-foreground">Thank you for choosing {product.name}. We&apos;ll reach out on WhatsApp to confirm your details.</p>
            <button onClick={onClose} className="mt-4 border border-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary">Keep browsing</button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="mt-8 grid gap-5">
            <div className="flex items-center gap-4 border-b border-border pb-5">
              <Image src={product.image} alt="" width={80} height={80} className="h-20 w-20 object-contain"/>
              <div>
                <p className="font-display text-xl">{product.name}</p>
                <p className="text-primary">{product.price}</p>
              </div>
            </div>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-widest">
              Full name
              <input required className="border border-border bg-transparent p-3 text-sm font-normal normal-case tracking-normal outline-primary"/>
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-widest">
              Email
              <input required type="email" className="border border-border bg-transparent p-3 text-sm font-normal normal-case tracking-normal outline-primary"/>
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-widest">
              Phone / WhatsApp
              <input required className="border border-border bg-transparent p-3 text-sm font-normal normal-case tracking-normal outline-primary"/>
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-widest">
              Shipping address
              <textarea required rows={3} className="border border-border bg-transparent p-3 text-sm font-normal normal-case tracking-normal outline-primary"/>
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-widest">
              Payment method
              <select className="border border-border bg-transparent p-3 text-sm font-normal normal-case tracking-normal outline-primary">
                <option>Cash on delivery</option>
                <option>Mobile wallet</option>
                <option>Bank transfer</option>
              </select>
            </label>
            <button className="mt-2 flex items-center justify-center gap-3 bg-primary px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground">
              Secure this vibe <ArrowRight size={16}/>
            </button>
            <p className="text-center text-xs leading-5 text-muted-foreground">Frontend reservation only. Our team will confirm availability with you.</p>
          </form>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % products.length), 6500)
    return () => clearInterval(timer)
  }, [])

  const product = products[index]
  const cta = (
    <button onClick={() => setOpen(true)} className="group flex items-center gap-4 bg-primary px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:-translate-y-1">
      Secure this vibe <ArrowRight size={17} className="transition-transform group-hover:translate-x-1"/>
    </button>
  )

  return (
    <>
      <div id="top">
        <Header onBag={() => setOpen(true)}/>
      </div>
      <main>
        <section className="container-cv grid min-h-[680px] items-center gap-12 py-12 md:grid-cols-[.9fr_1.1fr] md:py-20">
          <div className="order-2 md:order-1">
            <p className="eyebrow">A considered collection · Kabul / Worldwide</p>
            <h1 className="font-display mt-6 max-w-xl text-6xl leading-[.95] tracking-tight md:text-8xl">
              Good bags have <em className="text-primary">stories.</em>
            </h1>
            <p className="mt-8 max-w-md text-base leading-7 text-muted-foreground">
              Pre-loved pieces, carefully chosen. For the woman who knows that the best accessory is the one that already has a life.
            </p>
            <div className="mt-10">{cta}</div>
            <div className="mt-12 flex items-center gap-5 text-xs text-muted-foreground">
              <ShieldCheck size={18} className="text-accent"/> Every piece authenticated &amp; lovingly inspected
            </div>
          </div>
          <div className="relative order-1 flex min-h-[440px] items-center justify-center bg-muted md:order-2 md:min-h-[590px]">
            <div className="absolute left-6 top-6 eyebrow">01 / 0{products.length}</div>
            <Image key={product.image} src={product.image} alt={product.name} width={620} height={620} priority className="h-[400px] w-[90%] object-contain md:h-[540px]"/>
            <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
              <div>
                <p className="font-display text-2xl">{product.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{product.price}</p>
              </div>
              <div className="flex gap-2">
                <button aria-label="Previous product" onClick={() => setIndex((index - 1 + products.length) % products.length)} className="border border-border bg-card p-3">
                  <ChevronLeft size={16}/>
                </button>
                <button aria-label="Next product" onClick={() => setIndex((index + 1) % products.length)} className="border border-border bg-card p-3">
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="edit" className="border-y border-border py-20">
          <div className="container-cv">
            <div className="flex items-end justify-between">
              <div>
                <p className="eyebrow">The edit</p>
                <h2 className="font-display mt-3 text-5xl">Found, not forced.</h2>
              </div>
              <span className="hidden text-sm text-muted-foreground sm:block">03 pieces in rotation</span>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {products.map((p, i) => (
                <button key={p.name} onClick={() => { setIndex(i); setOpen(true) }} className="group text-left">
                  <div className="bg-muted p-5">
                    <Image src={p.image} alt={p.name} width={400} height={400} className="h-64 w-full object-contain transition-transform group-hover:scale-105"/>
                  </div>
                  <p className="mt-4 font-display text-2xl">{p.name}</p>
                  <p className="mt-1 text-sm text-primary">{p.price}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="story" className="container-cv grid gap-12 py-24 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow">Why Caramel Vibe</p>
            <h2 className="font-display mt-4 text-5xl leading-tight md:text-6xl">
              The charm is in the <em className="text-primary">history.</em>
            </h2>
          </div>
          <div className="grid gap-8 text-sm leading-7 text-muted-foreground">
            <p>
              We believe a handbag should feel like a find — not a transaction. Each piece is selected for its character, quality, and the little details that make it unmistakably yours.
            </p>
            <div className="grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 font-bold uppercase tracking-widest text-foreground">01 · Authentic</p>
                <p>Every item is inspected before it reaches you.</p>
              </div>
              <div>
                <p className="mb-2 font-bold uppercase tracking-widest text-foreground">02 · Personal</p>
                <p>One-of-one pieces, chosen for your next chapter.</p>
              </div>
            </div>
            {cta}
          </div>
        </section>

        <section className="bg-foreground py-20 text-card">
          <div className="container-cv grid gap-8 md:grid-cols-3">
            <div>
              <p className="eyebrow text-accent">Kind words</p>
              <p className="mt-4 font-display text-3xl">“The bag feels like it was waiting for me.”</p>
              <p className="mt-5 text-xs uppercase tracking-widest text-card/60">— Marzia, Kabul</p>
            </div>
            <div>
              <p className="mt-8 font-display text-3xl md:mt-0">“Beautifully wrapped, exactly as pictured.”</p>
              <p className="mt-5 text-xs uppercase tracking-widest text-card/60">— Laila, Herat</p>
            </div>
            <div>
              <p className="mt-8 font-display text-3xl md:mt-0">“My new everyday heirloom.”</p>
              <p className="mt-5 text-xs uppercase tracking-widest text-card/60">— Soraya, Dubai</p>
            </div>
          </div>
        </section>

        <section id="faq" className="container-cv max-w-3xl py-24">
          <p className="eyebrow">Good to know</p>
          <h2 className="font-display mt-3 text-5xl">Questions, answered.</h2>
          <div className="mt-10 divide-y divide-border">
            {[
              ['Are the bags authentic?', 'Yes. Every piece is carefully inspected and authenticated before listing.'],
              ['How does delivery work?', 'We coordinate delivery details privately after your reservation, with shipping available worldwide.'],
              ['Can I return a piece?', 'Because each piece is one-of-one, we ask you to review all details before confirming. Our team is here to help.'],
            ].map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-display text-xl">
                  {q}
                  <ChevronDown size={18} className="transition-transform group-open:rotate-180"/>
                </summary>
                <p className="max-w-xl pt-4 text-sm leading-7 text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container-cv flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-2xl">caramel<span className="text-primary">.</span>vibe</p>
          <a href="https://instagram.com" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <Camera size={16}/> Follow the find
          </a>
          <p className="text-xs text-muted-foreground">© 2026 Caramel Vibe</p>
        </div>
      </footer>

      <Checkout product={product} open={open} onClose={() => setOpen(false)}/>
    </>
  )
}
