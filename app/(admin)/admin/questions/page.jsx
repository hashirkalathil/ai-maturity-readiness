import QuestionsList from '@/components/admin/QuestionsList'
import { requireAdminSession } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export default async function AdminQuestionsPage() {
  await requireAdminSession()

  const [{ data: questions = [] }, { data: industries = [] }] = await Promise.all([
    supabaseAdmin
      .from('questions')
      .select('*')
      .order('dimension', { ascending: true })
      .order('sort_order', { ascending: true }),
    supabaseAdmin
      .from('industries')
      .select('slug, label')
      .order('label', { ascending: true }),
  ])

  return <QuestionsList questions={questions} industries={industries} />
}
