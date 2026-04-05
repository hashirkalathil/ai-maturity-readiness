'use client'

import {
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
} from 'recharts'

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  const count = payload.find((item) => item.dataKey === 'count')?.value
  const avgScore = payload.find((item) => item.dataKey === 'avgScore')?.value

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="mt-1 text-sm text-slate-600">{`${count || 0} responses`}</p>
      <p className="text-sm text-slate-600">{`Avg score ${Number(avgScore || 0).toFixed(2)}`}</p>
    </div>
  )
}

export default function ScoreTrendChart({ data }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-semibold text-slate-950">30-day trend</h2>
      <div className="mt-6 h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <XAxis dataKey="dateLabel" tick={{ fill: '#475569', fontSize: 12 }} />
            <YAxis yAxisId="left" allowDecimals={false} tick={{ fill: '#475569', fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 5]} tick={{ fill: '#475569', fontSize: 12 }} />
            <Tooltip content={<TooltipContent />} />
            <Bar yAxisId="left" dataKey="count" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#0891b2" strokeWidth={3} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
