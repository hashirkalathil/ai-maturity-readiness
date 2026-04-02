import { TrendingUp } from 'lucide-react'

import { DIMENSION_LABELS } from '@/constants/dimensions'

export default function StrengthCard({ strength }) {
  return (
    <article className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            {DIMENSION_LABELS[strength.dimension] || strength.dimension}
          </p>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">
            {strength.headline}
          </h3>
        </div>
        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-emerald-800">
        {`Score ${Number(strength.score || 0).toFixed(2)}`}
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-600">{strength.insight}</p>
    </article>
  )
}
