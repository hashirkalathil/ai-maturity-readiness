const variantStyles = {
  1: 'bg-rose-100 text-rose-700',
  2: 'bg-orange-100 text-orange-700',
  3: 'bg-amber-100 text-amber-700',
  4: 'bg-emerald-100 text-emerald-700',
  5: 'bg-blue-100 text-blue-700',
  info: 'bg-sky-100 text-sky-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  neutral: 'bg-slate-100 text-slate-700',
}

const sizeStyles = {
  sm: 'px-2 py-1 text-[11px]',
  md: 'px-3 py-1.5 text-xs',
  lg: 'px-4 py-2 text-sm',
}

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold uppercase tracking-[0.18em] ${variantStyles[variant] || variantStyles.neutral} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {children}
    </span>
  )
}
