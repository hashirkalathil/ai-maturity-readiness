'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { useAssessmentStore } from '@/store/assessmentStore'


const sizeOptions = [
  { value: '1-50', label: '1–50 employees' },
  { value: '51-200', label: '51–200 employees' },
  { value: '201-1000', label: '201–1,000 employees' },
  { value: '1000+', label: '1,000+ employees' },
]

const regionOptions = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Australia',
  'Japan',
  'India',
  'Brazil',
  'Other',
]



export default function AssessmentContextPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const setContext = useAssessmentStore((s) => s.setContext)
  const reset = useAssessmentStore((s) => s.reset)

  const isStarting = useAssessmentStore((s) => s.isStarting)
  const startAssessment = useAssessmentStore((s) => s.startAssessment)
  const storeError = useAssessmentStore((s) => s.error)

  const [industries, setIndustries] = useState([])
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [customIndustry, setCustomIndustry] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState(null)
  const [selectedOrgSize, setSelectedOrgSize] = useState(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')



  useEffect(() => {
    reset()
    async function loadIndustries() {
      const { data, error: err } = await supabase
        .from('industries')
        .select('*')
        .order('label', { ascending: true })

      if (err) setError('Error loading industries.')
      else setIndustries(data || [])
      setIsLoading(false)
    }
    loadIndustries()
  }, [reset, supabase])

  async function handleStartAssessment() {
    const resolvedLabel =
      selectedIndustry.slug === 'other'
        ? customIndustry.trim()
        : selectedIndustry.label

    const resolvedIndustry =
      selectedIndustry.slug === 'other'
        ? 'other'
        : selectedIndustry.slug

    setContext({
      name: name.trim(),
      companyName: companyName.trim(),
      email: email.trim(),
      region: selectedRegion,
      orgSize: selectedOrgSize,
      industry: resolvedIndustry,
      industryLabel: resolvedLabel,
    })

    await startAssessment(router)
  }

  const resolvedLabel =
    selectedIndustry?.slug === 'other'
      ? customIndustry.trim()
      : selectedIndustry?.label || ''

  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-10">
        <div className="mb-10" suppressHydrationWarning>
          <h1 className="mt-4 text-2xl font-semibold uppercase tracking-tight text-gray-800">
            Select your context
          </h1>
        </div>

        <div
          className={`space-y-10 transition ${isStarting ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}
          suppressHydrationWarning
        >
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" suppressHydrationWarning>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-950">Organization details</h2>
            </div>
            <div className="space-y-6 max-w-md">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Your name</span>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Company name</span>
                <input
                  type="text"
                  placeholder="Enter your company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Email</span>
                <p className="mb-2 text-sm text-slate-500">Optional</p>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                />
              </label>
            </div>
          </div>

          <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8" suppressHydrationWarning>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-950">Industry</h2>
            </div>
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading industries…</p>
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
                      <h3 className={`text-sm mx-auto font-semibold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {industry.label}
                      </h3>
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setSelectedIndustry({ slug: 'other', label: 'Other' })}
                  className={`rounded-xl border p-2 text-center transition ${selectedIndustry?.slug === 'other'
                      ? 'border-gray-950 bg-gray-950 shadow-lg shadow-gray-100'
                      : 'border-gray-200 bg-white hover:border-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <h3 className={`text-sm mx-auto font-semibold ${selectedIndustry?.slug === 'other' ? 'text-white' : 'text-slate-900'}`}>
                    Other
                  </h3>
                </button>
              </div>
            )}
            {selectedIndustry?.slug === 'other' && (
              <div className="mt-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">
                    Specify your industry
                  </span>
                  <input
                    type="text"
                    placeholder="Enter your industry"
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" suppressHydrationWarning>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-950">Organization size</h2>
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

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" suppressHydrationWarning>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-950">Region</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-4" suppressHydrationWarning>
              {regionOptions.map((option) => {
                const isSelected = selectedRegion === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedRegion(option)}
                    className={`rounded-2xl border p-2 text-sm font-semibold transition ${isSelected
                        ? 'border-gray-950 bg-gray-950 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>

          {(error || storeError) && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error || storeError}
            </div>
          )}

          <div className="flex justify-end" suppressHydrationWarning>
            <button
              type="button"
              onClick={handleStartAssessment}
              disabled={
                isStarting ||
                !selectedIndustry ||
                !selectedOrgSize ||
                !name.trim() ||
                !companyName.trim() ||
                (selectedIndustry?.slug === 'other' && !customIndustry.trim())
              }
              className="inline-flex items-center justify-center rounded-full bg-gray-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {isStarting ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Analyzing & Generating…
                </>
              ) : (
                'Discover Your AI Readiness →'
              )}
            </button>
          </div>
        </div>
      </section>


    </main>
  )
}
