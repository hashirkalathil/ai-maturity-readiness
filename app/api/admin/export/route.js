import { NextResponse } from 'next/server'

import { requireAdminSession, unauthorizedJson } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabase/admin'

function applyFilters(query, params) {
  if (params.from) {
    query = query.gte('completed_at', params.from)
  }

  if (params.to) {
    query = query.lte('completed_at', `${params.to}T23:59:59`)
  }

  if (params.industry?.length) {
    query = query.in('industry', params.industry)
  }

  if (params.level?.length) {
    query = query.in('maturity_level', params.level.map(Number))
  }

  return query
}

function csvEscape(value) {
  const stringValue = value == null ? '' : String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

export async function GET(request) {
  try {
    await requireAdminSession()
  } catch {
    return unauthorizedJson()
  }

  const url = new URL(request.url)
  const format = url.searchParams.get('format') || 'csv'
  const filters = {
    from: url.searchParams.get('from') || '',
    to: url.searchParams.get('to') || '',
    industry: url.searchParams.getAll('industry'),
    level: url.searchParams.getAll('level'),
  }

  let allRows = []
  let from = 0
  const batchSize = 1000

  while (true) {
    let query = supabaseAdmin
      .from('responses')
      .select('*')
      .order('completed_at', { ascending: false })
      .range(from, from + batchSize - 1)

    query = applyFilters(query, filters)
    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data?.length) {
      break
    }

    allRows = [...allRows, ...data]

    if (data.length < batchSize) {
      break
    }

    from += batchSize
  }

  if (format === 'json') {
    return NextResponse.json(allRows)
  }

  const headers = [
    'session_id',
    'completed_at',
    'industry',
    'org_size',
    'overall_score',
    'maturity_level',
    'maturity_label',
    'blocker_dimension',
    'uneven_maturity',
    'score_business_strategy',
    'score_data_readiness',
    'score_technology_infrastructure',
    'score_talent_skills',
    'score_use_case_readiness',
    'score_operational_readiness',
    'score_ai_governance',
  ]

  const rows = allRows.map((row) =>
    [
      row.session_id,
      row.completed_at,
      row.industry,
      row.org_size,
      row.overall_score,
      row.maturity_level,
      row.maturity_label,
      row.blocker_dimension,
      row.uneven_maturity,
      row.dimension_scores?.businessStrategy,
      row.dimension_scores?.dataReadiness,
      row.dimension_scores?.technologyInfrastructure,
      row.dimension_scores?.talentSkills,
      row.dimension_scores?.useCaseReadiness,
      row.dimension_scores?.operationalReadiness,
      row.dimension_scores?.aiGovernance,
    ]
      .map(csvEscape)
      .join(',')
  )

  const csv = [headers.join(','), ...rows].join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="ai-maturity-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
