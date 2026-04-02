import { Gauge } from 'lucide-react'

export default function UnevenMaturityBanner({ note }) {
  return (
    <section className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div>
          <h2 className="text-xl font-semibold text-red-900">
            Uneven maturity detected
          </h2>
          <p className="mt-2 text-sm leading-7 text-red-800">
            {note ||
              'Capability maturity varies sharply across dimensions, which can slow execution even when some foundations appear strong.'}
          </p>
        </div>
      </div>
    </section>
  )
}
