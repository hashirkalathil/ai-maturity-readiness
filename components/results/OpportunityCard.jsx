import { Clock3, Sparkles } from 'lucide-react'

export default function OpportunityCard({ opportunity }) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-cyan-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-700">
              Opportunity
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              <Clock3 className="h-3.5 w-3.5" />
              {opportunity.timeframe}
            </span>
          </div>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">
            {opportunity.title}
          </h3>
        </div>
        <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-600">
        {opportunity.description}
      </p>
      <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Estimated Impact
        </p>
        <p className="mt-1 text-sm font-medium text-emerald-900">
          {opportunity.estimatedImpact}
        </p>
      </div>
      <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          Prerequisite
        </p>
        <p className="mt-1 text-sm text-amber-900">{opportunity.prerequisite}</p>
      </div>
    </article>
  )
}
