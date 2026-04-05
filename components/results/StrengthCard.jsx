import { TrendingUp } from 'lucide-react'
import { DIMENSION_LABELS } from '@/constants/dimensions'

export default function StrengthCard({ strength }) {
  return (
    <article className="w-full flex items-start justify-between bg-emerald-50 rounded-xl gap-6 border border-emerald-200 py-4 px-6">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
            {DIMENSION_LABELS[strength.dimension] || strength.dimension}
          </span>

          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </div>

        <h3 className="text-sm font-semibold text-slate-900">
          {strength.headline}
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          {strength.insight}
        </p>
      </div>

      <div className="flex items-center text-sm font-semibold bg-emerald-700 text-white rounded-full px-2 py-1">
        {Number(strength.score || 0).toFixed(1)}
      </div>

    </article>
  )
}