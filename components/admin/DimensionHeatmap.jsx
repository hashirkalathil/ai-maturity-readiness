'use client'

import { DIMENSION_LABELS, DIMENSION_ORDER } from '@/constants/dimensions'

function getCellColor(score) {
  if (!Number.isFinite(score)) {
    return 'bg-slate-100'
  }

  if (score <= 2) {
    return 'bg-rose-100'
  }

  if (score < 3.5) {
    return 'bg-amber-100'
  }

  return 'bg-emerald-100'
}

export default function DimensionHeatmap({ data }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white py-4 px-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950 uppercase">Industry x dimension heatmap</h2>
      <div className="mt-6 overflow-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[180px_repeat(7,minmax(110px,1fr))] gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <div className="sticky left-0 bg-white py-2">Industry</div>
            {DIMENSION_ORDER.map((dimension) => (
              <div key={dimension} className="py-2 text-center">
                {DIMENSION_LABELS[dimension]}
              </div>
            ))}
          </div>
          <div className="mt-1 space-y-1">
            {data.map((row) => (
              <div
                key={row.industry}
                className="grid grid-cols-[180px_repeat(7,minmax(110px,1fr))] gap-2"
              >
                <div className="sticky left-0 flex items-center rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
                  {row.label}
                </div>
                {DIMENSION_ORDER.map((dimension) => {
                  const score = Number(row[dimension] || 0)
                  return (
                    <div
                      key={`${row.industry}-${dimension}`}
                      className={`flex items-center justify-center rounded-lg p-2 text-sm font-semibold text-slate-800 ${getCellColor(score)}`}
                    >
                      {score ? score.toFixed(2) : '-'}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
