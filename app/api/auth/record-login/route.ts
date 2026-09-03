import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    await supabase.from('user_login_history').insert({
      user_id: user.id,
      ip_address: ip.split(',')[0].trim(),
      user_agent: userAgent,
      auth_method: 'password',
      status: 'success',
      login_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging login history:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
