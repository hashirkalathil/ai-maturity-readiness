'use client'

import { useEffect, useMemo, useState } from 'react'

import Button from '@/components/ui/Button'

const maturityLevels = [1, 2, 3, 4, 5]

function buildQuery({ name, from, to, industries, levels, format }) {
  const params = new URLSearchParams()

  if (name.trim()) {
    params.set('name', name.trim())
  }

  if (from) {
    params.set('from', from)
  }

  if (to) {
    params.set('to', to)
  }

  industries.forEach((industry) => params.append('industry', industry))
  levels.forEach((level) => params.append('level', String(level)))

  if (format) {
    params.set('format', format)
  }

  return params.toString()
}

export default function ExportPage() {
  const [industries, setIndustries] = useState([])
  const [nameFilter, setNameFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedIndustries, setSelectedIndustries] = useState([])
  const [selectedLevels, setSelectedLevels] = useState([])
  const [recordCount, setRecordCount] = useState(null)
  const [isLoadingCount, setIsLoadingCount] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadIndustries() {
      try {
        const response = await fetch('/api/industries')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load industries.')
        }

        setIndustries(data.industries || [])
      } catch (loadError) {
        setError(loadError.message)
      }
    }

    loadIndustries()
  }, [])

  const countQuery = useMemo(
    () =>
      buildQuery({
        name: nameFilter,
        from: fromDate,
        to: toDate,
        industries: selectedIndustries,
        levels: selectedLevels,
        format: 'json',
      }),
    [fromDate, nameFilter, selectedIndustries, selectedLevels, toDate]
  )

  useEffect(() => {
    let cancelled = false

    async function loadCount() {
      setIsLoadingCount(true)

      try {
        const response = await fetch(`/api/admin/export?${countQuery}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Unable to estimate record count.')
        }

        if (!cancelled) {
          setRecordCount(Array.isArray(data) ? data.length : 0)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message)
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCount(false)
        }
      }
    }

    loadCount()

    return () => {
      cancelled = true
    }
  }, [countQuery])

  function toggleIndustry(slug) {
    setSelectedIndustries((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug]
    )
  }

  function toggleLevel(level) {
    setSelectedLevels((current) =>
      current.includes(level)
        ? current.filter((item) => item !== level)
        : [...current, level]
    )
  }

  function handleExport(format) {
    const query = buildQuery({
      name: nameFilter,
      from: fromDate,
      to: toDate,
      industries: selectedIndustries,
      levels: selectedLevels,
      format,
    })

    window.location.href = `/api/admin/export?${query}`
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
          Export
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Download assessment data
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600">
          Filter responses by respondent, date range, industry, and maturity level,
          then export them as CSV or JSON.
        </p>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Respondent name
            </span>
            <input
              type="text"
              placeholder="Search by name..."
              value={nameFilter}
              onChange={(event) => setNameFilter(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                From
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                To
              </span>
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">Industries</p>
            <div className="flex flex-wrap gap-2">
              {industries.map((industry) => {
                const active = selectedIndustries.includes(industry.slug)

                return (
                  <button
                    key={industry.slug}
                    type="button"
                    onClick={() => toggleIndustry(industry.slug)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      active
                        ? 'border-cyan-700 bg-cyan-50 text-cyan-700'
                        : 'border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {industry.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Maturity levels
            </p>
            <div className="flex flex-wrap gap-2">
              {maturityLevels.map((level) => {
                const active = selectedLevels.includes(level)

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => toggleLevel(level)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      active
                        ? 'border-cyan-700 bg-cyan-50 text-cyan-700'
                        : 'border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {`Level ${level}`}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Record count estimate
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {isLoadingCount
                ? 'Checking matching responses...'
                : `${recordCount ?? 0} records match your current filters.`}
            </p>
            {error ? (
              <p className="mt-2 text-sm text-rose-600">{error}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => handleExport('json')}
            >
              Export JSON
            </Button>
            <Button
              variant="primary"
              className="rounded-full"
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
