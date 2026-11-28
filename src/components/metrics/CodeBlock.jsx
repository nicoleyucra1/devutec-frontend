import { useState } from 'react'
import PropTypes from 'prop-types'

// Código para copiar con un botón
export default function CodeBlock({ code, label }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="relative mt-3 rounded-xl border border-line bg-night">
      <pre className="whitespace-pre-wrap break-all p-4 pr-24 text-[12px] leading-relaxed text-white/90">
        <code aria-label={label}>{code}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        className="absolute right-2 top-2 rounded-lg bg-lime px-3 py-1.5 text-xs font-semibold text-[#1a1a18] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-progress"
      >
        {copied ? '¡Copiado!' : 'Copiar'}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Código copiado' : ''}
      </span>
    </div>
  )
}

CodeBlock.propTypes = {
  code: PropTypes.string.isRequired,
  label: PropTypes.string,
}
