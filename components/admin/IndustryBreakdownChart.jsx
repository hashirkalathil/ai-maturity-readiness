'use client'

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) {
    return null
  }

  const item = payload[0]?.payload
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
      <p className="mt-1 text-sm text-slate-600">{`Average score ${Number(item.avgScore || 0).toFixed(2)}`}</p>
      <p className="text-sm text-slate-600">{`${item.count} responses`}</p>
    </div>
  )
}

export default function IndustryBreakdownChart({ data }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-semibold text-slate-950">Industry performance</h2>
      <div className="mt-6 h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ left: 10, right: 30 }}>
            <XAxis type="number" domain={[0, 5]} tick={{ fill: '#475569', fontSize: 12 }} />
            <YAxis type="category" dataKey="label" width={140} tick={{ fill: '#475569', fontSize: 12 }} />
            <Tooltip content={<TooltipContent />} />
            <Bar dataKey="avgScore" fill="#0f766e" radius={[0, 10, 10, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
