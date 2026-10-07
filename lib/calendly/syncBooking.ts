'use client'

import { createClient } from '@/lib/supabase/client'
import type { CalendlyEventMessageData } from './types'

/**
 * Synchronizes a completed Calendly booking into Supabase:
 * - Inserts a system notification into `system_notifications_log`
 * - Inserts an audit log entry into `admin_audit_logs`
 * - Dispatches a local browser event to immediately update the notification bell badge
 */
export async function syncCalendlyScheduledEvent(payload?: CalendlyEventMessageData) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log('Calendly scheduled event received for anonymous user. Skipping database sync.')
      return null
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single()

    const userEmail = profile?.email || user.email || 'client@caramelvibe.com'
    const nowIso = new Date().toISOString()

    // 1. Insert in-app live notification into system_notifications_log
    const { data: notificationData, error: notifError } = await supabase
      .from('system_notifications_log')
      .insert({
        recipient_id: user.id,
        recipient_email: userEmail,
        notification_type: 'session_booking',
        channel: 'in_app',
        subject: 'Consultation Session Confirmed',
        message: 'Your atelier consultation via Calendly has been scheduled.',
        status: 'delivered',
        metadata: {
          user_id: user.id,
          title: 'Consultation Session Confirmed',
          description: 'Your atelier consultation via Calendly has been scheduled.',
          type: 'session_booking',
          read: false,
          is_read: false,
          event_uri: payload?.event?.uri || null,
          invitee_uri: payload?.invitee?.uri || null,
          created_at: nowIso,
        },
        created_at: nowIso,
      })
      .select()
      .single()

    if (notifError) {
      console.error('Error inserting system notification log:', notifError)
    }

    // 2. Insert audit log record into admin_audit_logs
    try {
      await supabase.from('admin_audit_logs').insert({
        admin_id: user.id,
        target_type: 'session_booking',
        target_id: user.id,
        action: 'calendly_session_booked',
        reason: 'Client completed Calendly consultation scheduling',
        details: {
          user_id: user.id,
          title: 'Consultation Session Confirmed',
          description: 'Your atelier consultation via Calendly has been scheduled.',
          type: 'session_booking',
          read: false,
          event_uri: payload?.event?.uri || null,
          invitee_uri: payload?.invitee?.uri || null,
          scheduled_at: nowIso,
        },
        created_at: nowIso,
      })
    } catch (auditErr) {
      console.warn('Audit log write skipped:', auditErr)
    }

    // 3. Immediately refresh local notification state in header badge
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('atelier-notification-refresh'))
    }

    return notificationData
  } catch (err) {
    console.error('Error in syncCalendlyScheduledEvent:', err)
    return null
  }
}
