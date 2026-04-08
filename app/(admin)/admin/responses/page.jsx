import ResponsesTable from '@/components/admin/ResponsesTable'
import { requireAdminSession } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

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

export default async function AdminResponsesPage() {
  await requireAdminSession()

  const { data: responses = [], count = 0 } = await supabaseAdmin
    .from('responses')
    .select(
      'session_id, org_size, industry, overall_score, maturity_level, maturity_label, blocker_dimension, completed_at, respondent_name, company_name, email, region',
      { count: 'exact' }
    )
    .order('completed_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
          Responses
        </p>
      </div>

      <ResponsesTable
        responses={responses}
        currentPage={1}
        totalPages={Math.max(1, Math.ceil(count / 20))}
      />
    </div>
  )
}
