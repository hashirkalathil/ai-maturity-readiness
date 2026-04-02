import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto flex min-h-screen items-center justify-center w-full max-w-7xl flex-1 flex-col px-6 py-16 sm:px-10 lg:px-12">
        <div className="flex">
          <div className="space-y-8">
            <span className="inline-flex w-fit items-center rounded-full border border-gray-600 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
              AI Maturity Readiness Assessment
            </span>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                Discover Your Organization&apos;s AI Readiness
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
                Benchmark your current AI maturity across 7 dimensions through a
                focused 16-question assessment designed for real organizational
                behavior, not vague aspiration. Expect a thoughtful result in
                about 5-8 minutes.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/assessment"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-800 px-7 py-4 text-base font-semibold text-white transition hover:bg-gray-950"
              >
                Start Assessment
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
