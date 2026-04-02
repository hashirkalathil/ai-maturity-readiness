'use client'

function buildPages(currentPage, totalPages) {
  const pages = []

  for (let page = 1; page <= totalPages; page += 1) {
    if (
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1
    ) {
      pages.push(page)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return pages
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return null
  }

  const pages = buildPages(currentPage, totalPages)

  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <button
        aria-label="Previous page"
        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`${page}-${index}`} className="px-2 text-slate-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            aria-label={`Page ${page}`}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              page === currentPage
                ? 'bg-slate-950 text-white'
                : 'border border-slate-300 text-slate-700'
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}
      <button
        aria-label="Next page"
        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </nav>
  )
}
