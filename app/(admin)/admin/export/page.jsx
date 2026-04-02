'use client'

import { useEffect, useState } from 'react'

import Button from '@/components/ui/Button'

const industries = [
  'healthcare',
  'finance',
  'retail',
  'manufacturing',
  'technology',
  'education',
  'government',
  'logistics',
]

export default function ExportPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [selectedIndustries, setSelectedIndustries] = useState([])
  const [selectedLevels, setSelectedLevels] = useState([])
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function loadCount() {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      selectedIndustries.forEach((industry) => params.append('industry', industry))
      selectedLevels.forEach((level) => params.append('level', level))
      params.set('page', '1')
      const response = await fetch(`/api/admin/responses?${params.toString()}`)
      const data = await response.json()
      setCount(data.count || 0)
    }

    loadCount()
  }, [from, to, selectedIndustries, selectedLevels])

  function buildUrl(format) {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    selectedIndustries.forEach((industry) => params.append('industry', industry))
    selectedLevels.forEach((level) => params.append('level', level))
    params.set('format', format)
    return `/api/admin/export?${params.toString()}`
  }

  return (
    <div className="space-y-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
          Export
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Export assessment data
        </h1>
        <p className="mt-3 text-base leading-8 text-slate-600">
          Filter the dataset before downloading a CSV or JSON export for analysis.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          type="date"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
        />
        <input
          type="date"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Industries</p>
          <div className="grid gap-2 md:grid-cols-2">
            {industries.map((industry) => (
              <label key={industry} className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedIndustries.includes(industry)}
                  onChange={(event) =>
                    setSelectedIndustries((current) =>
                      event.target.checked
                        ? [...current, industry]
                        : current.filter((item) => item !== industry)
                    )
                  }
                />
                <span>{industry}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Maturity levels</p>
          <div className="grid gap-2 md:grid-cols-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <label key={level} className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedLevels.includes(String(level))}
                  onChange={(event) =>
                    setSelectedLevels((current) =>
                      event.target.checked
                        ? [...current, String(level)]
                        : current.filter((item) => item !== String(level))
                    )
                  }
                />
                <span>{`Level ${level}`}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
        {`Estimated matching records: ${count}`}
      </div>

      <div className="flex flex-wrap gap-3">
        <a href={buildUrl('csv')}>
          <Button>Export CSV</Button>
        </a>
        <a href={buildUrl('json')}>
          <Button variant="secondary">Export JSON</Button>
        </a>
      </div>
    </div>
  )
}
