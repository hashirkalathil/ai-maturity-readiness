import { notFound } from 'next/navigation'

import DeleteResponseButton from '@/components/admin/DeleteResponseButton'
import DimensionScoreTable from '@/components/results/DimensionScoreTable'
import GapCard from '@/components/results/GapCard'
import OpportunityCard from '@/components/results/OpportunityCard'
import RiskCard from '@/components/results/RiskCard'
import StrengthCard from '@/components/results/StrengthCard'
import Badge from '@/components/ui/Badge'
import { requireAdminSession } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Circle } from 'lucide-react'

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

  const answerIds = Object.keys(response.answers || {}).map(Number).filter(Boolean)
  const { data: questions = [] } = answerIds.length
    ? await supabaseAdmin.from('questions').select('*').in('id', answerIds)
    : { data: [] }

  const questionMap = new Map(questions.map((question) => [String(question.id), question]))
  const report = response.report || {}

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
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {`${response.industry} | ${response.org_size} | ${new Date(response.completed_at).toLocaleString()}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={response.maturity_level}>{response.maturity_label}</Badge>
            <DeleteResponseButton sessionId={response.session_id} />
          </div>
        </div>
      </div>

      <DimensionScoreTable
        dimensionScores={response.dimension_scores}
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
            <div className="w-full flex flex-row gap-4 items-center" key={strength.headline}>
              <Circle className="h-4 w-4 text-emerald-500 mt-2" />
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
            <div className="w-full flex flex-row gap-4 items-center" key={gap.headline}>
              <Circle className="h-4 w-4 text-rose-500 mt-2" />
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
        <div className="grid gap-1 grid-cols-1">
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
            <div className="w-full flex flex-row gap-4 items-center" key={`${risk.risk}-${index}`}>
              <Circle className="h-4 w-4 text-amber-500 mt-2" />
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
        <div className="mt-5 space-y-3">
          {Object.entries(response.answers || {}).map(([questionId, score]) => {
            const question = questionMap.get(questionId)
            const option = question?.options?.find(
              (item) => Number(item.score) === Number(score)
            )

            return (
              <details
                key={questionId}
                className="rounded-lg border border-slate-200 px-5 py-4"
              >
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                  {question?.question_text || `Question ${questionId}`}
                </summary>
                <p className="mt-4 text-sm font-medium text-cyan-700">
                  {`Selected score ${score}`}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {option?.text || 'Answer text unavailable.'}
                </p>
              </details>
            )
          })}
        </div>
      </section>
    </div>
  )
}
