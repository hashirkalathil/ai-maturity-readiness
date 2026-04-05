import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { requireAdminSession, unauthorizedJson } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(_request, { params }) {
  try {
    await requireAdminSession()
  } catch {
    return unauthorizedJson()
  }

  const resolvedParams = await params
  const { data, error } = await supabaseAdmin
    .from('responses')
    .select('*')
    .eq('session_id', resolvedParams.sessionId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function DELETE(_request, { params }) {
  try {
    await requireAdminSession()
  } catch {
    return unauthorizedJson()
  }

  const resolvedParams = await params
  const { error } = await supabaseAdmin
    .from('responses')
    .delete()
    .eq('session_id', resolvedParams.sessionId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/admin/responses')
  revalidatePath('/admin/dashboard')

  return NextResponse.json({ success: true })
}
