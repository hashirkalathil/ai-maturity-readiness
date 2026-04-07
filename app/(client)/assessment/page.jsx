'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { useAssessmentStore } from '@/store/assessmentStore'

const sizeOptions = [
  { value: '1-50', label: '1-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1,000 employees' },
  { value: '1000+', label: '1,000+ employees' },
]

const generationMessages = [
  'Crafting Business Strategy questions...',
  'Preparing Data Readiness questions...',
  'Building Technology Infrastructure questions...',
  'Generating Talent & Skills questions...',
  'Creating Use Case questions...',
  'Designing Operational Readiness questions...',
  'Finalizing AI Governance questions...',
  'Personalizing your assessment...',
]

export default function AssessmentContextPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const setContext = useAssessmentStore((state) => state.setContext)
  const setQuestionsAndSession = useAssessmentStore(
    (state) => state.setQuestionsAndSession
  )
  const reset = useAssessmentStore((state) => state.reset)

  const [industries, setIndustries] = useState([])
  const [name, setName] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState(null)
  const [selectedOrgSize, setSelectedOrgSize] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)
  const [generationError, setGenerationError] = useState('')
  const [error, setError] = useState('')
  const progressTimeoutRef = useRef(null)
  const messageIntervalRef = useRef(null)

  function clearGenerationTimers() {
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current)
      progressTimeoutRef.current = null
    }

    if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current)
      messageIntervalRef.current = null
    }
  }

  useEffect(() => {
    reset()

    async function loadIndustries() {
      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .order('label', { ascending: true })

      if (error) {
        setError('error loading industries')
      } else {
        setIndustries(data || [])
      }

      setIsLoading(false)
    }

    loadIndustries()
  }, [reset, supabase])

  useEffect(() => () => clearGenerationTimers(), [])

  async function handleContinue() {
    if (!selectedIndustry || !selectedOrgSize || !name.trim()) {
      return
    }

    setIsGenerating(true)
    setError('')
    setGenerationError('')
    setProgress(0)
    setMessageIndex(0)

    progressTimeoutRef.current = setTimeout(() => {
      setProgress(90)
    }, 100)

    messageIntervalRef.current = setInterval(() => {
      setMessageIndex((current) => (current + 1) % generationMessages.length)
    }, 800)

    try {
      const response = await fetch('/api/assessment/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          industry: selectedIndustry.slug,
          orgSize: selectedOrgSize,
          industryLabel: selectedIndustry.label,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to generate assessment questions.')
      }

      clearGenerationTimers()
      setProgress(100)
      setContext({
        name: name.trim(),
        orgSize: selectedOrgSize,
        industry: selectedIndustry.slug,
        industryLabel: selectedIndustry.label,
      })
      setQuestionsAndSession({
        questions: data.questions || [],
        sessionId: data.sessionId,
        dimensionAllocation: data.dimensionAllocation,
      })
      router.push('/assessment/1')
    } catch (fetchError) {
      clearGenerationTimers()
      setGenerationError(
        fetchError.message || 'Unable to generate your personalized assessment.'
      )
    }
  }

  function handleResetGeneration() {
    clearGenerationTimers()
    setIsGenerating(false)
    setGenerationError('')
    setProgress(0)
    setMessageIndex(0)
  }

  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-10">
        <div className="mb-10" suppressHydrationWarning>
          <h1 className="mt-4 text-2xl font-semibold uppercase tracking-tight text-gray-800">
            Select your context
          </h1>
        </div>

        <div
          className={`space-y-10 transition ${isGenerating ? 'opacity-35' : 'opacity-100'}`}
          suppressHydrationWarning
        >
          <div
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            suppressHydrationWarning
          >
            <div className="mb-6" suppressHydrationWarning>
              <h2 className="text-2xl font-semibold text-slate-950">
                Organization details
              </h2>
            </div>
            
            <label className="block max-w-md">
              <span className="mb-2 block text-sm font-semibold text-gray-700">
                Your name
              </span>
              <p className="mb-2 text-sm text-slate-500">
                This will appear on your assessment report
              </p>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              />
            </label>
          </div>

          <div
            className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            suppressHydrationWarning
          >
            <div className="mb-6" suppressHydrationWarning>
              <h2 className="text-2xl font-semibold text-slate-950">
                Industry
              </h2>
            </div>

            {isLoading ? (
              <p className="text-sm text-slate-500">Loading industries...</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {industries.map((industry) => {
                  const isSelected = selectedIndustry?.slug === industry.slug

                  return (
                    <button
                      key={industry.slug}
                      type="button"
                      onClick={() => setSelectedIndustry(industry)}
                      className={`rounded-xl border p-2 text-center transition ${isSelected
                        ? 'border-gray-950 bg-gray-950 shadow-lg shadow-gray-100'
                        : 'border-gray-200 bg-white hover:border-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <div className="flex flex-row items-center gap-3">
                        <h3 className={`text-sm mx-auto font-semibold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {industry.label}
                        </h3>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            suppressHydrationWarning
          >
            <div className="mb-6" suppressHydrationWarning>
              <h2 className="text-2xl font-semibold text-slate-950">
                Organization size
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-4" suppressHydrationWarning>
              {sizeOptions.map((option) => {
                const isSelected = selectedOrgSize === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedOrgSize(option.value)}
                    className={`rounded-2xl border p-2 text-sm font-semibold transition ${isSelected
                      ? 'border-gray-950 bg-gray-950 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end" suppressHydrationWarning>
            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedIndustry || !selectedOrgSize || !name.trim() || isGenerating}
              className="inline-flex items-center justify-center rounded-full bg-gray-800 p-4 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? 'Generating assessment...' : 'Continue'}
            </button>
          </div>
        </div>

        {isGenerating ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/20 px-6 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
                Building your assessment
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                Personalizing your questions
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                We&apos;re tailoring a 16-question assessment to your industry and organization size.
              </p>

              <div className="mt-8 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-cyan-600 transition-all duration-[5000ms] ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-4 text-sm font-medium text-slate-700">
                {generationMessages[messageIndex]}
              </p>

              {generationError ? (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                  <p>{generationError}</p>
                  <button
                    type="button"
                    onClick={handleResetGeneration}
                    className="mt-3 inline-flex rounded-full border border-red-300 px-4 py-2 font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    Try again
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}
