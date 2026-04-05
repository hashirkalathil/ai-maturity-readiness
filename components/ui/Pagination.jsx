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
      className="flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      <button
        aria-label="Previous page"
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Prev
      </button>
      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`${page}-${index}`} className="px-1 text-slate-300">
            ...
          </span>
        ) : (
          <button
            key={page}
            aria-label={`Page ${page}`}
            className={`min-w-[36px] rounded-lg px-2.5 py-2 text-xs font-bold transition ${
              page === currentPage
                ? 'bg-slate-900 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}
      <button
        aria-label="Next page"
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </nav>
  )
}
