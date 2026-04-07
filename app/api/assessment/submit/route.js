import { NextResponse } from 'next/server'

import { generateGroqReport } from '@/lib/groqReport'
import { runScoringPipeline } from '@/lib/scoring'
import { supabaseAdmin } from '@/lib/supabase/admin'

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

    const [{ data: sessionData, error: sessionErr }, industryResult] = await Promise.all([
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

    const scoring = runScoringPipeline(answers, questions)
    const resolvedIndustryLabel = industryLabel || industryResult.data?.label || industry

    let report

    try {
      report = await generateGroqReport({
        companyName: name,
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
      org_size: orgSize,
      industry,
      answers,
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
