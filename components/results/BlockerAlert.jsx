import { AlertTriangle } from 'lucide-react'

import { DIMENSION_LABELS } from '@/constants/dimensions'

export default function BlockerAlert({ blockerDimension, dimensionScores }) {
  if (!blockerDimension) {
    return null
  }

  const blockerScore = Number(dimensionScores?.[blockerDimension] || 0).toFixed(1)

  return (
    <section className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div>
          <h2 className="text-xl font-semibold text-rose-900">
            {`Critical Gap Detected - ${DIMENSION_LABELS[blockerDimension] || blockerDimension} scored ${blockerScore} (below 2.0)`}
          </h2>
          <p className="mt-2 text-sm leading-7 text-rose-800">
            Your overall maturity has been capped at Level 2 - AI Curious until
            this gap is resolved.
          </p>
        </div>
      </div>
    </section>
  )
}
