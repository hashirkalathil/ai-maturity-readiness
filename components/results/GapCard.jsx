import { AlertCircle } from 'lucide-react'

import { DIMENSION_LABELS } from '@/constants/dimensions'

export default function GapCard({ gap }) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              {DIMENSION_LABELS[gap.dimension] || gap.dimension}
            </p>
            {gap.isBlocker ? (
              <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700">
                Blocker
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">
            {gap.headline}
          </h3>
        </div>
        <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
          <AlertCircle className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-rose-700">
        {`Score ${Number(gap.score || 0).toFixed(2)}`}
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-600">{gap.risk}</p>
    </article>
  )
}
