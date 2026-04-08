import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

import { generateQuestions } from '@/lib/groqQuestions'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { DIMENSION_ORDER } from '@/constants/dimensions'

export const maxDuration = 60
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

console.log('[generate-questions] Module loaded')

const rateLimitMap = new Map()

function getClientIp(request) {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
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

  if (record.count >= 10) {
    return false
  }

  record.count += 1
  rateLimitMap.set(ip, record)
  return true
}

function validateQuestionsComprehensive(result) {
  const { questions, dimensionAllocation } = result

  if (!questions || !Array.isArray(questions)) {
    throw new Error('Questions must be an array')
  }

  if (questions.length !== 16) {
    throw new Error(`Expected 16 questions, got ${questions.length}`)
  }

  const dimensionCounts = {}
  for (const q of questions) {
    const dim = q.dimension
    dimensionCounts[dim] = (dimensionCounts[dim] || 0) + 1
  }

  const underrepresented = DIMENSION_ORDER.filter(
    (dim) => !dimensionCounts[dim] || dimensionCounts[dim] < 2
  )
  if (underrepresented.length > 0) {
    throw new Error(
      `Dimensions need at least 2 questions each: ${underrepresented.join(', ')}`
    )
  }

  const ids = questions.map((q) => q.id)
  const uniqueIds = new Set(ids)
  if (ids.length !== uniqueIds.size) {
    throw new Error('Duplicate question IDs found')
  }

  for (const q of questions) {
    if (!q.questionText || q.questionText.trim().length === 0) {
      throw new Error('Empty question text found')
    }
    if (q.questionText.length > 200) {
      throw new Error(`Question too long: ${q.questionText.substring(0, 50)}...`)
    }

    if (!q.options || q.options.length !== 5) {
      throw new Error(`Question ${q.id} does not have 5 options`)
    }

    const scores = q.options.map((o) => o.score)
    const expectedScores = [1, 2, 3, 4, 5]
    if (scores.some((s, i) => s !== expectedScores[i])) {
      throw new Error(`Question ${q.id} options must have scores 1-5 in order`)
    }

    for (const opt of q.options) {
      if (!opt.text || opt.text.trim().length === 0) {
        throw new Error(`Empty option text in question ${q.id}`)
      }
    }
  }
}

export async function POST(request) {
  console.log('[generate-questions] POST request received')
  try {
    // 1. Check Configuration
    if (!process.env.GROQ_API_KEY) {
      console.error('[CONFIG ERROR] Missing GROQ_API_KEY')
      return NextResponse.json({ error: 'AI service not configured.' }, { status: 500 })
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[CONFIG ERROR] Missing SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.json({ error: 'Database service not configured.' }, { status: 500 })
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('[CONFIG ERROR] Missing NEXT_PUBLIC_SUPABASE_URL')
      return NextResponse.json({ error: 'Database URL not configured.' }, { status: 500 })
    }

    let body
    try {
      body = await request.json()
      console.log('[generate-questions] Body parsed:', {
        industry: body?.industry,
        orgSize: body?.orgSize,
        hasAnswers: !!body?.answers
      })
    } catch (e) {
      console.error('[PARSE ERROR] Failed to parse request body:', e.message)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    const name = body?.name?.trim()
    const companyName = body?.companyName?.trim()
    const email = body?.email?.trim()
    const region = body?.region
    const industry = body?.industry?.trim()
    const orgSize = body?.orgSize?.trim()
    const industryLabel = body?.industryLabel?.trim()

    if (!name || !industry || !orgSize) {
      return NextResponse.json(
        { error: 'name, industry, and orgSize are required' },
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

    const sessionId = nanoid(12)

    let result

    try {
      console.log('[generate-questions] Calling generateQuestions...')
      result = await generateQuestions(industryLabel || industry, orgSize, companyName)
      console.log('[generate-questions] generateQuestions completed successfully')
    } catch (error) {
      console.error('[AI ERROR] Question generation failed:', error.message)
      return NextResponse.json(
        { error: `Failed to generate questions: ${error.message}` },
        { status: 500 }
      )
    }

    try {
      validateQuestionsComprehensive(result)
    } catch (error) {
      console.error('[VALIDATION ERROR]:', error.message, 'Result:', JSON.stringify(result).substring(0, 500))
      return NextResponse.json(
        { error: 'Generated questions failed quality check. Please try again.' },
        { status: 500 }
      )
    }

    const { error } = await supabaseAdmin.from('session_questions').insert({
      session_id: sessionId,
      respondent_name: name,
      company_name: companyName || null,
      email: email || null,
      region: region || null,
      industry: industry,
      industry_label: industryLabel || industry,
      org_size: orgSize,
      questions: result.questions,
      dimension_allocation: result.dimensionAllocation,
      allocation_rationale: result.allocationRationale,
    })

    if (error) {
      console.error('Database insert failed:', error)
    }

    return NextResponse.json({
      sessionId,
      questions: result.questions,
      dimensionAllocation: result.dimensionAllocation,
      allocationRationale: result.allocationRationale,
      company_name: companyName || null,
      email: email || null,
      region: region || null,
      sessionStored: !error,
    })
  } catch (error) {
    console.error('Unexpected error in generate-questions:', error)
    return NextResponse.json(
      { error: error.message || 'Unable to generate questions.' },
      { status: 500 }
    )
  }
}
