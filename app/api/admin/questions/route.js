import { NextResponse } from 'next/server'

import { requireAdminSession, unauthorizedJson } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request) {
  try {
    await requireAdminSession()
  } catch {
    return unauthorizedJson()
  }

  const url = new URL(request.url)
  let query = supabaseAdmin.from('questions').select('*').order('sort_order')
  const industry = url.searchParams.get('industry')
  const dimension = url.searchParams.get('dimension')

  if (industry) {
    query = query.contains('industries', [industry])
  }

  if (dimension) {
    query = query.eq('dimension', dimension)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request) {
  try {
    await requireAdminSession()
  } catch {
    return unauthorizedJson()
  }

  const body = await request.json()

  if (!body.question_text || !body.dimension || !body.scope || !body.options?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('questions')
    .insert({
      question_id: body.question_id || `Q_${Date.now()}`,
      dimension: body.dimension,
      scope: body.scope,
      industries: body.scope === 'industry' ? body.industries || [] : [],
      question_text: body.question_text,
      sort_order: body.sort_order || 1,
      options: body.options,
      is_active: true,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
