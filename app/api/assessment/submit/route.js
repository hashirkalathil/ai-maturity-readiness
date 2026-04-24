import { NextResponse } from 'next/server'
import {
  DIMENSION_ORDER,
  DIMENSION_WEIGHTS,
  MATURITY_LEVELS,
} from '@/constants/dimensions'
import { generateGeminiReport } from '@/lib/geminiReport'
import { supabaseAdmin } from '@/lib/supabase/admin'

function roundToTwo(value) {
  return Math.round(value * 100) / 100
}

function findMatchingMaturityLevel(score) {
  return (
    MATURITY_LEVELS.find((entry) => score >= entry.min && score <= entry.max) ||
    MATURITY_LEVELS[MATURITY_LEVELS.length - 1]
  )
}

function computeDimensionScores(answers, questions) {
  const groupedScores = {}

  for (const question of questions || []) {
    const questionKey = question.id || question.question_id
    const score = answers?.[questionKey]

    if (score === undefined) {
      continue
    }

    const numericScore = Number(score)
    const { dimension } = question

    if (!dimension || Number.isNaN(numericScore)) {
      continue
    }

    if (!groupedScores[dimension]) {
      groupedScores[dimension] = []
    }

    groupedScores[dimension].push(numericScore)
  }

  return Object.fromEntries(
    Object.entries(groupedScores).map(([dimension, scores]) => {
      const average = scores.reduce((sum, value) => sum + value, 0) / scores.length
      return [dimension, roundToTwo(average)]
    })
  )
}

function computeWeightedScore(dimensionScores) {
  const dimensions = Object.keys(dimensionScores || {})

  if (!dimensions.length) {
    return 0
  }

  const { weightedSum, totalWeight } = dimensions.reduce(
    (accumulator, dimension) => {
      const weight = DIMENSION_WEIGHTS[dimension] || 0
      const score = Number(dimensionScores[dimension])

      if (!weight || Number.isNaN(score)) {
        return accumulator
      }

      return {
        weightedSum: accumulator.weightedSum + score * weight,
        totalWeight: accumulator.totalWeight + weight,
      }
    },
    { weightedSum: 0, totalWeight: 0 }
  )

  if (!totalWeight) {
    return 0
  }

  return roundToTwo(weightedSum / totalWeight)
}

function classifyMaturity(rawScore, dimensionScores) {
  const orderedDimensions = DIMENSION_ORDER.filter(
    (dimension) => typeof dimensionScores?.[dimension] === 'number'
  )
  const fallbackDimensions = Object.keys(dimensionScores || {}).filter(
    (dimension) => !orderedDimensions.includes(dimension)
  )
  const rankedDimensions = [...orderedDimensions, ...fallbackDimensions]

  const blockerDimension = rankedDimensions.find(
    (dimension) => dimensionScores[dimension] < 2
  )
  const overallScore = roundToTwo(
    blockerDimension ? Math.min(rawScore, MATURITY_LEVELS[1].max) : rawScore
  )
  const matchingLevel = findMatchingMaturityLevel(overallScore)
  const values = rankedDimensions.map((dimension) => dimensionScores[dimension])
  const unevenMaturity =
    values.length > 1 && Math.max(...values) - Math.min(...values) > 2

  return {
    maturityLevel: matchingLevel.level,
    maturityLabel: matchingLevel.label,
    overallScore,
    blockerDimension: blockerDimension || null,
    unevenMaturity,
  }
}

function runScoringPipeline(answers, questions) {
  const dimensionScores = computeDimensionScores(answers, questions)
  const rawOverallScore = computeWeightedScore(dimensionScores)
  const classification = classifyMaturity(rawOverallScore, dimensionScores)

  return {
    dimensionScores,
    rawOverallScore,
    maturityLevel: classification.maturityLevel,
    maturityLabel: classification.maturityLabel,
    overallScore: classification.overallScore,
    blockerDimension: classification.blockerDimension,
    unevenMaturity: classification.unevenMaturity,
  }
}

