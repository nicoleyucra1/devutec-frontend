import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'
import CuyiMessage from '../support/CuyiMessage'
import DraftSummary from './DraftSummary'
import { assistantService } from '../../services/assistantService'
import { errorMessage } from '../../utils/errorMessage'

const GREETING =
  '¡Hola! Te ayudo a armar tu proyecto en un par de minutos. Para empezar, ¿qué negocio tienes y qué te gustaría lograr con una web, una app o una automatización?'
const MAX_HISTORY = 20
const SUGGESTIONS = ['Tengo una pizzería y quiero recibir pedidos', 'Quiero una web para mostrar mis servicios', 'Necesito automatizar mis reportes en Excel']

// Chat con el asistente IA (Claude en el backend). Hace preguntas como un consultor y, cuando tiene lo necesario,
// muestra el proyecto armado con el precio sugerido y el plan de pagos. Solo habla del proyecto.
export default function ProjectAssistant({ onContinue, onManual }) {
  const [messages, setMessages] = useState([{ role: 'assistant', text: GREETING, local: true }])
  const [text, setText] = useState('')
  const [thinking, setThinking] = useState(false)
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState(null)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  const send = async (raw) => {
    const message = raw.trim()
    if (!message || thinking) return
    // El saludo es local: la conversación que ve la IA empieza con el primer mensaje del cliente
    const history = messages
      .filter((item) => !item.local)
      .slice(-MAX_HISTORY)
      .map(({ role, text: body }) => ({ role, text: body.slice(0, 1500) }))
    setMessages((current) => [...current, { role: 'user', text: message }])
    setText('')
    setError(null)
    setThinking(true)
    try {
      const data = await assistantService.chat({ message, history })
      // Si la pregunta era de otro tema, ni ella ni la respuesta fija vuelven a la IA en el historial
      setMessages((current) => [
        ...current.map((item, index) => (data.outOfScope && index === current.length - 1 ? { ...item, local: true } : item)),
        { role: 'assistant', text: data.reply, anim: data.ready ? 'celebra' : 'saluda', local: data.outOfScope },
      ])
      if (data.ready && data.draft) setDraft(data.draft)
    } catch (err) {
      // El mensaje que falló no queda en la conversación, para poder reintentarlo
      setMessages((current) => current.slice(0, -1))
      setText(message)
      setError(err.response?.status === 503 ? 'El asistente no está disponible ahora. Puedes llenar el formulario.' : errorMessage(err))
    } finally {
      setThinking(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    send(text)
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_0.6fr]">
      <div className="grid gap-5">
        <section aria-label="Conversación con el asistente" className="flex flex-col rounded-[17px] border border-line bg-surface">
          <div ref={listRef} className="flex max-h-[460px] min-h-[300px] flex-col gap-3 overflow-y-auto p-[22px] md:p-7" aria-live="polite">
            {messages.map((message, index) => (
              <CuyiMessage key={index} role={message.role} text={message.text} anim={message.anim} />
            ))}
            {thinking && <CuyiMessage role="assistant" text="Pensando…" anim="escribe" />}
            {messages.length === 1 && !thinking && (
              <div className="flex flex-wrap gap-2 pl-11">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs transition hover:border-ink"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          {error && (
            <p role="alert" className="mx-[22px] mb-3 rounded-lg bg-error-light px-3.5 py-2.5 text-sm text-error md:mx-7">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-line p-4 md:px-7">
            <label htmlFor="assistant-message" className="sr-only">
              Escribe tu mensaje
            </label>
            <input
              id="assistant-message"
              ref={inputRef}
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={800}
              placeholder="Cuéntame sobre tu negocio…"
              disabled={thinking}
              className="min-h-12 w-full rounded-[10px] border border-gray-300 bg-surface px-3.5 text-sm outline-none focus:border-ink focus:ring-[3px] focus:ring-ink/5"
            />
            <Button type="submit" loading={thinking} disabled={!text.trim()}>
              Enviar
            </Button>
          </form>
        </section>

        {draft && (
          <DraftSummary
            draft={draft}
            onContinue={onContinue}
            onKeepChatting={() => {
              setDraft(null)
              inputRef.current?.focus()
            }}
          />
        )}
      </div>

      <aside className="rounded-2xl bg-night p-7 text-white lg:sticky lg:top-24">
        <p className="text-[11px] font-semibold tracking-[0.13em] text-lime">ASISTENTE DE PROYECTOS</p>
        <h3 className="my-2 text-[25px] font-semibold tracking-[-0.02em]">No necesitas saber de tecnología.</h3>
        <p className="mb-6 text-[13px] leading-relaxed text-[#aaa8a0]">
          Cuéntale qué necesita tu negocio. Arma el proyecto, te sugiere un precio con datos reales y propone un plan de pagos
          por etapas. Tú revisas todo antes de publicar.
        </p>
        <Button variant="inverse" onClick={onManual} className="w-full">
          Prefiero llenar el formulario
        </Button>
      </aside>
    </div>
  )
}

ProjectAssistant.propTypes = {
  onContinue: PropTypes.func.isRequired,
  onManual: PropTypes.func.isRequired,
}
