import Badge from '@/components/ui/Badge'

function formatGrowth(growth) {
  if (!Number.isFinite(growth)) {
    return '0%'
  }

  const rounded = Math.round(growth)
  return `${rounded > 0 ? '+' : ''}${rounded}%`
}

export default function StatsRow({
  totalResponses,
  growthPercent,
  averageScore,
  mostCommonLevel,
  topIndustry,
}) {
  return (
    <div className="grid grid-cols-4 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white">

      <div className="px-6 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Total Assessments
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-950">
          {totalResponses}
        </p>
      </div>

      <div className="px-6 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Average Score
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-950">
          {`${Number(averageScore || 0).toFixed(1)} / 5.0`}
        </p>
      </div>

      <div className="px-6 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Most Common Level
        </p>
        <p className="mt-1 text-2xl font-semibold uppercase text-slate-950">
          {mostCommonLevel?.label || 'No data yet'}
        </p>
      </div>

      <div className="px-6 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Top Industry
        </p>
        <p className="mt-1 text-2xl font-semibold uppercase text-slate-950">
          {topIndustry?.label || 'No data yet'}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {topIndustry ? `${topIndustry.count} assessments` : 'Waiting for responses'}
        </p>
      </div>

    </div>
  )
}