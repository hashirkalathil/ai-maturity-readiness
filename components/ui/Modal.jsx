'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({ isOpen, onClose, title, children }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!mounted || !isOpen) {
    return null
  }

  return createPortal(
    <div
      className="absolute inset-0 z-[9999] flex min-h-screen items-center justify-center bg-slate-950/40 px-4 py-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-[2rem] bg-white p-6 shadow-2xl transition duration-200 sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
          <button
            className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}
