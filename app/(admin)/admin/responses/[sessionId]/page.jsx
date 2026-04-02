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
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
              Response Detail
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {response.session_id}
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
        <h2 className="text-2xl font-semibold text-slate-950">Strengths</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {(report.keyStrengths || []).map((strength) => (
            <StrengthCard key={strength.headline} strength={strength} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-semibold text-slate-950">Gaps</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {(report.keyGaps || []).map((gap) => (
            <GapCard key={gap.headline} gap={gap} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-semibold text-slate-950">Opportunities</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {(report.immediateOpportunities || []).map((opportunity) => (
            <OpportunityCard key={opportunity.title} opportunity={opportunity} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-semibold text-slate-950">Risks</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {(report.risksAndBlockers || []).map((risk, index) => (
            <RiskCard key={`${risk.risk}-${index}`} risk={risk} />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Roadmap</h2>
        <p className="mt-4 text-base leading-8 text-slate-600">
          {report.roadmapRecommendation}
        </p>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Individual answers</h2>
        <div className="mt-6 space-y-3">
          {Object.entries(response.answers || {}).map(([questionId, score]) => {
            const question = questionMap.get(questionId)
            const option = question?.options?.find(
              (item) => Number(item.score) === Number(score)
            )

            return (
              <details
                key={questionId}
                className="rounded-2xl border border-slate-200 px-5 py-4"
              >
                <summary className="cursor-pointer font-semibold text-slate-900">
                  {question?.question_text || `Question ${questionId}`}
                </summary>
                <p className="mt-3 text-sm font-medium text-cyan-700">
                  {`Selected score ${score}`}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
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
