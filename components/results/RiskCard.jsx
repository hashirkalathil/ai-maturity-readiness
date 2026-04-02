import { ShieldAlert } from 'lucide-react'

const severityStyles = {
  Critical: 'bg-rose-100 text-rose-700',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-amber-100 text-amber-700',
}

export default function RiskCard({ risk }) {
  const severity = risk.severity || 'Medium'

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
              severityStyles[severity] || severityStyles.Medium
            }`}
          >
            {severity}
          </span>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">
            {risk.risk}
          </h3>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
          <ShieldAlert className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-600">{risk.mitigation}</p>
      {risk.triggersDimension ? (
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {`Triggered by ${risk.triggersDimension}`}
        </p>
      ) : null}
    </article>
  )
}
