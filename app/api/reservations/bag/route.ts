import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      productName,
      productPrice,
      productImage,
      productDetail,
      fullName,
      email,
      phone,
      shippingAddress,
      paymentMethod,
      specialRequests,
      referenceNumber,
    } = body

    // 1. Attempt to get authenticated user from server session
    let userId: string | null = null
    try {
      const serverSupabase = await createServerClient()
      const {
        data: { user },
      } = await serverSupabase.auth.getUser()
      if (user) {
        userId = user.id
      }
    } catch {
      // session context unavailable
    }

    // 2. Admin client fallback for reliable insertion & profile matching
    const adminSupabase = createAdminClient()
    if (!userId && email) {
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()
      if (profile) userId = profile.id
    }

    const ref = referenceNumber || `CV-RSV-${Math.floor(100000 + Math.random() * 900000)}`
    const nowIso = new Date().toISOString()

    const notificationPayload = {
      recipient_id: userId,
      recipient_email: email,
      recipient_phone: phone || null,
      notification_type: 'bag_reservation_inquiry',
      channel: 'in_app',
      subject: `Archival Handbag Reserved: ${productName} (#${ref})`,
      message: `Your reservation inquiry for ${productName} (${productPrice}) has been placed. Reference #${ref}. Our private concierge will confirm delivery details via WhatsApp.`,
      status: 'unread',
      metadata: {
        is_read: false,
        reference_number: ref,
        product_name: productName,
        product_price: productPrice,
        product_image: productImage,
        product_detail: productDetail,
        client_name: fullName,
        client_email: email,
        client_phone: phone,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        special_requests: specialRequests,
        status: 'Pending Concierge Confirmation',
        created_at: nowIso,
      },
    }

    const { data: insertedNotif, error: notifError } = await adminSupabase
      .from('system_notifications_log')
      .insert(notificationPayload)
      .select()
      .single()

    if (notifError) {
      console.error('Error inserting system_notifications_log:', notifError)
    }

    // Insert into admin audit logs
    await adminSupabase.from('admin_audit_logs').insert({
      admin_id: userId,
      target_type: 'bag_reservation',
      target_id: ref,
      action: 'create_bag_reservation_inquiry',
      reason: `Client ${fullName} (${email}) reserved ${productName}`,
      details: notificationPayload.metadata,
    })

    return NextResponse.json({
      success: true,
      referenceNumber: ref,
      notification: insertedNotif,
    })
  } catch (error: any) {
    console.error('Bag reservation API error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to process bag reservation' },
      { status: 500 }
    )
  }
}
