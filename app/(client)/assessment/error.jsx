'use client'

import { useEffect } from 'react'

import Button from '@/components/ui/Button'

export default function Error({ error, unstable_retry }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6">
      <div className="max-w-lg rounded-4xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-950">
          Assessment flow hit a snag
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Something interrupted the assessment. You can retry the
          current step without losing the app shell.
        </p>
        <div className="mt-6 flex justify-center">
          <Button onClick={() => unstable_retry()}>Retry</Button>
        </div>
      </div>
    </main>
  )
}
