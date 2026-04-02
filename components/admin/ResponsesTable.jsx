'use client'

import { AlertTriangle } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Pagination from '@/components/ui/Pagination'

function buildQuery(params) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value)
    }
  })

  return searchParams.toString()
}

export default function ResponsesTable({
  responses,
  industries,
  currentPage,
  totalPages,
  filters,
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateFilters(nextFilters) {
    const query = buildQuery({ ...filters, ...nextFilters, page: 1 })
    router.push(`${pathname}${query ? `?${query}` : ''}`)
  }

  function handlePageChange(page) {
    const query = buildQuery({ ...filters, page })
    router.push(`${pathname}?${query}`)
  }

  return (
    <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-5">
        <input
          type="search"
          defaultValue={filters.search || ''}
          placeholder="Search session, industry, size..."
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700 md:col-span-2"
          onChange={(event) => updateFilters({ search: event.target.value })}
        />
        <select
          defaultValue={filters.industry || ''}
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700"
          onChange={(event) => updateFilters({ industry: event.target.value })}
        >
          <option value="">All industries</option>
          {industries.map((industry) => (
            <option key={industry.slug} value={industry.slug}>
              {industry.label}
            </option>
          ))}
        </select>
        <select
          defaultValue={filters.level || ''}
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700"
          onChange={(event) => updateFilters({ level: event.target.value })}
        >
          <option value="">All levels</option>
          {[1, 2, 3, 4, 5].map((level) => (
            <option key={level} value={level}>
              {`Level ${level}`}
            </option>
          ))}
        </select>
        <input
          type="date"
          defaultValue={filters.from || ''}
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700"
          onChange={(event) => updateFilters({ from: event.target.value })}
        />
        <input
          type="date"
          defaultValue={filters.to || ''}
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700"
          onChange={(event) => updateFilters({ to: event.target.value })}
        />
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1 rounded-2xl"
            onClick={() => router.push(pathname)}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            className="flex-1 rounded-2xl"
            onClick={() => router.push(`${pathname}?${searchParams.toString()}`)}
          >
            Apply
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Industry</th>
              <th className="px-4 py-3">Org Size</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Blocker</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {responses.map((response) => (
              <tr key={response.session_id}>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {new Date(response.completed_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 text-sm font-medium text-slate-800">
                  {response.industry}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {response.org_size}
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                  {Number(response.overall_score).toFixed(2)}
                </td>
                <td className="px-4 py-4">
                  <Badge variant={response.maturity_level}>
                    {response.maturity_label}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  {response.blocker_dimension ? (
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                  ) : (
                    <span className="text-sm text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => router.push(`/admin/responses/${response.session_id}`)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
