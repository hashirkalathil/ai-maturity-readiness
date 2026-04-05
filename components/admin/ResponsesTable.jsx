'use client'

import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

export default function ResponsesTable({ responses }) {
  const router = useRouter()

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">Industry</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">Org Size</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">Score</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">Level</th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {responses.map((r) => (
              <tr key={r.session_id}>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(r.completed_at).toLocaleDateString()}
                </td>

                <td className="px-6 py-4 text-sm text-slate-900">
                  {r.industry}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {r.org_size}
                </td>

                <td className="px-6 py-4 text-sm text-slate-900">
                  {Number(r.overall_score).toFixed(2)}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {r.maturity_label}
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => router.push(`/admin/responses/${r.session_id}`)}
                    >
                      View
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => fetch(`/api/admin/responses/${r.session_id}`, { method: 'DELETE' }).then(() => router.refresh())}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
