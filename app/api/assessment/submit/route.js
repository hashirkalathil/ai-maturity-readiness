import { NextResponse } from 'next/server'
import {
  DIMENSION_ORDER,
  DIMENSION_WEIGHTS,
  MATURITY_LEVELS,
} from '@/constants/dimensions'
import { generateGroqReport } from '@/lib/groqReport'
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

    if (!orgSize || !industry || !answers || !Object.keys(answers).length) {
      return NextResponse.json(
        { error: 'Organization size, industry, and answers are required.' },
        { status: 400 }
      )
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

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

    const questions = sessionData?.questions || fallbackQuestions || []

    if (!questions.length) {
      return NextResponse.json({ error: 'Session not found' }, { status: 400 })
    }

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

    const scoring = runScoringPipeline(answers, questions)
    const resolvedIndustryLabel = industryLabel || industryResult.data?.label || industry

    let report

    try {
      report = await generateGroqReport({
        companyName: name || companyName,
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
    } catch {
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

    const { error } = await supabaseAdmin.from('responses').insert({
      session_id: sessionId,
      respondent_name: name || null,
      company_name: companyName || null,
      email: email || null,
      region: region || null,
      org_size: orgSize,
      industry,
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
      throw error
    }

    return NextResponse.json({ sessionId })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Unable to submit assessment.' },
      { status: 500 }
    )
  }
}
