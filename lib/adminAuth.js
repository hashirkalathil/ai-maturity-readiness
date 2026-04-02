import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function getAdminSession() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return { supabase, session }
}

export async function requireAdminSession() {
  const { supabase, session } = await getAdminSession()

  if (!session) {
    throw new Error('UNAUTHORIZED')
  }

  return { supabase, session }
}

export function unauthorizedJson() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
