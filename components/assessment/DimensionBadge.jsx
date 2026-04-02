'use client'

import { DIMENSION_LABELS } from '@/constants/dimensions'

const dimensionStyles = {
  businessStrategy: 'bg-cyan-100 text-cyan-800',
  dataReadiness: 'bg-emerald-100 text-emerald-800',
  technologyInfrastructure: 'bg-sky-100 text-sky-800',
  talentSkills: 'bg-amber-100 text-amber-800',
  useCaseReadiness: 'bg-fuchsia-100 text-fuchsia-800',
  operationalReadiness: 'bg-orange-100 text-orange-800',
  aiGovernance: 'bg-rose-100 text-rose-800',
}

export default function DimensionBadge({ dimension }) {
  if (!dimension) {
    return null
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
        dimensionStyles[dimension] || 'bg-slate-100 text-slate-800'
      }`}
    >
      {DIMENSION_LABELS[dimension] || dimension}
    </span>
  )
}
