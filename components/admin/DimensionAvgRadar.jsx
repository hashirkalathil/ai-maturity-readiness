'use client'

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { DIMENSION_LABELS, DIMENSION_ORDER } from '@/constants/dimensions'

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) {
    return null
  }

  const item = payload[0]?.payload
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
      <p className="mt-1 text-sm text-slate-600">{`Average ${Number(item.score || 0).toFixed(2)}`}</p>
    </div>
  )
}

export default function DimensionAvgRadar({ data }) {
  const chartData = DIMENSION_ORDER.map((dimension) => ({
    dimension,
    label: DIMENSION_LABELS[dimension],
    score: Number(data?.[dimension] || 0),
  }))

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-semibold text-slate-950">Average dimension profile</h2>
      <div className="mt-6 h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid stroke="#cbd5e1" />
            <PolarAngleAxis dataKey="label" tick={{ fill: '#475569', fontSize: 12 }} />
            <Tooltip content={<TooltipContent />} />
            <Radar dataKey="score" stroke="#0f766e" fill="#14b8a6" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
