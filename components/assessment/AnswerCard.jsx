'use client'

export default function AnswerCard({ label, text, selected, onClick, }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-4 rounded-xl border p-3 text-left transition-all duration-200 ${selected
        ? 'border-gray-400 bg-gray-200 shadow-lg shadow-gray-100'
        : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50'
        }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${selected
          ? 'bg-gray-600 text-white'
          : 'bg-gray-100 text-gray-700 group-hover:bg-gray-100'
          }`}
      >
        {label}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base leading-7 text-gray-800">{text}</p>
      </div>
    </button>
  )
}
