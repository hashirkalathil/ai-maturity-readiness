import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

import { generateGroqReport } from '@/lib/groqReport'
import { runScoringPipeline } from '@/lib/scoring'
import { supabaseAdmin } from '@/lib/supabase/admin'

async function fetchAssessmentQuestions(industry) {
  const [globalResult, industryResult] = await Promise.all([
    supabaseAdmin
      .from('questions')
      .select('*')
      .eq('scope', 'global')
      .eq('is_active', true),
    supabaseAdmin
      .from('questions')
      .select('*')
      .eq('scope', 'industry')
      .eq('is_active', true)
      .contains('industries', [industry]),
  ])

  if (globalResult.error) {
    throw globalResult.error
  }

  if (industryResult.error) {
    throw industryResult.error
  }

  return [...(globalResult.data || []), ...(industryResult.data || [])]
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { companyName, orgSize, industry, industryLabel, answers } = body || {}

    if (!orgSize || !industry || !answers || !Object.keys(answers).length) {
      return NextResponse.json(
        { error: 'Organization size, industry, and answers are required.' },
        { status: 400 }
      )
    }

    const [questions, industryResult] = await Promise.all([
      fetchAssessmentQuestions(industry),
      supabaseAdmin
        .from('industries')
        .select('label')
        .eq('slug', industry)
        .single(),
    ])

    const scoring = runScoringPipeline(answers, questions)
    const resolvedIndustryLabel = industryLabel || industryResult.data?.label || industry

    let report

    try {
      report = await generateGroqReport({
        companyName,
        orgSize,
        industry,
        industryLabel,
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

    const sessionId = nanoid(12)
    const { error } = await supabaseAdmin.from('responses').insert({
      session_id: sessionId,
      company_name: companyName,
      org_size: orgSize,
      industry: industry,
      industry_name: resolvedIndustryLabel,
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
