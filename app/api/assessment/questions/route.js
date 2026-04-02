import { NextResponse } from 'next/server'

import { DIMENSION_ORDER } from '@/constants/dimensions'
import { createClient } from '@/lib/supabase/server'

const GLOBAL_COUNTS = {
  businessStrategy: 2,
  dataReadiness: 2,
  technologyInfrastructure: 1,
  talentSkills: 1,
  useCaseReadiness: 1,
  operationalReadiness: 1,
  aiGovernance: 2,
}

const INDUSTRY_COUNTS = {
  businessStrategy: 1,
  dataReadiness: 1,
  technologyInfrastructure: 1,
  talentSkills: 1,
  useCaseReadiness: 1,
  operationalReadiness: 1,
}

function sortQuestions(questions) {
  return [...questions].sort((left, right) => {
    const leftIndex = DIMENSION_ORDER.indexOf(left.dimension)
    const rightIndex = DIMENSION_ORDER.indexOf(right.dimension)

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex
    }

    return (left.sort_order || 0) - (right.sort_order || 0)
  })
}

async function fetchQuestions({
  supabase,
  scope,
  dimension,
  limit,
  industry,
  excludeIds = [],
}) {
  let query = supabase
    .from('questions')
    .select('*')
    .eq('scope', scope)
    .eq('dimension', dimension)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(limit)

  if (scope === 'industry') {
    query = query.contains('industries', [industry])
  }

  if (excludeIds.length) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data || []
}

export async function GET(request) {
  const industry = request.nextUrl.searchParams.get('industry')

  if (!industry) {
    return NextResponse.json(
      { error: 'Industry is required.' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()
    const selected = []

    for (const dimension of DIMENSION_ORDER) {
      const count = GLOBAL_COUNTS[dimension] || 0

      if (!count) {
        continue
      }

      const questions = await fetchQuestions({
        supabase,
        scope: 'global',
        dimension,
        limit: count,
      })

      selected.push(...questions)
    }

    for (const dimension of DIMENSION_ORDER) {
      const count = INDUSTRY_COUNTS[dimension] || 0

      if (!count) {
        continue
      }

      const excludeIds = selected.map((question) => question.id)
      const industryQuestions = await fetchQuestions({
        supabase,
        scope: 'industry',
        dimension,
        limit: count,
        industry,
        excludeIds,
      })

      selected.push(...industryQuestions)

      if (industryQuestions.length < count) {
        const fallbackQuestions = await fetchQuestions({
          supabase,
          scope: 'global',
          dimension,
          limit: count - industryQuestions.length,
          excludeIds: selected.map((question) => question.id),
        })

        selected.push(...fallbackQuestions)
      }
    }

    const questions = sortQuestions(selected).slice(0, 16)

    return NextResponse.json({
      questions,
      total: 16,
      industry,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Unable to load assessment questions.' },
      { status: 500 }
    )
  }
}
