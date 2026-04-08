import { Clock3, Sparkles } from 'lucide-react'

export default function OpportunityCard({ opportunity, step }) {
  return (
    <article className="w-full flex items-start justify-between gap-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black border border-slate-200 text-sm font-semibold shadow-sm">
        {step}
      </div>

      <div className="w-full flex-1 flex flex-col justify-between items-start bg-emerald-50 border border-emerald-200 py-4 px-6 rounded-xl">

        <div className="w-full flex items-center justify-between gap-3 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-600">
            Opportunity
          </span>

          <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <Clock3 className="h-3.5 w-3.5" />
            {opportunity.timeframe}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-slate-900">
          {opportunity.title}
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          {opportunity.description}
        </p>

        <div className="w-full mt-2 flex flex-wrap justify-between gap-6 text-xs">
          <div className='flex flex-1 flex-row gap-2'>
            <span className="text-emerald-700 font-semibold">
              Impact:
            </span>
            <span className="text-slate-600">
              {opportunity.estimatedImpact}
            </span>
          </div>
          <div className='flex flex-1 flex-row gap-2'>
            <span className="text-amber-700 font-semibold">
              Prerequisite:
            </span>
            <span className="text-slate-600">
              {opportunity.prerequisite}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}