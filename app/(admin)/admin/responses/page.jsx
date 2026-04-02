import ResponsesTable from '@/components/admin/ResponsesTable'
import { requireAdminSession } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabase/admin'

function applyResponseFilters(query, params) {
  if (params.search) {
    query = query.or(
      `session_id.ilike.%${params.search}%,industry.ilike.%${params.search}%,org_size.ilike.%${params.search}%,maturity_label.ilike.%${params.search}%`
    )
  }

  if (params.industry) {
    query = query.eq('industry', params.industry)
  }

  if (params.level) {
    query = query.eq('maturity_level', Number(params.level))
  }

  if (params.from) {
    query = query.gte('completed_at', params.from)
  }

  if (params.to) {
    query = query.lte('completed_at', `${params.to}T23:59:59`)
  }

  return query
}

export default async function AdminResponsesPage({ searchParams }) {
  await requireAdminSession()
  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams.page || 1)
  const filters = {
    page,
    search: resolvedSearchParams.search || '',
    industry: resolvedSearchParams.industry || '',
    level: resolvedSearchParams.level || '',
    from: resolvedSearchParams.from || '',
    to: resolvedSearchParams.to || '',
  }

  let query = supabaseAdmin
    .from('responses')
    .select(
      'session_id, org_size, industry, overall_score, maturity_level, maturity_label, blocker_dimension, completed_at',
      { count: 'exact' }
    )
    .order('completed_at', { ascending: false })
  query = applyResponseFilters(query, filters).range((page - 1) * 20, page * 20 - 1)

  const [{ data: responses = [], count = 0 }, { data: industries = [] }] =
    await Promise.all([
      query,
      supabaseAdmin
        .from('industries')
        .select('slug, label')
        .order('label', { ascending: true }),
    ])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
          Responses
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Browse submitted assessments
        </h1>
      </div>

      <ResponsesTable
        responses={responses}
        industries={industries}
        currentPage={page}
        totalPages={Math.max(1, Math.ceil(count / 20))}
        filters={filters}
      />
    </div>
  )
}
