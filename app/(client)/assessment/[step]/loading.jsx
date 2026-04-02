import Spinner from '@/components/ui/Spinner'

export default function Loading() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-gray-600">
        <Spinner size="lg" className="text-gray-700" />
        <p className="text-sm font-medium">Loading question...</p>
      </div>
    </main>
  )
}
