import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

import {
  generateDimensionQuestions,
  calculateAllocation,
  getAllocationRationale,
  DIMENSION_ORDER,
} from '@/lib/geminiQuestions'
import { getAIAllocation } from '@/lib/allocateQuestions'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const maxDuration = 60
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const rateLimitMap = new Map()

function getClientIp(request) {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

function checkRateLimit(ip) {
  const now = Date.now()
  const hour = 60 * 60 * 1000
  const record = rateLimitMap.get(ip)

  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + hour })
    return true
  }
  if (now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + hour })
    return true
  }
  if (record.count >= 10) return false

  record.count += 1
  rateLimitMap.set(ip, record)
  return true
}

function validateDimensionQuestions(questions, dimension, expectedCount) {
  if (!Array.isArray(questions)) throw new Error('questions must be an array')

  if (questions.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} questions, got ${questions.length}`)
  }

  for (const q of questions) {
    if (!q.questionText?.trim()) throw new Error(`Empty question text (id: ${q.id})`)
    if (!Array.isArray(q.options) || q.options.length !== 5) {
      throw new Error(`Question ${q.id} must have exactly 5 options`)
    }
    const scores = q.options.map((o) => o.score)
    if (!scores.every((s, i) => s === i + 1)) {
      throw new Error(`Question ${q.id} options must have scores 1-5 in order`)
    }
  }
}

export async function POST(request) {
  console.log('[generate-questions] POST received')

  try {
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (body.mode === 'allocate') {
      console.log('[generate-questions] ALLOCATE mode requested')
      const { industryLabel, orgSize } = body

      if (!industryLabel || !orgSize) {
        return NextResponse.json(
          { error: 'industryLabel and orgSize are required for allocation' },
          { status: 400 }
        )
      }

      try {
        const result = await getAIAllocation(industryLabel, orgSize)
        if (result) {
          console.log('[generate-questions] Returning AI allocation result')
          return NextResponse.json(result)
        }

        console.warn('[generate-questions] AI allocation unavailable, using static fallback')
        return NextResponse.json({
          allocation: calculateAllocation(industryLabel),
          rationale: getAllocationRationale(industryLabel),
          isAI: false,
        })
      } catch (err) {
        console.error('[generate-questions] Allocation error:', err.message)
        console.warn('[generate-questions] Falling back to static allocation after error')
        return NextResponse.json({
          allocation: calculateAllocation(industryLabel),
          rationale: getAllocationRationale(industryLabel),
          isAI: false,
        })
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured.' }, { status: 500 })
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ error: 'Database service not configured.' }, { status: 500 })
    }

    const {
      name,
      companyName,
      email,
      region,
      industry,
      industryLabel,
      orgSize,
      dimension,
      questionCount,
      orderStart = 1,
      previousAnswers = [],

      sessionId: existingSessionId,
    } = body || {}

    const trimmedName = name?.trim()
    const trimmedIndustry = industry?.trim()
    const trimmedOrgSize = orgSize?.trim()
    const resolvedIndustryLabel = industryLabel?.trim() || trimmedIndustry

    if (!trimmedName || !trimmedIndustry || !trimmedOrgSize) {
      return NextResponse.json(
        { error: 'name, industry, and orgSize are required.' },
        { status: 400 }
      )
    }

    if (!dimension || !DIMENSION_ORDER.includes(dimension)) {
      return NextResponse.json(
        { error: `dimension must be one of: ${DIMENSION_ORDER.join(', ')}` },
        { status: 400 }
      )
    }

    const resolvedCount = Number(questionCount)
    if (!resolvedCount || resolvedCount < 2 || resolvedCount > 5) {
      return NextResponse.json(
        { error: 'questionCount must be between 2 and 5.' },
        { status: 400 }
      )
    }

    const clientIp = getClientIp(request)
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const sessionId = existingSessionId || nanoid(12)
    const isFirstDimension = !existingSessionId

    let questions
    try {
      questions = await generateDimensionQuestions(
        { industryLabel: resolvedIndustryLabel, orgSize: trimmedOrgSize, companyName: companyName?.trim() },
        dimension,
        resolvedCount,
        Number(orderStart),
        previousAnswers
      )
    } catch (err) {
      console.error('[generate-questions] AI error:', err.message)
      const isRateLimit = err.status === 429 || String(err.message).includes('429')
      return NextResponse.json(
        { error: isRateLimit ? 'AI rate limit exceeded. Please wait a minute and try again.' : err.message },
        { status: isRateLimit ? 429 : 500 }
      )
    }

    try {
      validateDimensionQuestions(questions, dimension, resolvedCount)
    } catch (err) {
      console.error('[generate-questions] Validation failed:', err.message)
      return NextResponse.json(
        { error: 'Generated questions failed quality check. Please try again.' },
        { status: 500 }
      )
    }

    if (isFirstDimension) {
      const allocation = calculateAllocation(resolvedIndustryLabel)
      const rationale = getAllocationRationale(resolvedIndustryLabel)

      const { error: dbError } = await supabaseAdmin.from('session_questions').insert({
        session_id: sessionId,
        respondent_name: trimmedName,
        company_name: companyName?.trim() || null,
        email: email?.trim() || null,
        region: region || null,
        industry: trimmedIndustry,
        industry_label: resolvedIndustryLabel,
        org_size: trimmedOrgSize,
        questions,
        dimension_allocation: allocation,
        allocation_rationale: rationale,
      })

      if (dbError) {
        console.error('[generate-questions] DB insert error (non-fatal):', dbError.message)
      }
    } else {
      const { data: existing } = await supabaseAdmin
        .from('session_questions')
        .select('questions')
        .eq('session_id', sessionId)
        .single()

      const existingQuestions = existing?.questions || []
      const merged = [...existingQuestions, ...questions]

      const { error: dbError } = await supabaseAdmin
        .from('session_questions')
        .update({ questions: merged })
        .eq('session_id', sessionId)

      if (dbError) {
        console.error('[generate-questions] DB update error (non-fatal):', dbError.message)
      }
    }

    return NextResponse.json({
      sessionId,
      questions,
      dimension,
      isFirstDimension,
    })
  } catch (err) {
    console.error('[generate-questions] Unexpected error:', err)
    return NextResponse.json(
      { error: err.message || 'Unable to generate questions.' },
      { status: 500 }
    )
  }
}
