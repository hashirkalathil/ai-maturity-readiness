import { DIMENSION_LABELS, DIMENSION_ORDER, DIMENSION_WEIGHTS } from '@/constants/dimensions'

function getBarColor(score) {
  if (score >= 4) {
    return 'from-emerald-500 to-green-600'
  }

  if (score >= 2.5) {
    return 'from-amber-400 to-yellow-500'
  }

  return 'from-rose-500 to-red-600'
}

export default function DimensionScoreTable({ dimensionScores, blockerDimension }) {
  const rows = DIMENSION_ORDER.map((dimension) => ({
    dimension,
    label: DIMENSION_LABELS[dimension],
    score: Number(dimensionScores?.[dimension] || 0),
    weight: DIMENSION_WEIGHTS[dimension] || 0,
  }))
  const highestDimension = [...rows].sort((left, right) => right.score - left.score)[0]?.dimension

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-950">
          Dimension Score
        </h2>
      </div>
      <div className="overflow-hidden rounded-3xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <th className="px-5 py-4">Dimension</th>
              <th className="px-5 py-4">Score</th>
              <th className="px-5 py-4">Weight</th>
              <th className="px-5 py-4">Bar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.map((row) => {
              const isBlocker = blockerDimension === row.dimension
              const isHighest = highestDimension === row.dimension

              return (
                <tr
                  key={row.dimension}
                  className={`${isBlocker
                      ? 'bg-gray-200'
                      : isHighest
                        ? 'bg-gray-200'
                        : ''
                    }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-900"> {row.label} </span>
                      {isBlocker ? (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-700">
                          Blocker
                        </span>
                      ) : null}
                      {isHighest ? (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-700">
                          Highest
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                    {row.score.toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {`${Math.round(row.weight * 100)}%`}
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-3 rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full bg-linear-to-r ${getBarColor( row.score )}`}
                        style={{ width: `${(row.score / 5) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
