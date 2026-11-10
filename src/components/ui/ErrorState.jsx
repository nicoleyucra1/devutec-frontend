import Cuyi from '../brand/Cuyi'
import { initials } from '../layout/navLinks'
import Button from './Button'
import SupportButton from './SupportButton'
import { useAuth } from '../../hooks/useAuth'
import { errorVariant } from '../../utils/errorVariant'
import { ERROR_ICONS } from './errorIcons'

const MONEY_SEAL = { strong: 'Tu dinero en garantía no se movió.', text: 'Ningún pago avanza sin una confirmación.' }

// Lo que cambia en cada error: animación de Cuyi, título (la segunda parte va en cursiva verde), texto y píldora.
// No se promete nada que el backend no haga (ni tiempos de inactividad ni borradores guardados).
const VARIANTS = {
  401: {
    anim: 'duerme',
    title: ['Tu sesión se cerró', 'por seguridad.'],
    text: 'Tu sesión venció y no se pudo renovar. Ingresa de nuevo para seguir donde te quedaste.',
    seal: { strong: 'Tus pagos en garantía están intactos.', text: 'Nada se movió mientras no estabas.' },
  },
  403: {
    anim: 'confundido',
    title: ['No tienes acceso', 'a esta página.'],
    text: 'Solo las personas que participan pueden verla. Revisa con qué cuenta ingresaste.',
    seal: 'account',
  },
  404: {
    anim: 'confundido',
    title: ['Esto ya no', 'está aquí.'],
    text: 'Puede que el enlace esté mal o que lo hayan eliminado.',
    seal: { strong: 'Tus pagos en garantía están intactos.', text: 'Nada se movió.' },
  },
  409: {
    anim: 'confundido',
    title: ['Alguien llegó', 'antes que tú.'],
    text: 'Los datos cambiaron mientras los mirabas. Recarga para ver la versión actual.',
  },
  500: {
    anim: 'escribe',
    title: ['Algo falló', 'de nuestro lado.'],
    text: 'No pudimos cargar esta información. Vuelve a intentarlo en unos segundos.',
    seal: MONEY_SEAL,
    support: true,
  },
  offline: {
    anim: 'duerme',
    title: ['No pudimos', 'conectarnos.'],
    text: 'El servidor no respondió. Revisa tu internet o vuelve a intentarlo en unos segundos.',
    seal: MONEY_SEAL,
    support: true,
  },
  generic: {
    anim: 'confundido',
    title: ['No pudimos', 'completar esto.'],
    text: 'Vuelve a intentarlo en unos segundos.',
  },
}

// El número gigante con Cuyi dentro del círculo lima en lugar del dígito del medio (4 · 0 · 4, 5 · 0 · 0).
// Sin código (sin conexión o error genérico) queda solo el círculo.
export function CodeHero({ code, anim, compact = false }) {
  const digits = code ? String(code).split('') : []
  return (
    <div
      role="img"
      aria-label={code ? `Error ${code}` : 'Error'}
      className={`flex items-center justify-center font-semibold leading-[0.8] tracking-[-0.07em] tabular-nums ${
        compact ? 'gap-1.5 text-[clamp(84px,10vw,128px)]' : 'gap-1.5 text-[clamp(132px,18vw,248px)] sm:gap-3.5'
      }`}
    >
      {digits[0] && (
        <span aria-hidden="true" className="tracking-normal">
          {digits[0]}
        </span>
      )}
      <span aria-hidden="true" className="grid h-[0.8em] w-[0.8em] flex-none place-items-center rounded-full bg-lime">
        {compact ? (
          <Cuyi anim={anim} px={4} />
        ) : (
          <span className="-m-6 grid h-32 w-32 scale-[0.62] place-items-center sm:m-0 sm:scale-100">
            <Cuyi anim={anim} px={8} />
          </span>
        )}
      </span>
      {digits[2] && (
        <span aria-hidden="true" className="tracking-normal">
          {digits[2]}
        </span>
      )}
    </div>
  )
}

// Píldora bajo el texto: verde con el escudo para avisos sobre el dinero, gris con las iniciales para la cuenta
export function ErrorSeal({ strong, text, avatar }) {
  return (
    <p
      className={`mt-[22px] inline-flex items-center gap-2.5 rounded-full py-2 pl-2 pr-4 text-left text-sm leading-[1.3] ${
        avatar ? 'bg-soft text-muted' : 'bg-[#e7efe9] text-escrow'
      }`}
    >
      <span
        aria-hidden="true"
        className={`grid h-7 w-7 flex-none place-items-center rounded-full text-paper ${
          avatar ? 'bg-ink text-[10px] font-semibold tracking-[0.02em]' : 'bg-escrow'
        }`}
      >
        {avatar ?? ERROR_ICONS.shield}
      </span>
      <span>
        {avatar ? (
          <>
            {text} <strong className="break-all font-semibold text-ink">{strong}</strong>
          </>
        ) : (
          <>
            <strong className="font-semibold">{strong}</strong> {text}
          </>
        )}
      </span>
    </p>
  )
}

// Pantalla de error del diseño (v2), con la misma forma que la 404: número con Cuyi, título, texto, píldora y botones.
// Por defecto ocupa la página; compact es para cuando falla solo una sección (por ejemplo, en el Resumen).
// title, text, seal, anim y actions cambian lo que trae cada código. message es el texto que mandó el backend:
// se usa en los errores que lo explican mejor (409 y los que no tienen variante propia).
export default function ErrorState({ status, message, title, text, seal, anim, onRetry, actions, compact = false, className = '' }) {
  const { user } = useAuth()
  const key = errorVariant(status)
  const variant = VARIANTS[key]
  const [lead, emphasis] = title ?? variant.title
  const detail = text ?? (key === '409' || key === 'generic' ? (message ?? variant.text) : variant.text)
  const code = key === 'offline' || key === 'generic' ? null : status

  // seal={null} quita la píldora; sin seal se usa la del código
  let pill = seal === undefined ? variant.seal : seal
  if (pill === 'account') {
    pill = user?.email ? { avatar: initials(user.nombre), text: 'Ingresaste como', strong: user.email } : null
  }

  const Heading = compact ? 'h2' : 'h1'

  return (
    <section
      role="alert"
      className={`mx-auto flex w-full flex-col items-center text-center ${
        compact ? 'rounded-2xl border border-line bg-surface px-6 py-10' : 'min-h-[calc(100vh_-_73px)] justify-center px-2 pb-[72px] pt-14'
      } ${className}`}
    >
      <CodeHero code={code} anim={anim ?? variant.anim} compact={compact} />

      <Heading
        className={`mb-3.5 font-semibold leading-[1.02] tracking-[-0.04em] ${
          compact ? 'mt-7 text-[clamp(26px,3vw,34px)]' : 'mt-11 text-[clamp(34px,4.2vw,56px)]'
        }`}
      >
        {lead} <em className="text-[1.1em] tracking-[-0.01em] text-escrow">{emphasis}</em>
      </Heading>
      <p className={`m-0 max-w-[460px] leading-relaxed text-muted ${compact ? 'text-sm' : 'text-base'}`}>{detail}</p>

      {pill && <ErrorSeal {...pill} />}

      <div className={`flex flex-wrap justify-center gap-2.5 ${compact ? 'mt-7' : 'mt-10'}`}>
        {actions ?? (
          <>
            {onRetry && (
              <Button onClick={onRetry}>
                {ERROR_ICONS.retry}
                Reintentar
              </Button>
            )}
            {variant.support && <SupportButton />}
          </>
        )}
      </div>
    </section>
  )
}
