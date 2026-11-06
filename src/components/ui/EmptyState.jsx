// Mensaje para cuando una lista no tiene elementos, con una acción opcional
export default function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-12 text-center">
      <span aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-full bg-paper text-muted">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
        </svg>
      </span>
      <p className="mt-4 text-base font-semibold text-ink">{title}</p>
      {message && <p className="mt-1 max-w-md text-sm text-muted">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
