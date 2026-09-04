'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastContext'
import { Avatar } from '@/components/ui/Avatar'
import {
  Camera,
  Trash2,
  Save,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Copy,
  Check,
  Clock,
  Fingerprint,
  Crown,
  ShieldAlert,
  Info,
} from 'lucide-react'
import type { Profile } from '@/lib/supabase/types'

export default function ProfilePage() {
  const router = useRouter()
  const { showToast } = useToast()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  // Form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [previewBlob, setPreviewBlob] = useState<string | null>(null)

  useEffect(() => {
    async function loadUserProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?redirect=/client/profile')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        showToast('Failed to load profile details.', 'error')
      } else if (data) {
        const p = data as Profile
        setProfile(p)
        setFullName(p.full_name || '')
        setPhone(p.phone || '')
        setAvatarUrl(p.avatar_url)
      }
      setLoading(false)
    }

    loadUserProfile()
  }, [router, supabase, showToast])

  const handleCopyId = async () => {
    if (!profile?.id) return
    try {
      await navigator.clipboard.writeText(profile.id)
      setCopiedId(true)
      showToast('Account User ID copied to clipboard.', 'info')
      setTimeout(() => setCopiedId(false), 2500)
    } catch {
      showToast('Failed to copy ID to clipboard.', 'error')
    }
  }

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      showToast('Please upload a valid image (JPEG, PNG, WEBP, or GIF).', 'error')
      return
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Profile image must be smaller than 5MB.', 'error')
      return
    }

    // Generate local blob preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewBlob(objectUrl)
    setUploadingAvatar(true)

    try {
      const fileExt = file.name.split('.').pop() || 'jpg'
      const filePath = `${profile.id}/avatar-${Date.now()}.${fileExt}`
      const nowIso = new Date().toISOString()

      // Upload to Supabase Storage avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        throw uploadError
      }

      // Update profiles record
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: filePath,
          updated_at: nowIso,
        })
        .eq('id', profile.id)

      if (updateError) {
        throw updateError
      }

      setAvatarUrl(filePath)
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              avatar_url: filePath,
              updated_at: nowIso,
            }
          : null
      )
      showToast('Profile picture updated successfully.', 'success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      showToast(`Error uploading avatar: ${message}`, 'error')
      setPreviewBlob(null)
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    if (!profile || !avatarUrl) return

    setUploadingAvatar(true)
    try {
      // If there's an existing object in storage, attempt to delete it
      if (avatarUrl.includes(profile.id)) {
        let pathToDelete = avatarUrl
        if (avatarUrl.includes('/storage/v1/object/')) {
          const parts = avatarUrl.split('/storage/v1/object/')
          const segs = parts[1].split('/')
          if (['public', 'sign', 'authenticated'].includes(segs[0])) segs.shift()
          if (segs[0] === 'avatars') segs.shift()
          pathToDelete = segs.join('/')
        }
        await supabase.storage.from('avatars').remove([pathToDelete])
      }

      const nowIso = new Date().toISOString()
      // Update database profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: null,
          updated_at: nowIso,
        })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setAvatarUrl(null)
      setPreviewBlob(null)
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              avatar_url: null,
              updated_at: nowIso,
            }
          : null
      )
      showToast('Profile photo removed.', 'info')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Removal failed'
      showToast(`Failed to remove avatar: ${message}`, 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    try {
      const nowIso = new Date().toISOString()
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
          updated_at: nowIso,
        })
        .eq('id', profile.id)

      if (error) throw error

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: fullName.trim() || null,
              phone: phone.trim() || null,
              updated_at: nowIso,
            }
          : null
      )
      showToast('Profile information saved successfully.', 'success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Save failed'
      showToast(`Error saving profile: ${message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '—'
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return isoString
    }
  }

  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return '—'
    try {
      return new Date(isoString).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  if (loading) {
    return (
      <div className="container-cv py-16 text-center text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>Loading member dossier...</span>
      </div>
    )
  }

  const isRestricted = profile?.status === 'banned' || profile?.status === 'rejected'

  return (
    <div className="container-cv py-8 max-w-5xl space-y-8">
      {/* Header Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Settings • Luxury Atelier</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Member Profile &amp; Dossier
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your personal identity, atelier contact preferences, account standing, and security identifiers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Role Badge */}
            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${
                profile?.role === 'admin'
                  ? 'bg-accent/15 text-accent border-accent/30'
                  : profile?.role === 'client'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-muted/60 text-muted-foreground border-border'
              }`}
            >
              {profile?.role === 'admin' && <Crown className="w-3.5 h-3.5" />}
              {profile?.role === 'client' && <Sparkles className="w-3.5 h-3.5" />}
              {profile?.role === 'user' && <User className="w-3.5 h-3.5" />}
              <span>Role: {profile?.role?.toUpperCase()}</span>
            </span>

            {/* Status Badge */}
            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${
                profile?.status === 'active'
                  ? 'bg-[#3e6b48]/10 text-[#3e6b48] border-[#3e6b48]/25'
                  : profile?.status === 'banned'
                  ? 'bg-[#9e3b32]/10 text-[#9e3b32] border-[#9e3b32]/25'
                  : 'bg-[#c2782b]/10 text-[#c2782b] border-[#c2782b]/25'
              }`}
            >
              {profile?.status === 'active' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {profile?.status === 'banned' && <AlertCircle className="w-3.5 h-3.5" />}
              {profile?.status === 'rejected' && <AlertTriangle className="w-3.5 h-3.5" />}
              <span>Status: {profile?.status?.toUpperCase()}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Moderation / Ban Reason Notice Banner */}
      {isRestricted ? (
        <div className="p-5 rounded-2xl bg-[#9e3b32]/10 border border-[#9e3b32]/30 text-[#9e3b32] space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>Account Notice: Restriction Active ({profile?.status?.toUpperCase()})</span>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed pl-7">
            {profile?.ban_reason
              ? `Reason on record: "${profile.ban_reason}"`
              : 'Your account is currently subject to atelier administrative restrictions. Booking privileges may be limited.'}
          </p>
          <p className="text-[11px] text-muted-foreground pl-7">
            If you believe this status is in error, please contact atelier concierge at{' '}
            <span className="font-semibold text-foreground underline">concierge@caramelvibe.com</span>.
          </p>
        </div>
      ) : (
        <div className="px-5 py-3 rounded-xl bg-[#3e6b48]/10 border border-[#3e6b48]/20 text-[#3e6b48] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">Account in Good Standing</span>
            <span className="hidden sm:inline text-muted-foreground">— Full access to appointments, waitlists, and atelier services.</span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#3e6b48] bg-[#3e6b48]/10 px-2 py-0.5 rounded-md">
            Verified
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Account Identifiers Card */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center space-y-5 shadow-sm">
            <div className="relative group">
              {/* Avatar Display */}
              <div className="relative">
                <Avatar
                  src={previewBlob || avatarUrl}
                  name={fullName || profile?.email}
                  size="xl"
                  className="w-32 h-32 ring-4 ring-primary/10 shadow-md"
                />
                {uploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-foreground/50 flex items-center justify-center text-card">
                    <Loader2 className="w-7 h-7 animate-spin text-accent" />
                  </div>
                )}
              </div>

              {/* Quick Camera Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                aria-label="Upload profile picture"
                className="absolute bottom-0 right-0 p-2.5 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarFileSelect}
              className="hidden"
            />

            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-foreground">
                {fullName || 'Atelier Member'}
              </h3>
              <p className="text-xs text-muted-foreground break-all">{profile?.email}</p>
            </div>

            {/* Action buttons */}
            <div className="w-full pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="w-full py-2.5 px-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>Change Photo</span>
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  className="w-full py-2 px-4 rounded-xl border border-border hover:border-destructive/40 hover:bg-destructive/10 text-muted-foreground hover:text-destructive text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Supported formats: JPG, PNG, WEBP, GIF. Max file size: 5MB. Stored securely in private cloud storage.
            </p>
          </div>

          {/* Account ID / UUID Card */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Fingerprint className="w-4 h-4 text-primary" />
                <span>Account ID (UUID)</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                PK
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-foreground truncate select-all" title={profile?.id}>
                {profile?.id}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                title="Copy User UUID"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0 cursor-pointer"
              >
                {copiedId ? (
                  <Check className="w-4 h-4 text-[#3e6b48]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Unique database identifier used across booking logs, session rosters, and system notifications.
            </p>
          </div>

          {/* Timestamp Dossier Card */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-accent" />
              <span>Audit Timestamps</span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-border/60">
              <div className="pt-1 flex items-center justify-between">
                <span className="text-muted-foreground">Member Since:</span>
                <span className="font-semibold text-foreground">{formatDate(profile?.created_at)}</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-semibold text-foreground">{formatDateTime(profile?.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Form & Governance Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Edit Form */}
          <form
            onSubmit={handleSaveProfile}
            className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm"
          >
            <div className="border-b border-border pb-4">
              <h2 className="font-display font-bold text-xl text-foreground">
                Personal Information
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Keep your details updated for appointment confirmations, invitations, and atelier communications.
              </p>
            </div>

            <div className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Genevieve Laurent"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/60"
                />
                <p className="text-[11px] text-muted-foreground">
                  Your official name displayed on session attendance lists and appointment dossiers.
                </p>
              </div>

              {/* Email Address (Read-Only) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Email Address (Primary Login)</span>
                  </label>
                  <span className="text-[10px] font-semibold text-muted-foreground bg-muted/70 px-2 py-0.5 rounded">
                    Read-Only
                  </span>
                </div>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted/40 text-muted-foreground text-sm cursor-not-allowed select-none"
                />
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Info className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span>Email is bound to your secure authentication credentials.</span>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>Phone / WhatsApp Contact</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 019-2834"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/60"
                />
                <p className="text-[11px] text-muted-foreground">
                  Used for SMS notifications, waitlist availability alerts, and atelier concierge inquiries.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* System Governance & Permissions Section */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="border-b border-border pb-4">
              <h2 className="font-display font-bold text-xl text-foreground">
                Membership Standing &amp; Governance
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Overview of your privileges, security tier, and membership standing within Caramel Vibe.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Access Tier */}
              <div className="p-4 rounded-xl bg-background border border-border space-y-1.5">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span>Access Tier (`role`)</span>
                </div>
                <div className="font-bold text-foreground capitalize text-sm">
                  {profile?.role === 'admin'
                    ? 'Atelier Administrator'
                    : profile?.role === 'client'
                    ? 'Verified Atelier Client'
                    : 'Standard Member'}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {profile?.role === 'admin'
                    ? 'Full executive administration, session scheduling, and client management permissions.'
                    : profile?.role === 'client'
                    ? 'Automatic promotion granted after first atelier booking. Includes priority waitlisting.'
                    : 'Standard registered account with appointment reservation privileges.'}
                </p>
              </div>

              {/* Account Status */}
              <div className="p-4 rounded-xl bg-background border border-border space-y-1.5">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#3e6b48]" />
                  <span>Account Standing (`status`)</span>
                </div>
                <div className="font-bold text-foreground capitalize text-sm flex items-center gap-2">
                  <span>{profile?.status}</span>
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      profile?.status === 'active'
                        ? 'bg-[#3e6b48]'
                        : profile?.status === 'banned'
                        ? 'bg-[#9e3b32]'
                        : 'bg-[#c2782b]'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {profile?.status === 'active'
                    ? 'Account is in good standing with full booking and concierge access.'
                    : profile?.status === 'banned'
                    ? 'Account is restricted from booking new appointments.'
                    : 'Application under review or declined by administration.'}
                </p>
              </div>

              {/* Moderation Details */}
              <div className="p-4 rounded-xl bg-background border border-border space-y-1.5">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  <span>Moderation Notes (`ban_reason`)</span>
                </div>
                <div className="text-xs text-foreground font-medium">
                  {profile?.ban_reason ? (
                    <span className="text-[#9e3b32] font-semibold">{profile.ban_reason}</span>
                  ) : (
                    <span className="text-muted-foreground">No active restrictions or sanctions recorded.</span>
                  )}
                </div>
              </div>

              {/* Registration Date */}
              <div className="p-4 rounded-xl bg-background border border-border space-y-1.5">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>Membership Date (`created_at`)</span>
                </div>
                <div className="text-xs font-bold text-foreground">
                  {formatDate(profile?.created_at)}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Official date record of your atelier account creation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
