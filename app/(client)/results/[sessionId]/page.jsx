import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Circle, FileText, Home } from 'lucide-react'
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
          {response.respondent_name ? (
            <p className="mb-6 text-lg text-gray-600">
              Here are your results,{' '}
              <span className="font-medium text-gray-900">
                {response.respondent_name}
              </span>
              .
            </p>
          ) : null}

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

          {response.blocker_dimension ? (
            <BlockerAlert
              blockerDimension={response.blocker_dimension}
              dimensionScores={dimensionScores}
            />
          ) : null}

          {response.uneven_maturity ? (
            <UnevenMaturityBanner note={report.unevenMaturityNote} />
          ) : null}

          <DimensionRadarChart dimensionScores={dimensionScores} />

          <DimensionScoreTable
            dimensionScores={dimensionScores}
            blockerDimension={response.blocker_dimension}
          />

          <section className="space-y-5">
            <div>
              <h1 className="text-xl font-semibold uppercase tracking-wider text-emerald-700">
                Strengths
              </h1>
            </div>
            <div className="grid gap-1 grid-cols-1">
              {strengths.map((strength) => (
                <div className='w-full flex flex-row gap-4 items-center' key={strength.headline}>
                  <Circle className='h-4 w-4 text-emerald-500 mt-2' />
                  <StrengthCard strength={strength} />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <h1 className="text-xl font-semibold uppercase tracking-wider text-rose-700">
                Gaps
              </h1>
            </div>
            <div className="grid gap-1 grid-cols-1">
              {gaps.map((gap) => (
                <div className='w-full flex flex-row gap-4 items-center' key={gap.headline}>
                  <Circle className='h-4 w-4 text-rose-500 mt-2' />
                  <GapCard gap={gap} />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <p className="text-xl font-semibold uppercase tracking-wider text-cyan-700">
                Immediate next moves
              </p>
            </div>
            <div className="w-full grid gap-1 grid-cols-1">
              {opportunities.map((opportunity, index) => (
                <OpportunityCard
                  key={opportunity.title}
                  opportunity={opportunity}
                  step={index + 1}
                />
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <p className="text-xl font-semibold uppercase tracking-wider text-amber-700">
                Risks and blockers
              </p>
            </div>
            <div className="grid gap-1 grid-cols-1">
              {risks.map((risk, index) => (
                <div className='w-full flex flex-row gap-4 items-center' key={`${risk.risk}-${index}`}>
                  <Circle className='h-4 w-4 text-amber-500 mt-2' />
                  <RiskCard risk={risk} />
                </div>
              ))}
            </div>
          </section>

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
                    Next Steps
                  </h2>
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <PDFDownloadButton
                  respondentName={response.respondent_name}
                  orgSize={response.org_size}
                  industry={industryLabel}
                  maturityLevel={response.maturity_level}
                  maturityLabel={response.maturity_label}
                  overallScore={response.overall_score}
                  accentColor={levelMeta.color}
                  report={report}
                  dimensionScores={dimensionScores}
                />
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
