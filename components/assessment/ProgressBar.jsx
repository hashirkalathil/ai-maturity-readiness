'use client'

export default function ProgressBar({ currentStep, totalSteps }) {
  const progress = totalSteps ? Math.round((currentStep / totalSteps) * 100) : 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm font-medium text-slate-600">
        <span>{`Question ${currentStep} of ${totalSteps}`}</span>
        <span>{`${progress}% complete`}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-linear-to-r from-cyan-600 via-teal-500 to-lime-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="grid grid-cols-8 gap-2 sm:grid-cols-16">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-colors ${
              index < currentStep ? 'bg-cyan-600' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
