import { notFound } from 'next/navigation'
import { FileText } from 'lucide-react'

import { MATURITY_LEVELS } from '@/constants/dimensions'
import BlockerAlert from '@/components/results/BlockerAlert'
import DimensionRadarChart from '@/components/results/DimensionRadarChart'
import DimensionScoreTable from '@/components/results/DimensionScoreTable'
import GapCard from '@/components/results/GapCard'
import MaturityHero from '@/components/results/MaturityHero'
import OpportunityCard from '@/components/results/OpportunityCard'
import PDFDownloadButton from '@/components/results/PDFDownloadButton'
import RiskCard from '@/components/results/RiskCard'
import StrengthCard from '@/components/results/StrengthCard'
import UnevenMaturityBanner from '@/components/results/UnevenMaturityBanner'
import { createClient } from '@/lib/supabase/server'

async function getResponse(sessionId) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (error) {
    return null
  }

  return data
}

function getLevelMeta(level) {
  return MATURITY_LEVELS.find((item) => item.level === level) || MATURITY_LEVELS[0]
}

function formatIndustryLabel(industry) {
  return String(industry || '')
    .split('-')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

export default async function ResultsPage({ params }) {
  const { sessionId } = await params
  const response = await getResponse(sessionId)

  if (!response) {
    notFound()
  }

  const report = response.report || {}
  const dimensionScores = response.dimension_scores || {}
  const strengths = report.keyStrengths || []
  const gaps = report.keyGaps || []
  const opportunities = report.immediateOpportunities || []
  const risks = report.risksAndBlockers || []
  const levelMeta = getLevelMeta(response.maturity_level)
  const industryLabel = formatIndustryLabel(response.industry)

  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-10">
        <div className="space-y-8">

          <MaturityHero
            maturityLevel={response.maturity_level}
            maturityLabel={response.maturity_label}
            overallScore={response.overall_score}
            rawOverallScore={response.raw_overall_score}
            blockerDimension={response.blocker_dimension}
            executiveSummary={
              report.executiveSummary ||
              'Your organization assessment is complete and the report has been generated successfully.'
            }
            maturityNarrative={report.maturityNarrative}
          />

          <DimensionRadarChart dimensionScores={dimensionScores} />

          <DimensionScoreTable
            dimensionScores={dimensionScores}
            blockerDimension={response.blocker_dimension}
          />

          <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Roadmap
            </p>
            <p className="mt-5 text-base leading-6 text-slate-600">
              {report.roadmapRecommendation}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">
                    Export
                  </h2>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
