'use client'

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { MATURITY_LEVELS } from '@/constants/dimensions'

const levelColors = Object.fromEntries(MATURITY_LEVELS.map((level) => [level.level, level.color]))

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) {
    return null
  }

  const item = payload[0]?.payload
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
      <p className="mt-1 text-sm text-slate-600">{`${item.count} responses`}</p>
    </div>
  )
}

export default function MaturityDistributionChart({ data }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-semibold text-slate-950">Maturity distribution</h2>
      <div className="mt-6 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="shortLabel" tick={{ fill: '#475569', fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: '#475569', fontSize: 12 }} />
            <Tooltip content={<TooltipContent />} />
            <Bar dataKey="count" radius={[10, 10, 0, 0]}>
              {data.map((item) => (
                <Cell key={item.level} fill={levelColors[item.level] || '#64748b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
