import { useState } from 'react'
import PropTypes from 'prop-types'
import Cuyi from '../brand/Cuyi'
import Button from '../ui/Button'
import { applicationService } from '../../services/applicationService'
import { translationError } from '../contracts/translationError'

// Contraoferta explicada por la IA: el cliente pide a Cuyi que le explique en simple qué cambia y por qué.
// Se pide solo al tocar el botón (para no gastar IA en propuestas que el cliente no mira); la respuesta queda guardada.
export default function ProposalExplainer({ applicationId, freelancerName }) {
  const [state, setState] = useState({ open: false, loading: false, data: null, error: null })
  const firstName = freelancerName?.split(' ')[0] ?? 'el estudiante'

  const load = (event) => {
    event.stopPropagation()
    setState({ open: true, loading: true, data: null, error: null })
    applicationService
      .explain(applicationId)
      .then((data) => setState({ open: true, loading: false, data, error: null }))
      .catch((err) => setState({ open: true, loading: false, data: null, error: translationError(err) }))
  }

  if (!state.open) {
    return (
      <button
        type="button"
        onClick={load}
        className="mt-4 flex items-center gap-2 self-start rounded-full bg-lime px-3.5 py-2 text-xs font-semibold text-ink transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-progress"
      >
        <span aria-hidden="true">✨</span> ¿Qué cambia? Cuyi te explica
      </button>
    )
  }

  const data = state.data

  return (
    // Los clics aquí no deben marcar la propuesta como elegida
    <section onClick={(event) => event.stopPropagation()} className="mt-4 rounded-xl bg-paper p-4" aria-live="polite">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime">
          <Cuyi anim={state.loading ? 'escribe' : state.error ? 'confundido' : 'saluda'} px={1.5} />
        </span>
        <p className="text-[10px] font-semibold tracking-[0.13em] text-escrow">CUYI TE LO EXPLICA</p>
      </div>

      {state.loading && (
        <div className="mt-3 grid gap-2">
          <p className="text-xs text-muted">Cuyi está leyendo la propuesta de {firstName}...</p>
          <span className="h-2.5 w-4/5 animate-pulse rounded bg-soft" />
          <span className="h-2.5 w-3/5 animate-pulse rounded bg-soft" />
        </div>
      )}

      {state.error && (
        <div className="mt-3 grid gap-2 text-xs">
          <span className="text-muted">{state.error}</span>
          <Button variant="secondary" onClick={load} className="justify-self-start">
            Intentar de nuevo
          </Button>
        </div>
      )}

      {data && (
        <div className="mt-3 grid gap-3 text-[13px] leading-relaxed">
          <p className="font-semibold">{data.summary}</p>
          {data.reason && (
            <div>
              <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">POR QUÉ</p>
              <p className="mt-1">{data.reason}</p>
            </div>
          )}
          {data.forYou?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">QUÉ SIGNIFICA PARA TI</p>
              <ul className="mt-1 grid gap-1">
                {data.forYou.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.questions?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">PUEDES PREGUNTARLE</p>
              <ul className="mt-1 grid gap-1">
                {data.questions.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true">💬</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-[11px] text-muted">Es una ayuda para decidir: la decisión de aceptar o no es tuya.</p>
        </div>
      )}
    </section>
  )
}

ProposalExplainer.propTypes = {
  applicationId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  freelancerName: PropTypes.string,
}
