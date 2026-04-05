'use client'

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'

import { DIMENSION_LABELS, DIMENSION_ORDER } from '@/constants/dimensions'

function formatRadarData(dimensionScores) {
  return DIMENSION_ORDER.map((dimension) => ({
    dimension,
    label: DIMENSION_LABELS[dimension],
    score: Number(dimensionScores?.[dimension] || 0),
  }))
}

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) {
    return null
  }

  const item = payload[0]?.payload

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
      <p className="mt-1 text-sm text-slate-600">{`Score: ${item.score.toFixed(2)}`}</p>
    </div>
  )
}

export default function DimensionRadarChart({ dimensionScores }) {
  const data = formatRadarData(dimensionScores)

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-950">
          Dimension maturity profile
        </h2>
      </div>
      <div className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#d6d6d6" />
            <PolarAngleAxis dataKey="label" tick={{ fill: '#000', fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 5]} tickCount={6} />
            <Tooltip content={<TooltipContent />} />
            <Radar name="Score" dataKey="score" stroke="#000" fill="#4d4d4d" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