export async function POST(request) {
  console.log('[submit] POST /api/assessment/submit received')
  try {
    const body = await request.json()
    const {
      orgSize,
      industry,
      industryLabel,
      answers,
      sessionId,
      name,
      companyName,
      email,
      region,
      questions: fallbackQuestions,
    } = body || {}

    console.log('[submit] Request body parsed:', {
      sessionId,
      orgSize,
      industry,
      answerCount: Object.keys(answers || {}).length,
      questionCount: fallbackQuestions?.length || 0,
    })

    if (!orgSize || !industry || !answers || !Object.keys(answers).length) {
      console.log('[submit] Validation failed: missing required fields')
      return NextResponse.json(
        { error: 'Organization size, industry, and answers are required.' },
        { status: 400 }
      )
    }

    if (!sessionId) {
      console.log('[submit] Validation failed: missing sessionId')
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

    if (!name || !name.trim()) {
      console.log('[submit] Validation failed: missing respondent name')
      return NextResponse.json({ error: 'Respondent name is required.' }, { status: 400 })
    }

    if (!companyName || !companyName.trim()) {
      console.log('[submit] Validation failed: missing company name')
      return NextResponse.json({ error: 'Company name is required.' }, { status: 400 })
    }

    console.log('[submit] Fetching session data from database...')
    const [{ data: sessionData }, industryResult] = await Promise.all([
      supabaseAdmin
        .from('session_questions')
        .select('questions')
        .eq('session_id', sessionId)
        .single(),
      supabaseAdmin
        .from('industries')
        .select('label')
        .eq('slug', industry)
        .single(),
    ])

    console.log('[submit] Database queries completed:', {
      sessionDataFound: !!sessionData,
      sessionQuestionCount: sessionData?.questions?.length || 0,
      industryFound: !!industryResult?.data,
    })

    const questions = sessionData?.questions || fallbackQuestions || []

    if (!questions.length) {
      console.log('[submit] Validation failed: no questions found')
      return NextResponse.json({ error: 'Session not found' }, { status: 400 })
    }

    console.log('[submit] Building enriched answers...')
    const enrichedAnswers = Object.entries(answers).map(([questionId, score]) => {
      const question = questions.find(q => String(q.id) === String(questionId))
      if (!question) return null
      const option = question.options?.find(o => Number(o.score) === Number(score))
      return {
        question_id: questionId,
        question_text: question.question_text || question.questionText,
        dimension: question.dimension,
        selected_score: score,
        selected_option_text: option?.text || '',
        all_options: question.options || [],
      }
    }).filter(Boolean)

    console.log('[submit] Running scoring pipeline...')
    const scoring = runScoringPipeline(answers, questions)
    console.log('[submit] Scoring complete:', {
      dimensionCount: Object.keys(scoring.dimensionScores).length,
      overallScore: scoring.overallScore,
      maturityLevel: scoring.maturityLevel,
    })

    const resolvedIndustryLabel = industryLabel || industryResult.data?.label || industry

    let report

    console.log('[submit] Generating Gemini report...')
    try {
      const startTime = Date.now()
      report = await generateGeminiReport({
        companyName: companyName || name,
        orgSize,
        industry,
        industryLabel: resolvedIndustryLabel,
        dimensionScores: scoring.dimensionScores,
        overallScore: scoring.overallScore,
        rawOverallScore: scoring.rawOverallScore,
        maturityLevel: scoring.maturityLevel,
        maturityLabel: scoring.maturityLabel,
        blockerDimension: scoring.blockerDimension,
        unevenMaturity: scoring.unevenMaturity,
        answers,
        questions,
      })
      const elapsed = Date.now() - startTime
      console.log('[submit] Gemini report generated successfully in', elapsed, 'ms')
    } catch (reportError) {
      console.error('[submit] Gemini report generation failed, using fallback:', reportError.message)
      report = {
        executiveSummary: `Assessment completed for ${resolvedIndustryLabel} with a Level ${scoring.maturityLevel} (${scoring.maturityLabel}) profile.`,
        maturityNarrative:
          'A fallback report was stored because the AI report generator was unavailable during submission.',
        keyStrengths: [],
        keyGaps: [],
        immediateOpportunities: [],
        risksAndBlockers: [],
        roadmapRecommendation:
          'Re-run report generation when the AI service is available to enrich the recommendations.',
        blockerRuleTriggered: Boolean(scoring.blockerDimension),
        blockerDimension: scoring.blockerDimension,
        unevenMaturityWarning: Boolean(scoring.unevenMaturity),
        unevenMaturityNote: scoring.unevenMaturity
          ? 'Capability maturity is uneven across dimensions.'
          : null,
      }
    }

    console.log('[submit] Inserting response into database...')
    const { error } = await supabaseAdmin.from('responses').insert({
      session_id: sessionId,
      respondent_name: name || null,
      company_name: companyName || null,
      email: email || null,
      region: region || null,
      org_size: orgSize,
      industry,
      industry_name: resolvedIndustryLabel,
      answers: enrichedAnswers,
      dimension_scores: scoring.dimensionScores,
      raw_overall_score: scoring.rawOverallScore,
      overall_score: scoring.overallScore,
      maturity_level: scoring.maturityLevel,
      maturity_label: scoring.maturityLabel,
      blocker_dimension: scoring.blockerDimension,
      uneven_maturity: scoring.unevenMaturity,
      report,
    })

    if (error) {
      console.error('[submit] Database insert error:', error.message)
      throw error
    }

    console.log('[submit] Response successfully inserted. Returning sessionId:', sessionId)
    return NextResponse.json({ sessionId })
  } catch (error) {
    console.error('[submit] Unexpected error:', error.message || error)
    return NextResponse.json(
      { error: error.message || 'Unable to submit assessment.' },
      { status: 500 }
    )
  }
}
