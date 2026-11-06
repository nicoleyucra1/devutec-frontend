import { buttonClass } from './buttonClass'

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button type={type} disabled={disabled || loading} className={buttonClass(variant, className)} {...props}>
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-current border-t-transparent opacity-70"
        />
      )}
      {children}
    </button>
  )
}
