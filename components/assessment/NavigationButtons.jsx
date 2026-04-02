'use client'

export default function NavigationButtons({ onBack, onNext, disableBack, disableNext, isLastStep, isSubmitting, }) {
  return (
    <div className="flex gap-3 flex-row justify-between">
      <button
        type="button"
        onClick={onBack}
        disabled={disableBack || isSubmitting}
        className="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
      >
        Back
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={disableNext || isSubmitting}
        className="inline-flex items-center justify-center rounded-full bg-gray-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? 'Submitting...' : isLastStep ? 'Submit Assessment' : 'Next'}
      </button>
    </div>
  )
}
