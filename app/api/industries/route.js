import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('industries')
    .select('id, slug, label, icon, description')
    .eq('is_active', true)
    .order('label', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}
