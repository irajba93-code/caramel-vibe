'use client'

import { useEffect, useState, useRef, useMemo, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { products, type Product } from '@/lib/products'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastContext'
import { Avatar } from '@/components/ui/Avatar'
import type { Profile } from '@/lib/supabase/types'
import { BagReservationDrawer } from '@/components/landing/BagReservationDrawer'
import {
  LandingSessionsShowcase,
  type LandingShowcaseSession,
} from '@/components/landing/LandingSessionsShowcase'
import { ClientBookingDrawer } from '@/components/client/ClientBookingDrawer'
import { ClientNotificationCenter } from '@/components/client/ClientNotificationCenter'

function Header({
  profile,
  isAuthLoading,
  onBag,
}: {
  profile: Profile | null
  isAuthLoading: boolean
  onBag: () => void
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const { showToast } = useToast()

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
    showToast('Signed out successfully.', 'info')
    window.location.reload()
  }

  return (
    <header className="container-cv relative flex items-center justify-between py-6">
      <button
        onClick={() => setMobileMenuOpen((prev) => !prev)}
        className="md:hidden p-1.5 rounded-lg text-foreground hover:bg-muted transition-colors cursor-pointer"
        aria-label="Toggle menu"
      >
        <Menu size={22} />
      </button>

      <a href="#top" className="font-display text-2xl tracking-tight">
        caramel<span className="text-primary">.</span>vibe
      </a>

      {/* Desktop Navigation */}
      <nav className="hidden gap-8 text-xs font-bold uppercase tracking-widest md:flex items-center">
        <a href="#edit" className="hover:text-primary transition-colors">The edit</a>
        <a href="#atelier" className="hover:text-primary transition-colors flex items-center gap-1">
          <span>Atelier Sessions</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </a>
        <a href="#story" className="hover:text-primary transition-colors">Our story</a>
        <a href="#faq" className="hover:text-primary transition-colors">Questions</a>
      </nav>

      {/* Auth & Reserve Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {profile && <ClientNotificationCenter userId={profile.id} />}

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
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/80 hover:text-primary transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-accent" />
                    <span>Member Dashboard</span>
                  </Link>

                  <Link
                    href="/sessions"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/80 hover:text-primary transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Atelier Sessions</span>
                  </Link>

                  <Link
                    href="/client/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/80 hover:text-primary transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-primary" />
                    <span>My Profile</span>
                  </Link>

                  {profile.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/80 hover:text-primary transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span>Admin Console</span>
                    </Link>
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
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors px-2 py-1"
          >
            Sign In
          </Link>
        )}

        <button
          onClick={onBag}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-primary/30 px-3.5 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer shadow-xs"
        >
          <span className="hidden sm:inline">Reserve Bag</span>
          <span className="sm:hidden">Reserve</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/20 text-inherit">
            0{products.length}
          </span>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-xl p-5 z-40 md:hidden animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest">
            <a
              href="#edit"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-primary transition-colors"
            >
              The edit
            </a>
            <a
              href="#atelier"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-primary transition-colors flex items-center justify-between"
            >
              <span>Atelier Sessions</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary">Live</span>
            </a>
            <Link
              href="/sessions"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-primary hover:underline"
            >
              Full Calendar Catalog →
            </Link>
            <a
              href="#story"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-primary transition-colors"
            >
              Our story
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-primary transition-colors"
            >
              Questions
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}

function LandingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])
  const { showToast } = useToast()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  const [index, setIndex] = useState(0)
  const [bagDrawerOpen, setBagDrawerOpen] = useState(false)
  const [selectedBag, setSelectedBag] = useState<Product>(products[0])

  // Sessions Drawer State
  const [selectedSession, setSelectedSession] = useState<LandingShowcaseSession | null>(null)
  const [sessionDrawerOpen, setSessionDrawerOpen] = useState(false)

  // Auth checking
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

  // Auto-advance hero carousel
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % products.length), 6500)
    return () => clearInterval(timer)
  }, [])

  const currentHeroProduct = products[index]

  // Intent Recovery on Load (e.g. returning from login with redirect param)
  useEffect(() => {
    if (isAuthLoading) return

    const reserveBagParam = searchParams.get('reserveBag')
    const bookSessionIdParam = searchParams.get('bookSessionId')

    if (reserveBagParam) {
      if (profile) {
        const targetProd =
          products.find(
            (p) => p.name.toLowerCase() === decodeURIComponent(reserveBagParam).toLowerCase()
          ) || products[0]
        setSelectedBag(targetProd)
        setBagDrawerOpen(true)
        showToast(`Resumed reservation for ${targetProd.name}`, 'info')
        // Clean URL parameter cleanly
        window.history.replaceState({}, '', window.location.pathname)
      }
    } else if (bookSessionIdParam) {
      if (profile) {
        async function loadAndOpenSession() {
          const { data: sData } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', bookSessionIdParam)
            .single()

          if (sData) {
            const { data: tData } = await supabase
              .from('session_types')
              .select('category')
              .eq('id', sData.session_type_id)
              .single()

            setSelectedSession({
              ...sData,
              category_name: tData?.category || 'Atelier Experience',
            })
            setSessionDrawerOpen(true)
            showToast(`Resumed booking for ${sData.title}`, 'info')
            window.history.replaceState({}, '', window.location.pathname)
          }
        }
        loadAndOpenSession()
      }
    }
  }, [searchParams, profile, isAuthLoading, supabase, showToast])

  // Gated Bag Reservation Trigger
  const handleBagReserveClick = (productToSelect?: Product) => {
    const targetProd = productToSelect || currentHeroProduct

    if (!profile) {
      showToast('Please sign in to complete your private bag reservation.', 'info')
      router.push(`/login?redirect=${encodeURIComponent(`/?reserveBag=${encodeURIComponent(targetProd.name)}`)}`)
      return
    }

    setSelectedBag(targetProd)
    setBagDrawerOpen(true)
  }

  // Gated Session Booking Trigger
  const handleSessionBookingClick = (session: LandingShowcaseSession) => {
    if (!profile) {
      showToast('Please sign in to reserve your atelier experience spot.', 'info')
      router.push(`/login?redirect=${encodeURIComponent(`/?bookSessionId=${session.id}`)}`)
      return
    }

    setSelectedSession(session)
    setSessionDrawerOpen(true)
  }

  const heroCta = (
    <button
      onClick={() => handleBagReserveClick(currentHeroProduct)}
      className="group flex items-center gap-4 bg-primary px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground rounded-xl shadow-lg hover:bg-primary/95 transition-all hover:-translate-y-0.5 cursor-pointer active:scale-[0.99]"
    >
      <span>Secure this vibe</span>
      <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
    </button>
  )

  return (
    <>
      <div id="top">
        <Header
          profile={profile}
          isAuthLoading={isAuthLoading}
          onBag={() => handleBagReserveClick()}
        />
      </div>

      <main>
        {/* Hero Section */}
        <section className="container-cv grid min-h-[680px] items-center gap-12 py-12 md:grid-cols-[.9fr_1.1fr] md:py-20">
          <div className="order-2 md:order-1">
            <div className="flex items-center gap-2">
              <p className="eyebrow">A considered collection · Kabul / Worldwide</p>
            </div>
            <h1 className="font-display mt-6 max-w-xl text-6xl leading-[.95] tracking-tight md:text-8xl">
              Good bags have <em className="text-primary">stories.</em>
            </h1>
            <p className="mt-8 max-w-md text-base leading-7 text-muted-foreground">
              Pre-loved pieces, carefully chosen. For the woman who knows that the best accessory is the one that already has a life.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {heroCta}
              <a
                href="#atelier"
                className="inline-flex items-center gap-2 px-5 py-4 rounded-xl border border-border bg-card text-xs font-bold uppercase tracking-widest text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <span>Book Atelier Session</span>
                <Calendar size={15} className="text-primary" />
              </a>
            </div>
            <div className="mt-12 flex items-center gap-5 text-xs text-muted-foreground">
              <ShieldCheck size={18} className="text-accent" /> Every piece authenticated &amp; lovingly inspected
            </div>
          </div>

          <div className="relative order-1 flex min-h-[440px] items-center justify-center bg-muted md:order-2 md:min-h-[590px] rounded-3xl overflow-hidden border border-border/80">
            <div className="absolute left-6 top-6 eyebrow">
              0{index + 1} / 0{products.length}
            </div>
            <Image
              key={currentHeroProduct.image}
              src={currentHeroProduct.image}
              alt={currentHeroProduct.name}
              width={620}
              height={620}
              priority
              className="h-[400px] w-[90%] object-contain md:h-[540px] transition-all duration-700 hover:scale-105"
            />
            <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between bg-card/80 backdrop-blur-md p-4 rounded-2xl border border-border/60">
              <div>
                <p className="font-display text-2xl text-foreground">{currentHeroProduct.name}</p>
                <p className="mt-1 text-sm font-bold text-primary">{currentHeroProduct.price}</p>
              </div>
              <div className="flex gap-2">
                <button
                  aria-label="Previous product"
                  onClick={() => setIndex((index - 1 + products.length) % products.length)}
                  className="border border-border bg-card p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  aria-label="Next product"
                  onClick={() => setIndex((index + 1) % products.length)}
                  className="border border-border bg-card p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* The Edit Section */}
        <section id="edit" className="border-y border-border py-20 bg-background">
          <div className="container-cv">
            <div className="flex items-end justify-between">
              <div>
                <p className="eyebrow">The edit</p>
                <h2 className="font-display mt-3 text-5xl">Found, not forced.</h2>
              </div>
              <span className="hidden text-sm text-muted-foreground sm:block font-mono">
                0{products.length} pieces in rotation
              </span>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {products.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setIndex(i)
                    handleBagReserveClick(p)
                  }}
                  className="group text-left rounded-2xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="bg-muted p-6 rounded-xl flex items-center justify-center overflow-hidden">
                      <Image
                        src={p.image}
                        alt={p.name}
                        width={400}
                        height={400}
                        className="h-64 w-full object-contain transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="mt-4 px-1">
                      <p className="font-display text-2xl text-foreground group-hover:text-primary transition-colors">
                        {p.name}
                      </p>
                      <p className="mt-1 text-sm font-bold text-primary">{p.price}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{p.detail}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-primary">
                    <span>Reserve Piece</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Live Supabase Atelier Sessions Showcase with Gated Booking */}
        <LandingSessionsShowcase onSelectSession={handleSessionBookingClick} />

        {/* Brand Story Section */}
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
              <div className="p-4 rounded-xl bg-card border border-border/80">
                <p className="mb-2 font-bold uppercase tracking-widest text-foreground">01 · Authentic</p>
                <p className="text-xs">Every item is inspected, authenticated, and restored before it reaches you.</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/80">
                <p className="mb-2 font-bold uppercase tracking-widest text-foreground">02 · Personal</p>
                <p className="text-xs">One-of-one pieces, chosen to elevate your collection&apos;s next chapter.</p>
              </div>
            </div>
            <div>{heroCta}</div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-foreground py-20 text-card">
          <div className="container-cv grid gap-8 md:grid-cols-3">
            <div className="p-6 rounded-2xl bg-foreground/90 border border-card/10">
              <p className="eyebrow text-accent">Kind words</p>
              <p className="mt-4 font-display text-2xl sm:text-3xl">“The bag feels like it was waiting for me.”</p>
              <p className="mt-5 text-xs uppercase tracking-widest text-card/60">— Marzia, Kabul</p>
            </div>
            <div className="p-6 rounded-2xl bg-foreground/90 border border-card/10">
              <p className="eyebrow text-accent">Kind words</p>
              <p className="mt-4 font-display text-2xl sm:text-3xl">“Beautifully wrapped, exactly as pictured.”</p>
              <p className="mt-5 text-xs uppercase tracking-widest text-card/60">— Laila, Herat</p>
            </div>
            <div className="p-6 rounded-2xl bg-foreground/90 border border-card/10">
              <p className="eyebrow text-accent">Kind words</p>
              <p className="mt-4 font-display text-2xl sm:text-3xl">“My new everyday heirloom.”</p>
              <p className="mt-5 text-xs uppercase tracking-widest text-card/60">— Soraya, Dubai</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="container-cv max-w-3xl py-24">
          <p className="eyebrow">Good to know</p>
          <h2 className="font-display mt-3 text-5xl">Questions, answered.</h2>
          <div className="mt-10 divide-y divide-border">
            {[
              ['Are the bags authentic?', 'Yes. Every piece is carefully inspected and authenticated with provenance records before listing.'],
              ['How do Atelier Sessions work?', 'You can reserve a spot for our in-person private styling, authentication salons, or leather care masterclasses directly from the studio calendar.'],
              ['How does delivery work?', 'We coordinate delivery details privately after your reservation, with safe courier shipping available across Kabul and worldwide.'],
              ['Can I return a piece?', 'Because each piece is one-of-one, we invite you to review all condition details before confirming. Our concierge team is here to assist on WhatsApp.'],
            ].map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-display text-xl text-foreground">
                  {q}
                  <ChevronDown size={18} className="transition-transform group-open:rotate-180 text-muted-foreground" />
                </summary>
                <p className="max-w-xl pt-4 text-sm leading-7 text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-10 bg-card">
        <div className="container-cv flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-2xl">caramel<span className="text-primary">.</span>vibe</p>
            <p className="text-xs text-muted-foreground mt-1">Archival Handbag Boutique &amp; Private Atelier</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/sessions" className="text-xs font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors">
              Atelier Calendar
            </Link>
            <a href="https://instagram.com" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors">
              <Camera size={16} /> Instagram
            </a>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Caramel Vibe. All rights reserved.</p>
        </div>
      </footer>

      {/* Upgraded Bag Reservation Slide-Over Drawer */}
      <BagReservationDrawer
        initialProduct={selectedBag}
        isOpen={bagDrawerOpen}
        onClose={() => setBagDrawerOpen(false)}
      />

      {/* Direct In-Landing Atelier Session Booking Drawer */}
      <ClientBookingDrawer
        session={selectedSession}
        isOpen={sessionDrawerOpen}
        onClose={() => setSessionDrawerOpen(false)}
        onSuccess={() => {
          setSessionDrawerOpen(false)
          showToast('Atelier experience spot reserved successfully!', 'success')
        }}
      />
    </>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs uppercase tracking-widest text-muted-foreground">Loading Caramel Vibe...</div>}>
      <LandingContent />
    </Suspense>
  )
}
