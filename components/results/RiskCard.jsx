import { ShieldAlert } from 'lucide-react'

const severityStyles = {
  Critical: 'text-rose-600',
  High: 'text-orange-600',
  Medium: 'text-amber-600',
}

export default function RiskCard({ risk }) {
  const severity = risk.severity || 'Medium'

  return (
    <article className="w-full flex items-start justify-between gap-6 bg-rose-50 border border-rose-200 py-4 px-6 rounded-xl">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider ${severityStyles[severity] || severityStyles.Medium
              }`}
          >
            {severity}
          </span>

          <ShieldAlert className="h-4 w-4 text-slate-500" />
        </div>

        <h3 className="text-sm font-semibold text-slate-900">
          {risk.risk}
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          {risk.mitigation}
        </p>
        {risk.triggersDimension && (
          <p className="mt-1 text-xs text-slate-500">
            Triggered by {risk.triggersDimension}
          </p>
        )}
      </div>
    </article>
  )
}