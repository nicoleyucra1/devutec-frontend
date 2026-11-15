import { buttonClass } from './buttonClass'
import PropTypes from 'prop-types'

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

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'lime', 'inverse']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
}
