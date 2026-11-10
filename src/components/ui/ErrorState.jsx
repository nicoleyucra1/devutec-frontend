import Button from './Button'
import SupportButton from './SupportButton'
import { errorVariant } from '../../utils/errorVariant'

const icon = (children) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const MONEY_SAFE = 'Tu dinero en garantía no se ve afectado: ningún pago se mueve sin una confirmación.'

// Cada tipo de error del diseño: código grande, color, kicker, título (la segunda parte va en cursiva) y texto.
// Siempre dice qué pasó, qué pasa con el dinero y cuál es el siguiente paso.
const VARIANTS = {
  401: {
    tone: 'bg-pending-light text-pending',
    kicker: 'SESIÓN EXPIRADA',
    title: ['Tu sesión se cerró', 'por seguridad.'],
    text: 'Tu sesión venció y no se pudo renovar. Vuelve a ingresar para seguir donde estabas.',
    icon: icon(
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>,
    ),
  },
  403: {
    tone: 'bg-[#efede8] text-[#686660]',
    kicker: 'SIN PERMISO',
    title: ['No tienes acceso', 'a esta página.'],
    text: 'Esta información es solo para las personas que participan en ella. Si crees que deberías verla, revisa con qué cuenta ingresaste.',
    icon: icon(
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>,
    ),
  },
  404: {
    tone: 'bg-[#efede8] text-[#686660]',
    kicker: 'NO ENCONTRADO',
    title: ['Esto ya no', 'está aquí.'],
    text: 'Puede que el enlace esté mal o que lo hayan eliminado.',
    icon: icon(
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>,
    ),
  },
  409: {
    tone: 'bg-progress-light text-progress',
    kicker: 'CONFLICTO',
    title: ['Alguien llegó', 'antes que tú.'],
    text: 'Los datos cambiaron mientras los mirabas. Recarga para ver la versión actual.',
    icon: icon(
      <>
        <rect x="8" y="8" width="11" height="11" rx="2" />
        <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
      </>,
    ),
  },
  500: {
    tone: 'bg-error-light text-error',
    kicker: 'ERROR DEL SERVIDOR',
    title: ['Algo falló', 'de nuestro lado.'],
    text: `No pudimos cargar esta información. ${MONEY_SAFE}`,
    support: true,
    icon: <span className="text-[22px] font-semibold">!</span>,
  },
  offline: {
    tone: 'bg-error-light text-error',
    kicker: 'SIN CONEXIÓN',
    title: ['No pudimos', 'conectarnos.'],
    text: `Revisa tu internet o vuelve a intentarlo en unos segundos. ${MONEY_SAFE}`,
    support: true,
    icon: icon(
      <>
        <path d="M2 8.8a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" />
        <path d="M12 20h.01M3 3l18 18" />
      </>,
    ),
  },
  generic: {
    tone: 'bg-error-light text-error',
    kicker: 'ALGO SALIÓ MAL',
    title: ['No pudimos', 'completar esto.'],
    text: 'Vuelve a intentarlo en unos segundos.',
    icon: <span className="text-[22px] font-semibold">!</span>,
  },
}

// Tarjeta de error del diseño. Se puede cambiar el título, el texto o los botones para cada página;
// por defecto muestra Reintentar (si hay onRetry) y, en errores del servidor, Contactar soporte.
// message es el texto que mandó el backend: se usa en los errores que lo explican mejor (400 y 409).
export default function ErrorState({ status, message, title, text, onRetry, actions, children, className = '' }) {
  const key = errorVariant(status)
  const variant = VARIANTS[key]
  const [lead, emphasis] = title ?? variant.title
  const detail = text ?? (key === '409' || key === 'generic' ? (message ?? variant.text) : variant.text)
  const code = key === 'offline' || key === 'generic' ? null : String(status)

  return (
    <section
      role="alert"
      className={`flex flex-col rounded-[18px] border border-line bg-surface p-7 text-left sm:p-9 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-[56px] leading-none tracking-[-0.05em] sm:text-[64px]">{code ?? ' '}</span>
        <span className={`grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full ${variant.tone}`}>{variant.icon}</span>
      </div>
      <p className={`mt-8 text-[10px] font-semibold tracking-[0.13em] ${variant.tone.split(' ').find((c) => c.startsWith('text-'))}`}>
        {variant.kicker}
      </p>
      <h2 className="my-3 text-[28px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[30px]">
        {lead} <em>{emphasis}</em>
      </h2>
      <p className="max-w-[560px] text-[13px] leading-relaxed text-muted">{detail}</p>
      {children}
      <div className="mt-7 flex flex-wrap gap-2.5">
        {actions ?? (
          <>
            {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
            {variant.support && <SupportButton />}
          </>
        )}
      </div>
    </section>
  )
}
