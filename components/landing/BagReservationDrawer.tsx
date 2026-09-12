'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  User,
  MapPin,
  CreditCard,
  MessageSquare,
  Package,
  ChevronDown,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { products, type Product } from '@/lib/products'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastContext'
import type { Profile } from '@/lib/supabase/types'

interface BagReservationDrawerProps {
  initialProduct: Product
  isOpen: boolean
  onClose: () => void
}

export function BagReservationDrawer({
  initialProduct,
  isOpen,
  onClose,
}: BagReservationDrawerProps) {
  const supabase = createClient()
  const { showToast } = useToast()

  const [selectedProduct, setSelectedProduct] = useState<Product>(initialProduct)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reservationSuccess, setReservationSuccess] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState('')

  // Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash on delivery')
  const [specialRequests, setSpecialRequests] = useState('')

  const drawerRef = useRef<HTMLDivElement>(null)

  // Sync initialProduct when opened or changed
  useEffect(() => {
    if (initialProduct) {
      setSelectedProduct(initialProduct)
    }
  }, [initialProduct])

  // Hydrate authenticated profile for auto-filling
  useEffect(() => {
    async function loadProfile() {
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
          const p = data as Profile
          setProfile(p)
          if (!fullName && p.full_name) setFullName(p.full_name)
          if (!email && p.email) setEmail(p.email)
          if (!phone && p.phone) setPhone(p.phone)
        }
      }
    }

    if (isOpen) {
      loadProfile()
    }
  }, [isOpen, supabase])

  // Accessibility: Escape key & body scroll lock
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleProductChange = (name: string) => {
    const found = products.find((p) => p.name === name)
    if (found) setSelectedProduct(found)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const generatedRef = `CV-RSV-${Math.floor(100000 + Math.random() * 900000)}`
    setReferenceNumber(generatedRef)

    try {
      const response = await fetch('/api/reservations/bag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: selectedProduct.name,
          productPrice: selectedProduct.price,
          productImage: selectedProduct.image,
          productDetail: selectedProduct.detail,
          fullName,
          email,
          phone,
          shippingAddress,
          paymentMethod,
          specialRequests,
          referenceNumber: generatedRef,
        }),
      })

      const result = await response.json()
      const finalRef = result.referenceNumber || generatedRef
      setReferenceNumber(finalRef)

      // Dispatch global refresh event for active notification bells and dashboard tabs
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('atelier-notification-refresh'))
      }

      setReservationSuccess(true)
      showToast(`Reservation inquiry #${finalRef} submitted successfully!`, 'success')
    } catch (err: unknown) {
      console.error('Error submitting reservation inquiry via API:', err)

      // Fallback: direct Supabase insert if API fails
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const inquiryPayload = {
          recipient_id: user?.id || null,
          recipient_email: email,
          recipient_phone: phone,
          notification_type: 'bag_reservation_inquiry',
          channel: 'in_app',
          subject: `Archival Handbag Reserved: ${selectedProduct.name} (#${generatedRef})`,
          message: `Your reservation inquiry for ${selectedProduct.name} (${selectedProduct.price}) has been placed. Reference #${generatedRef}. Our private concierge will confirm delivery details via WhatsApp.`,
          status: 'unread',
          metadata: {
            is_read: false,
            reference_number: generatedRef,
            product_name: selectedProduct.name,
            product_price: selectedProduct.price,
            product_image: selectedProduct.image,
            product_detail: selectedProduct.detail,
            client_name: fullName,
            client_email: email,
            client_phone: phone,
            shipping_address: shippingAddress,
            payment_method: paymentMethod,
            special_requests: specialRequests,
            status: 'Pending Concierge Confirmation',
            created_at: new Date().toISOString(),
          },
        }

        await supabase.from('system_notifications_log').insert(inquiryPayload)

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('atelier-notification-refresh'))
        }
      } catch (fallbackErr) {
        console.error('Fallback Supabase insert error:', fallbackErr)
      }

      setReservationSuccess(true)
      showToast('Reservation inquiry captured! Our concierge will contact you.', 'info')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Pre-filled WhatsApp direct link
  const whatsappMessage = encodeURIComponent(
    `Hello Caramel Vibe Concierge, I would like to confirm my private reservation inquiry for ${selectedProduct.name} (${selectedProduct.price}).\n\nReference: #${referenceNumber}\nName: ${fullName}\nPhone: ${phone}`
  )
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bag-reservation-title"
      className="fixed inset-0 z-50 flex justify-end bg-foreground/45 backdrop-blur-[2px] transition-all animate-in fade-in duration-200"
      onClick={(e) => {
        // Close on outside backdrop click
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={drawerRef}
        className="h-full w-full max-w-lg overflow-y-auto bg-card p-6 shadow-2xl sm:p-8 border-l border-border animate-in slide-in-from-right duration-300 flex flex-col justify-between"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="eyebrow">Private Reservation</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                1-of-1 Archival
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close reservation drawer"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Success State */}
          {reservationSuccess ? (
            <div className="py-8 flex flex-col items-start gap-6 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center border border-primary/30">
                <Sparkles size={28} />
              </div>

              <div>
                <h2
                  id="bag-reservation-title"
                  className="font-display text-4xl sm:text-5xl text-foreground"
                >
                  It&apos;s yours.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Thank you for securing <strong className="text-foreground">{selectedProduct.name}</strong>. Your archival piece is now reserved exclusively for you.
                </p>
              </div>

              {/* Inquiry Summary Card */}
              <div className="w-full rounded-2xl bg-background border border-border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-xl bg-muted p-2 shrink-0 border border-border/80 flex items-center justify-center">
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      width={64}
                      height={64}
                      className="object-contain max-h-12 w-auto"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base font-bold text-foreground truncate">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-xs text-primary font-semibold">
                      {selectedProduct.price}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {selectedProduct.detail}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-border/60" />

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider block font-bold">
                      Reference No.
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      #{referenceNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider block font-bold">
                      Settlement
                    </span>
                    <span className="text-foreground truncate block">{paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider block font-bold">
                      Client
                    </span>
                    <span className="text-foreground truncate block">{fullName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider block font-bold">
                      Status
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent">
                      <CheckCircle2 size={12} /> Pending Concierge
                    </span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Direct Action */}
              <div className="w-full space-y-2.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <MessageSquare size={16} />
                  <span>Connect with Concierge on WhatsApp</span>
                  <ExternalLink size={14} className="ml-0.5 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setReservationSuccess(false)
                    onClose()
                  }}
                  className="w-full py-3 rounded-xl border border-border bg-card text-xs font-bold uppercase tracking-widest text-foreground hover:bg-muted transition-colors cursor-pointer text-center"
                >
                  Keep Browsing Collection
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <ShieldCheck size={16} className="text-accent shrink-0" />
                <span>Our private concierge will review details and confirm worldwide delivery within 2 hours.</span>
              </div>
            </div>
          ) : (
            /* Reservation Form State */
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* Product Selector / Switcher */}
              <div className="rounded-2xl bg-background border border-border p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Selected Archival Piece
                  </span>
                  <span className="text-[10px] text-accent font-semibold flex items-center gap-1">
                    <ShieldCheck size={12} /> Authenticated
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="relative w-16 h-16 rounded-xl bg-muted p-2 shrink-0 border border-border/80 flex items-center justify-center">
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      width={64}
                      height={64}
                      className="object-contain max-h-12 w-auto"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="relative">
                      <select
                        value={selectedProduct.name}
                        onChange={(e) => handleProductChange(e.target.value)}
                        className="w-full appearance-none bg-card border border-border/80 rounded-lg px-2.5 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary pr-7 cursor-pointer"
                      >
                        {products.map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.name} — {p.price}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground truncate">
                      {selectedProduct.detail}
                    </p>
                  </div>
                </div>

                {/* Quick Thumbnail Switcher */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mr-1">
                    Pieces:
                  </span>
                  {products.map((p) => {
                    const isSelected = p.name === selectedProduct.name
                    return (
                      <button
                        type="button"
                        key={p.name}
                        onClick={() => setSelectedProduct(p)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                            : 'bg-muted/80 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span className="truncate max-w-[90px]">{p.name.replace('The ', '')}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground mb-1.5">
                    Full Name <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ariana Rostami"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                    <User size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground mb-1.5">
                      Email <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="client@luxury.com"
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                      <Mail size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground mb-1.5">
                      Phone / WhatsApp <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <input
                        required
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+93 79 123 4567"
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                      <Phone size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground mb-1.5">
                    Delivery / Shipping Destination <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      required
                      rows={2}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Street address, Suite / Villa, City, Country"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                    />
                    <MapPin size={15} className="absolute right-3.5 top-3 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground mb-1.5">
                    Preferred Settlement Method
                  </label>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary pr-9 cursor-pointer transition-all"
                    >
                      <option value="Cash on delivery">Cash on Delivery (Local Kabul / Studio Pick-up)</option>
                      <option value="Mobile wallet">Mobile Wallet (HesabPay / Hawala)</option>
                      <option value="Bank transfer">Direct Wire / International Bank Transfer</option>
                      <option value="Private Concierge Settlement">Private Concierge Consultation</option>
                    </select>
                    <CreditCard size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Optional Special Note */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Special Inscription or Packaging Notes <span className="font-normal text-[10px] lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Gift wrapping, specific delivery schedule, archival dust bag..."
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 bg-primary px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg hover:bg-primary/95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Securing Piece...</span>
                    </>
                  ) : (
                    <>
                      <span>Secure this vibe</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
                <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
                  No immediate charge. Our private concierge will reach out to confirm your reservation details.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer Guarantee */}
        {!reservationSuccess && (
          <div className="pt-4 border-t border-border/80 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-accent" /> 100% Authenticated Archival
            </span>
            <span className="flex items-center gap-1.5">
              <Package size={14} className="text-primary" /> Discreet Global Delivery
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
