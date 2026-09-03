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
  AlertCircle
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (updateError) {
        throw updateError
      }

      setAvatarUrl(filePath)
      setProfile((prev) => (prev ? { ...prev, avatar_url: filePath } : null))
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

      // Update database profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setAvatarUrl(null)
      setPreviewBlob(null)
      setProfile((prev) => (prev ? { ...prev, avatar_url: null } : null))
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
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: fullName.trim() || null,
              phone: phone.trim() || null,
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

  if (loading) {
    return (
      <div className="container-cv py-16 text-center text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>Loading member profile...</span>
      </div>
    )
  }

  return (
    <div className="container-cv py-8 max-w-4xl space-y-8">
      {/* Header Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Settings</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Member Profile
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your personal identity, avatar image, and studio contact preferences.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              Role: {profile?.role?.toUpperCase()}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#3e6b48]/10 text-[#3e6b48] border border-[#3e6b48]/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{profile?.status?.toUpperCase()}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar Management */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center space-y-5 h-fit shadow-sm">
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

        {/* Right Column: Personal Information Form */}
        <div className="md:col-span-2 space-y-6">
          <form
            onSubmit={handleSaveProfile}
            className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm"
          >
            <div className="border-b border-border pb-4">
              <h2 className="font-display font-bold text-xl text-foreground">
                Personal Information
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Keep your profile details up to date for appointment confirmations and atelier communications.
              </p>
            </div>

            <div className="space-y-4">
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
              </div>

              {/* Email (Read-Only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Email Address (Primary Login)</span>
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted/40 text-muted-foreground text-sm cursor-not-allowed select-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  Email address is linked to your authentication credentials and cannot be edited directly.
                </p>
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
              </div>
            </div>

            {/* Account Metadata Row */}
            <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-background border border-border space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                  <span>Access Tier</span>
                </div>
                <div className="font-bold text-foreground capitalize">
                  {profile?.role === 'admin'
                    ? 'Atelier Administrator'
                    : profile?.role === 'client'
                    ? 'Verified Atelier Client'
                    : 'Standard Member'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-background border border-border space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  <span>Member Since</span>
                </div>
                <div className="font-bold text-foreground">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Active'}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
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
        </div>
      </div>
    </div>
  )
}
