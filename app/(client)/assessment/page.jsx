'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { useAssessmentStore } from '@/store/assessmentStore'

const sizeOptions = [
  { value: '1-50', label: '1-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1,000 employees' },
  { value: '1000+', label: '1,000+ employees' },
]

export default function AssessmentContextPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const setContext = useAssessmentStore((state) => state.setContext)
  const setQuestions = useAssessmentStore((state) => state.setQuestions)
  const goToStep = useAssessmentStore((state) => state.goToStep)
  const reset = useAssessmentStore((state) => state.reset)

  const [industries, setIndustries] = useState([])
  const [selectedIndustry, setSelectedIndustry] = useState(null)
  const [selectedOrgSize, setSelectedOrgSize] = useState(null)
  const [companyName, setCompanyName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false)
  const [error, setError] = useState('')

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

  async function handleContinue() {
    if (!selectedIndustry || !selectedOrgSize || !companyName.trim()) {
      return
    }

    setIsFetchingQuestions(true)
    setError('')

    try {
      const response = await fetch(
        `/api/assessment/questions?industry=${selectedIndustry.slug}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load assessment questions.')
      }

      setContext({
        companyName: companyName.trim(),
        orgSize: selectedOrgSize,
        industry: selectedIndustry.slug,
        industryLabel: selectedIndustry.label,
      })
      setQuestions(data.questions || [])
      goToStep(1)
      router.push('/assessment/1')
    } catch (fetchError) {
      setError(fetchError.message)
    } finally {
      setIsFetchingQuestions(false)
    }
  }

  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-10">
        <div className="mb-10">
          <h1 className="mt-4 text-2xl font-semibold uppercase tracking-tight text-gray-800">
            Select your context
          </h1>
        </div>

        <div className="space-y-10">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-950">
                Organization details
              </h2>
            </div>
            
            <label className="block max-w-md">
              <span className="mb-2 block text-sm font-semibold text-gray-700">
                Company Name
              </span>
              <input
                type="text"
                placeholder="Enter your organization name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              />
            </label>
          </div>

          <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
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

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-950">
                Organization size
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
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

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedIndustry || !selectedOrgSize || isFetchingQuestions}
              className="inline-flex items-center justify-center rounded-full bg-gray-800 p-4 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {isFetchingQuestions ? 'Preparing context...' : 'Continue'}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
