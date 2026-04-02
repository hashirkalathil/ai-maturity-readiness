import Spinner from '@/components/ui/Spinner'

export default function Loading() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-slate-600">
        <Spinner size="lg" className="text-cyan-700" />
        <p className="text-sm font-medium">Loading dashboard analytics...</p>
      </div>
    </main>
  )
}
