import { NextResponse } from 'next/server'

import { requireAdminSession, unauthorizedJson } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabase/admin'

async function ensureSession() {
  try {
    await requireAdminSession()
    return null
  } catch {
    return unauthorizedJson()
  }
}

export async function PUT(request, { params }) {
  const unauthorized = await ensureSession()
  if (unauthorized) {
    return unauthorized
  }

  const resolvedParams = await params
  const body = await request.json()
  const { data, error } = await supabaseAdmin
    .from('questions')
    .update({
      dimension: body.dimension,
      scope: body.scope,
      industries: body.scope === 'industry' ? body.industries || [] : [],
      question_text: body.question_text,
      sort_order: body.sort_order || 1,
      options: body.options || [],
    })
    .eq('id', resolvedParams.id)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request, { params }) {
  const unauthorized = await ensureSession()
  if (unauthorized) {
    return unauthorized
  }

  const resolvedParams = await params
  const body = await request.json()
  const { data, error } = await supabaseAdmin
    .from('questions')
    .update(body)
    .eq('id', resolvedParams.id)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(_request, { params }) {
  const unauthorized = await ensureSession()
  if (unauthorized) {
    return unauthorized
  }

  const resolvedParams = await params
  const { data, error } = await supabaseAdmin
    .from('questions')
    .update({ is_active: false })
    .eq('id', resolvedParams.id)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
