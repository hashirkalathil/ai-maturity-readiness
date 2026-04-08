import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Circle, FileText, Home } from 'lucide-react'
import { MATURITY_LEVELS } from '@/constants/dimensions'
import BlockerAlert from '@/components/results/BlockerAlert'
import DimensionScoreTable from '@/components/results/DimensionScoreTable'
import GapCard from '@/components/results/GapCard'
import MaturityHero from '@/components/results/MaturityHero'
import OpportunityCard from '@/components/results/OpportunityCard'
import RiskCard from '@/components/results/RiskCard'
import StrengthCard from '@/components/results/StrengthCard'
import UnevenMaturityBanner from '@/components/results/UnevenMaturityBanner'
import PDFDownloadButton from '@/components/results/PDFDownloadButton'
import Badge from '@/components/ui/Badge'
import { requireAdminSession } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Circle as CircleIcon } from 'lucide-react'

export default async function AdminResponseDetailPage({ params }) {
  await requireAdminSession()
  const resolvedParams = await params
  const { data: response } = await supabaseAdmin
    .from('responses')
    .select('*')
    .eq('session_id', resolvedParams.sessionId)
    .single()

  if (!response) {
    notFound()
  }

  const report = response.report || {}
  const dimensionScores = response.dimension_scores || {}
  const strengths = report.keyStrengths || []
  const gaps = report.keyGaps || []
  const opportunities = report.immediateOpportunities || []
  const risks = report.risksAndBlockers || []
  const levelMeta = MATURITY_LEVELS.find((item) => item.level === response.maturity_level) || MATURITY_LEVELS[0]

  function formatIndustryLabel(industry) {
    return String(industry || '')
      .split('-')
      .filter(Boolean)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(' ')
  }

  const industryLabel = formatIndustryLabel(response.industry)

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
              Response Detail
            </p>
            <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
              Session id: {response.session_id}
            </h1>
            <div className="mt-3 space-y-1 text-sm leading-7 text-slate-600">
              <p><strong>Industry:</strong> {response.industry}</p>
              <p><strong>Org Size:</strong> {response.org_size}</p>
              {response.respondent_name && (
                <p><strong>Respondent:</strong> {response.respondent_name}</p>
              )}
              {response.company_name && (
                <p><strong>Company:</strong> {response.company_name}</p>
              )}
              {response.email && (
                <p><strong>Email:</strong> {response.email}</p>
              )}
              {response.region && (
                <p><strong>Region:</strong> {response.region}</p>
              )}
              <p><strong>Date:</strong> {new Date(response.completed_at).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={response.maturity_level}>{response.maturity_label}</Badge>
            <Link
              href="/admin/responses"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Back to Responses
            </Link>
          </div>
        </div>
      </div>

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
          {(report.keyStrengths || []).map((strength) => (
            <div className='w-full flex flex-row gap-4 items-center' key={strength.headline}>
              <CircleIcon className='h-4 w-4 text-emerald-500 mt-2' />
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
          {(report.keyGaps || []).map((gap) => (
            <div className='w-full flex flex-row gap-4 items-center' key={gap.headline}>
              <CircleIcon className='h-4 w-4 text-rose-500 mt-2' />
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
          {(report.immediateOpportunities || []).map((opportunity, index) => (
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
          {(report.risksAndBlockers || []).map((risk, index) => (
            <div className='w-full flex flex-row gap-4 items-center' key={`${risk.risk}-${index}`}>
              <CircleIcon className='h-4 w-4 text-amber-500 mt-2' />
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
        <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Individual answers
        </p>
        <div className="mt-5 space-y-4">
          {(response.answers || []).map((answer, idx) => (
            <div key={answer.question_id || idx} className="rounded-lg border border-slate-200 px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  {answer.question_text}
                </p>
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700 uppercase">
                  {answer.dimension}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-emerald-700">
                Score: {answer.selected_score} / 5
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                <strong>Selected:</strong> {answer.selected_option_text}
              </p>
              {answer.all_options && answer.all_options.length > 0 && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    All options:
                  </p>
                  <ul className="mt-1 space-y-1">
                    {answer.all_options.map((opt, i) => (
                      <li key={i} className="text-xs text-slate-600">
                        <span className="font-semibold">{opt.label}.</span> {opt.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Link
          href="/admin/responses"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <Home className="h-4 w-4" />
          Back to Responses
        </Link>
      </div>
    </div>
  )
}
