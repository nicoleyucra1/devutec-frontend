import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Cuyi from '../brand/Cuyi'
import Button from '../ui/Button'
import { contractService } from '../../services/contractService'
import { translationError } from './translationError'

// IA traductora para el estudiante: convierte lo que pidió el cliente («que se vea más moderno») en tareas
// concretas y en preguntas para confirmar.
// - Con request (el pedido de cambios que el cliente dejó en la etapa): se traduce solo al abrir el contrato.
// - Sin request: el estudiante pega un mensaje del cliente y lo traduce cuando quiere.
export default function ClientRequestTranslator({ contractId, clientName, stageName, request }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(Boolean(request))
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const client = clientName?.split(' ')[0] ?? 'el cliente'

  useEffect(() => {
    if (!request) return undefined
    let active = true
    contractService
      .translate(contractId, {
        direction: 'FOR_STUDENT',
        text: request,
        stageName,
      })
      .then((data) => active && setResult(data.result))
      .catch((err) => active && setError(translationError(err)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [contractId, request, stageName])

  const translate = async (event) => {
    event.preventDefault()
    if (!text.trim()) {
      setError(`Pega lo que te escribió ${client}`)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await contractService.translate(contractId, {
        direction: 'FOR_STUDENT',
        text: text.trim(),
        stageName,
      })
      setResult(data.result)
    } catch (err) {
      setError(translationError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-lime">
          <Cuyi anim={loading ? 'escribe' : 'saluda'} px={2} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.13em] text-escrow">
            {request
              ? `${client.toUpperCase()} PIDIÓ CAMBIOS${stageName ? ` EN ${stageName.toUpperCase()}` : ''}`
              : 'TRADUCTOR DE PEDIDOS'}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            {request ? `Qué quiere ${client}, en concreto` : `¿Qué quiso decir ${client}?`}
          </h2>
          {!request && (
            <p className="mt-1 text-xs text-muted">
              Pega un pedido o comentario de {client} y Cuyi te lo convierte en tareas y en preguntas para confirmar.
            </p>
          )}
        </div>
      </div>

      {request && (
        <blockquote className="mt-5 whitespace-pre-line rounded-xl bg-paper px-4 py-3 text-sm leading-relaxed">
          <span className="mb-1 block text-[10px] font-semibold tracking-[0.13em] text-muted">
            LO QUE ESCRIBIÓ {client.toUpperCase()}
          </span>
          {request}
        </blockquote>
      )}

      {request && loading && (
        <p className="mt-4 text-sm text-muted" aria-live="polite">
          Cuyi está leyendo el pedido de {client}...
        </p>
      )}
      {request && error && <p className="mt-4 text-xs text-error">{error}</p>}

      {!request && (
        <form onSubmit={translate} className="mt-5 grid gap-3">
          <textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value)
              setError(null)
            }}
            maxLength={2000}
            rows={3}
            placeholder="Por ejemplo: «Quiero que se vea más moderno y más alegre»"
            aria-label={`Mensaje de ${client}`}
            className="block w-full resize-y rounded-[10px] border border-gray-300 bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-ink focus:ring-[3px] focus:ring-ink/5"
          />
          {error && <p className="text-xs text-error">{error}</p>}
          <Button type="submit" loading={loading} className="justify-self-start">
            {loading ? 'Traduciendo...' : 'Traducir pedido'}
          </Button>
        </form>
      )}

      {result && (
        <div className="mt-5 grid gap-3 border-t border-line pt-5" aria-live="polite">
          <p className="text-[15px] leading-relaxed">{result.enSimple}</p>
          {result.tareas?.length > 0 && (
            <section className="rounded-xl bg-paper px-4 py-3">
              <h3 className="text-xs font-semibold">Qué hacer</h3>
              <ul className="mt-2 grid gap-1.5 text-[13px] leading-snug">
                {result.tareas.map((task) => (
                  <li key={task} className="flex gap-2">
                    <span aria-hidden="true">☐</span>
                    {task}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {result.preguntas?.length > 0 && (
            <section className="rounded-xl bg-paper px-4 py-3">
              <h3 className="text-xs font-semibold">Pregúntale a {client}</h3>
              <ul className="mt-2 grid gap-1.5 text-[13px] leading-snug">
                {result.preguntas.map((question) => (
                  <li key={question}>«{question}»</li>
                ))}
              </ul>
            </section>
          )}
          {result.ojo && (
            <p className="rounded-xl bg-pending-light px-4 py-3 text-[13px] leading-snug text-pending">
              <strong>Ojo:</strong> {result.ojo}
            </p>
          )}
        </div>
      )}
    </article>
  )
}

ClientRequestTranslator.propTypes = {
  contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  clientName: PropTypes.string,
  stageName: PropTypes.string,
  request: PropTypes.string,
}
