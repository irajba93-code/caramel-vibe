'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  alt?: string
}

const SIZE_MAP = {
  xs: { container: 'w-6 h-6 text-[10px]', icon: 12, dimension: 24 },
  sm: { container: 'w-8 h-8 text-xs', icon: 14, dimension: 32 },
  md: { container: 'w-10 h-10 text-sm', icon: 18, dimension: 40 },
  lg: { container: 'w-16 h-16 text-xl', icon: 26, dimension: 64 },
  xl: { container: 'w-24 h-24 text-3xl', icon: 38, dimension: 96 },
}

export function Avatar({
  src,
  name,
  size = 'md',
  className = '',
  alt,
}: AvatarProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const initials = useMemo(() => {
    if (!name || !name.trim()) return ''
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }, [name])

  useEffect(() => {
    let isMounted = true
    setHasError(false)

    if (!src || !src.trim()) {
      setResolvedUrl(null)
      return
    }

    const trimmedSrc = src.trim()

    // If it's a data URL or blob URL (e.g. from local file picker preview)
    if (trimmedSrc.startsWith('data:') || trimmedSrc.startsWith('blob:')) {
      setResolvedUrl(trimmedSrc)
      return
    }

    // If it's already a full signed URL containing token
    if (trimmedSrc.includes('token=')) {
      setResolvedUrl(trimmedSrc)
      return
    }

    // Extract storage object path if a full URL was stored
    let objectPath = trimmedSrc
    if (trimmedSrc.includes('/storage/v1/object/')) {
      const parts = trimmedSrc.split('/storage/v1/object/')
      const afterObject = parts[1]
      // Format could be public/avatars/... or sign/avatars/... or avatars/...
      const segments = afterObject.split('/')
      if (segments[0] === 'public' || segments[0] === 'sign' || segments[0] === 'authenticated') {
        segments.shift() // remove prefix
      }
      if (segments[0] === 'avatars') {
        segments.shift() // remove bucket name
      }
      objectPath = segments.join('/')
    }

    // Request a signed URL from Supabase Storage for the private bucket
    async function fetchSignedUrl() {
      setLoading(true)
      try {
        const { data, error } = await supabase.storage
          .from('avatars')
          .createSignedUrl(objectPath, 3600) // 1 hour validity

        if (isMounted) {
          if (error || !data?.signedUrl) {
            // If signed url failed, try direct url or fallback
            setHasError(true)
            setResolvedUrl(null)
          } else {
            setResolvedUrl(data.signedUrl)
          }
        }
      } catch {
        if (isMounted) {
          setHasError(true)
          setResolvedUrl(null)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchSignedUrl()

    return () => {
      isMounted = false
    }
  }, [src, supabase])

  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md

  if (resolvedUrl && !hasError) {
    return (
      <div
        className={`relative inline-block rounded-full overflow-hidden shrink-0 border border-primary/20 bg-muted/40 ${sizeConfig.container} ${className}`}
      >
        <Image
          src={resolvedUrl}
          alt={alt || name || 'User avatar'}
          width={sizeConfig.dimension}
          height={sizeConfig.dimension}
          className="w-full h-full object-cover"
          unoptimized
          onError={() => setHasError(true)}
        />
      </div>
    )
  }

  // Fallback state (Initials or Icon)
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 border border-primary/20 bg-primary/10 text-primary font-bold tracking-wider select-none ${sizeConfig.container} ${className}`}
      aria-label={name || 'User avatar'}
    >
      {initials ? (
        <span>{initials}</span>
      ) : (
        <User size={sizeConfig.icon} className="text-primary/70" />
      )}
    </div>
  )
}
