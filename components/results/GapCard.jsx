import { AlertCircle } from 'lucide-react'
import { DIMENSION_LABELS } from '@/constants/dimensions'

export default function GapCard({ gap }) {
  return (
    <article className="w-full flex items-start justify-between bg-rose-50 rounded-xl gap-6 border border-rose-200 py-4 px-6">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {DIMENSION_LABELS[gap.dimension] || gap.dimension}
          </span>

          {gap.isBlocker && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-rose-600">
              Blocker
            </span>
          )}

          <AlertCircle className="h-4 w-4 text-rose-500" />
        </div>

        <h3 className="text-sm font-semibold text-slate-900">
          {gap.headline}
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          {gap.risk}
        </p>
      </div>

      <div className="flex items-center text-sm font-semibold text-rose-600">
        {Number(gap.score || 0).toFixed(2)}
      </div>

    </article>
  )
}