import { useState } from 'react'
import PropTypes from 'prop-types'
import Cuyi from '../brand/Cuyi'
import Button from '../ui/Button'
import { contractService } from '../../services/contractService'
import { translationError } from './translationError'

// IA traductora para el estudiante: pega lo que le pidió el cliente («que se vea más moderno»)
// y Cuyi lo convierte en tareas concretas y en preguntas para confirmar con el cliente.
export default function ClientRequestTranslator({ contractId, clientName, stageName }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const client = clientName?.split(' ')[0] ?? 'el cliente'

  const translate = async (event) => {
    event.preventDefault()
    if (!text.trim()) {
      setError(`Pega lo que te escribió ${client}`)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await contractService.translate(contractId, { direction: 'FOR_STUDENT', text: text.trim(), stageName })
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
          <p className="text-[10px] font-semibold tracking-[0.13em] text-escrow">TRADUCTOR DE PEDIDOS</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">¿Qué quiso decir {client}?</h2>
          <p className="mt-1 text-xs text-muted">
            Pega un pedido o comentario de {client} y Cuyi te lo convierte en tareas y en preguntas para confirmar.
          </p>
        </div>
      </div>

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
}
