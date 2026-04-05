import Link from 'next/link'
import { SearchX } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6">
      <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <SearchX className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-slate-950">
          Assessment not found
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          We couldn&apos;t locate a saved assessment for this session. The link may
          be invalid or the report may no longer be available.
        </p>
        <Link
          href="/assessment"
          className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
        >
          Start a new assessment
        </Link>
      </div>
    </main>
  )
}
