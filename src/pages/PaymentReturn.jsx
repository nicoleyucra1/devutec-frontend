import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Logo from '../components/brand/Logo'
import Cuyi from '../components/brand/Cuyi'
import { ErrorSeal } from '../components/ui/ErrorState'
import { buttonClass } from '../components/ui/buttonClass'

// Solo se abren links de la app DevUTEC: devutec:// en el APK, exp:// o exps:// en Expo Go.
// Así nadie puede usar esta página para mandar a la gente a otro sitio.
const APP_LINK = /^(devutec|exps?):\/\/\S+$/

const CONTENT = {
  ok: {
    anim: 'celebra',
    title: ['¡Pago recibido!', 'Ya puedes volver.'],
    text: 'Vuelve a la app DevUTEC para ver tu contrato actualizado.',
    seal: { strong: 'Tu dinero queda en garantía.', text: 'Se libera al freelancer cuando confirmes la entrega.' },
  },
  cancelado: {
    anim: 'saluda',
    title: ['No se hizo', 'ningún cobro.'],
    text: 'Cancelaste el pago. Vuelve a la app DevUTEC para intentarlo de nuevo cuando quieras.',
    seal: null,
  },
  // Sin estado (o con uno desconocido) no se sabe cómo terminó: la app es la que revisa el pago al abrirse
  neutral: {
    anim: 'saluda',
    title: ['Vuelve a la app', 'para ver tu pago.'],
    text: 'La app DevUTEC revisa con Stripe si el pago se completó y te muestra el estado del contrato.',
    seal: null,
  },
}

// Página puente del pago desde la app. Stripe solo puede volver a un link https, así que vuelve aquí
// (página pública, sin iniciar sesión) y desde aquí se abre la app con el link que mandó la app.
// La app es la que confirma el pago con el backend al abrirse.
export default function PaymentReturn() {
  const [params] = useSearchParams()
  const estado = params.get('estado')
  const content = estado === 'ok' || estado === 'cancelado' ? CONTENT[estado] : CONTENT.neutral
  const back = params.get('volver') ?? ''
  const appLink = APP_LINK.test(back) ? back : null

  // Se intenta abrir la app solo; si el celular pregunta o no la abre, queda el botón
  useEffect(() => {
    if (!appLink) return undefined
    const timer = setTimeout(() => {
      window.location.href = appLink
    }, 600)
    return () => clearTimeout(timer)
  }, [appLink])

  const [lead, emphasis] = content.title

  return (
    <>
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center px-6">
          <Link to="/" aria-label="DevUTEC, ir al inicio">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1200px] px-5">
        <section className="mx-auto flex min-h-[calc(100vh_-_73px)] w-full flex-col items-center justify-center px-2 pb-[72px] pt-14 text-center">
          <span aria-hidden="true" className="grid h-36 w-36 place-items-center rounded-full bg-lime">
            <Cuyi anim={content.anim} px={6} />
          </span>
          <h1 className="mb-3.5 mt-10 text-[clamp(34px,4.2vw,56px)] font-semibold leading-[1.02] tracking-[-0.04em]">
            {lead} <em className="text-[1.1em] tracking-[-0.01em] text-escrow">{emphasis}</em>
          </h1>
          <p className="m-0 max-w-[460px] text-base leading-relaxed text-muted">{content.text}</p>

          {content.seal && <ErrorSeal {...content.seal} />}

          <div className="mt-10 flex flex-col items-center gap-3">
            {appLink ? (
              <a href={appLink} className={buttonClass('primary')}>
                Volver a la app DevUTEC
              </a>
            ) : (
              <p className="m-0 text-sm text-muted">Ya puedes cerrar esta pestaña y volver a la app DevUTEC.</p>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
