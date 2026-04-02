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
    <div className="grid gap-5 xl:grid-cols-4">
      <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Total Assessments
        </p>
        <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          {totalResponses}
        </p>
        <p className="mt-2 text-sm font-medium text-cyan-700">
          {`${formatGrowth(growthPercent)} vs prior 7 days`}
        </p>
      </article>

      <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Average Score
        </p>
        <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          {`${Number(averageScore || 0).toFixed(1)} / 5.0`}
        </p>
        <div className="mt-3">
          <Badge variant={averageScore >= 3.5 ? 'success' : averageScore >= 2.5 ? 'warning' : 'danger'}>
            {averageScore >= 3.5
              ? 'Healthy trajectory'
              : averageScore >= 2.5
                ? 'Mid-stage maturity'
                : 'Early maturity'}
          </Badge>
        </div>
      </article>

      <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Most Common Level
        </p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          {mostCommonLevel?.label || 'No data yet'}
        </p>
        {mostCommonLevel ? (
          <div className="mt-3">
            <Badge variant={mostCommonLevel.level}>{`Level ${mostCommonLevel.level}`}</Badge>
          </div>
        ) : null}
      </article>

      <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Top Industry
        </p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          {topIndustry?.label || 'No data yet'}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {topIndustry ? `${topIndustry.count} assessments` : 'Waiting for responses'}
        </p>
      </article>
    </div>
  )
}
