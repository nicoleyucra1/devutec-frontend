import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Cuyi from '../brand/Cuyi'
import Button from '../ui/Button'
import { contractService } from '../../services/contractService'
import { translationError } from './translationError'

const SECTIONS = [
  { key: 'yaEsta', icon: '✅', title: 'Ya está' },
  { key: 'falta', icon: '⏳', title: 'Falta' },
  { key: 'revisaEsto', icon: '👀', title: 'Revisa esto' },
]

// IA traductora para el cliente: explica en simple lo que mandó el estudiante en su entrega.
// El mensaje original siempre se puede ver, para que quede claro que DEVUTEC no cambia lo que dijo.
// isClient cambia el título: el estudiante ve la misma tarjeta como «así lo verá el cliente».
export default function TranslationCard({ contractId, note, freelancerName, clientName, isClient, stageName }) {
  const [state, setState] = useState({ loading: true, data: null, error: null })
  const [showOriginal, setShowOriginal] = useState(false)
  const firstName = freelancerName?.split(' ')[0] ?? 'el estudiante'

  // Cada intento pide la traducción de nuevo; el botón «Intentar de nuevo» suma uno
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    contractService
      .translate(contractId, { direction: 'FOR_CLIENT', text: note, stageName })
      .then((data) => active && setState({ loading: false, data, error: null }))
      .catch((err) => active && setState({ loading: false, data: null, error: translationError(err) }))
    return () => {
      active = false
    }
  }, [contractId, note, stageName, attempt])

  const retry = () => {
    setState({ loading: true, data: null, error: null })
    setAttempt((n) => n + 1)
  }

  const result = state.data?.result

  return (
    <article className="rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-lime">
          <Cuyi anim={state.loading ? 'escribe' : state.error ? 'confundido' : 'saluda'} px={2} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.13em] text-escrow">
            {isClient ? 'CUYI TE LO EXPLICA' : `ASÍ LO VERÁ ${(clientName?.split(' ')[0] ?? 'EL CLIENTE').toUpperCase()}`}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            {isClient ? `Lo que te mandó ${firstName}, en simple` : 'Tu entrega, explicada sin palabras técnicas'}
          </h2>
        </div>
      </div>

      {state.loading && (
        <div className="mt-5 grid gap-2" aria-live="polite">
          <p className="text-sm text-muted">Cuyi está leyendo el mensaje de {firstName}...</p>
          <span className="h-3 w-4/5 animate-pulse rounded bg-soft" />
          <span className="h-3 w-3/5 animate-pulse rounded bg-soft" />
        </div>
      )}

      {state.error && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-paper px-4 py-3 text-sm">
          <span className="text-muted">{state.error}</span>
          <Button variant="secondary" onClick={retry}>
            Intentar de nuevo
          </Button>
        </div>
      )}

      {result && (
        <>
          <p className="mt-5 text-[15px] leading-relaxed">{result.enSimple}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {SECTIONS.filter(({ key }) => result[key]?.length > 0).map(({ key, icon, title }) => (
              <section key={key} className="rounded-xl bg-paper px-4 py-3">
                <h3 className="text-xs font-semibold">
                  <span aria-hidden="true">{icon}</span> {title}
                </h3>
                <ul className="mt-2 grid gap-1.5 text-[13px] leading-snug text-ink/85">
                  {result[key].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {result.terminos?.length > 0 && (
            <div className="mt-4 text-[13px] leading-relaxed">
              <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">PALABRAS QUE USÓ {firstName.toUpperCase()}</p>
              <dl className="mt-2 grid gap-1">
                {result.terminos.map(({ termino, significado }) => (
                  <div key={termino}>
                    <dt className="inline font-semibold">«{termino}»</dt>
                    <dd className="inline text-muted"> = {significado}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </>
      )}

      {!state.loading && (
        <div className="mt-5 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => setShowOriginal((open) => !open)}
            aria-expanded={showOriginal}
            className="text-xs font-semibold underline underline-offset-2"
          >
            {showOriginal ? 'Ocultar mensaje original' : `Ver mensaje original de ${firstName}`}
          </button>
          {showOriginal && (
            <blockquote className="mt-3 whitespace-pre-line rounded-xl bg-paper px-4 py-3 text-sm leading-relaxed">{note}</blockquote>
          )}
        </div>
      )}
    </article>
  )
}

TranslationCard.propTypes = {
  contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  note: PropTypes.string.isRequired,
  freelancerName: PropTypes.string,
  clientName: PropTypes.string,
  isClient: PropTypes.bool,
  stageName: PropTypes.string,
}
