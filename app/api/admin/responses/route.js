import { NextResponse } from 'next/server'

import { requireAdminSession, unauthorizedJson } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabase/admin'

function applyResponseFilters(query, params) {
  if (params.search) {
    query = query.or(
      `session_id.ilike.%${params.search}%,industry.ilike.%${params.search}%,org_size.ilike.%${params.search}%,maturity_label.ilike.%${params.search}%`
    )
  }

  if (params.industry) {
    query = query.eq('industry', params.industry)
  }

  if (params.level) {
    query = query.eq('maturity_level', Number(params.level))
  }

  if (params.from) {
    query = query.gte('completed_at', params.from)
  }

  if (params.to) {
    query = query.lte('completed_at', `${params.to}T23:59:59`)
  }

  return query
}

export async function GET(request) {
  try {
    await requireAdminSession()
  } catch {
    return unauthorizedJson()
  }

  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') || 1)
  const params = {
    search: url.searchParams.get('search') || '',
    industry: url.searchParams.get('industry') || '',
    level: url.searchParams.get('level') || '',
    from: url.searchParams.get('from') || '',
    to: url.searchParams.get('to') || '',
  }

  let query = supabaseAdmin
    .from('responses')
    .select(
      'session_id, org_size, industry, overall_score, maturity_level, maturity_label, blocker_dimension, completed_at',
      { count: 'exact' }
    )
    .order('completed_at', { ascending: false })

  query = applyResponseFilters(query, params).range((page - 1) * 20, page * 20 - 1)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data,
    count: count || 0,
    page,
    totalPages: Math.max(1, Math.ceil((count || 0) / 20)),
  })
}
