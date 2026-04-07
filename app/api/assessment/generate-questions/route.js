import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

import { generateQuestions } from '@/lib/groqQuestions'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request) {
  const body = await request.json()
  const name = body?.name?.trim()
  const industry = body?.industry?.trim()
  const orgSize = body?.orgSize?.trim()
  const industryLabel = body?.industryLabel?.trim()

  if (!name || !industry || !orgSize) {
    return NextResponse.json(
      { error: 'name, industry, and orgSize are required' },
      { status: 400 }
    )
  }

  const sessionId = nanoid(12)

  let result

  try {
    result = await generateQuestions(industryLabel || industry, orgSize)
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }

  const { error } = await supabaseAdmin.from('session_questions').insert({
    session_id: sessionId,
    respondent_name: name,
    questions: result.questions,
    dimension_allocation: result.dimensionAllocation,
    allocation_rationale: result.allocationRationale,
    industry,
    org_size: orgSize,
  })

  return NextResponse.json({
    sessionId,
    questions: result.questions,
    dimensionAllocation: result.dimensionAllocation,
    allocationRationale: result.allocationRationale,
    sessionStored: !error,
  })
}
