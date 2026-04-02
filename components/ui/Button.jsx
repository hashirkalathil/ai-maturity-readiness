'use client'

import Spinner from '@/components/ui/Spinner'

const variantStyles = {
  primary: 'bg-gray-700 text-white hover:bg-gray-800',
  secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
}

const sizeStyles = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size="sm" className="text-current" /> : null}
      {children}
    </button>
  )
}
