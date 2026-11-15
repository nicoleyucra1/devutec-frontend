import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Cuyi from '../brand/Cuyi'
import CuyiMessage from './CuyiMessage'
import { FAQ } from './faq'
import { useAuth } from '../../hooks/useAuth'
import { supportService } from '../../services/supportService'

const GREETING = '¡Hola! Soy Cuyi 🐹 ¿En qué te ayudo? Pregúntame lo que quieras sobre DEVUTEC o elige una de estas:'
const MAX_HISTORY = 8
// En estas pantallas el chat estorbaría (pago, sesión expirada)
const HIDDEN_ON = ['/pago-listo', '/session-expired']

// Respuestas de Cuyi cuando la IA no puede contestar
function fallbackFor(status) {
  if (status === 429) return { text: 'Por hoy ya me hiciste muchas preguntas 😅 Mañana sigo. Mientras tanto, mira estas:', anim: 'duerme' }
  if (!status) return { text: 'Parece que no hay conexión con el servidor 😵 Revisa tu internet. Estas te pueden servir:', anim: 'confundido' }
  return { text: 'Ahora no puedo pensar bien 😵 Pero estas preguntas frecuentes te pueden servir:', anim: 'confundido' }
}

// Chat de ayuda: una burbuja con Cuyi abajo a la derecha que abre una conversación con él (IA de Gemini en el backend).
// Solo aparece con sesión iniciada. Con key = id del usuario, al cerrar sesión o cambiar de cuenta la conversación
// empieza de cero.
export default function CuyiChat() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user || HIDDEN_ON.includes(location.pathname)) return null
  return <ChatWindow key={user.id} />
}

// Si la IA falla, Cuyi responde con las preguntas frecuentes guardadas
function ChatWindow() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [thinking, setThinking] = useState(false)
  const [remaining, setRemaining] = useState(null)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  // Siempre se ve el último mensaje
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const ask = async (question) => {
    const clean = question.trim()
    if (!clean || thinking) return
    const history = messages
      .filter((message) => message.text && !message.local)
      .slice(-MAX_HISTORY)
      .map(({ role, text: body }) => ({ role, text: body.slice(0, 1500) }))
    setMessages((current) => [...current, { role: 'user', text: clean }])
    setText('')
    setThinking(true)
    try {
      const data = await supportService.ask({ message: clean, history })
      setRemaining(data.remaining)
      setMessages((current) => [...current, { role: 'assistant', text: data.reply, anim: 'saluda' }])
    } catch (error) {
      const known = FAQ.find((item) => item.q === clean)
      if (known) {
        // Era una pregunta frecuente: Cuyi sabe la respuesta aunque la IA no esté
        setMessages((current) => [...current, { role: 'assistant', text: known.a, anim: 'saluda', local: true }])
      } else {
        const fallback = fallbackFor(error.response?.status)
        setMessages((current) => [...current, { role: 'assistant', ...fallback, local: true, suggestions: true }])
      }
    } finally {
      setThinking(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    ask(text)
  }

  const suggestions = (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {FAQ.map((item) => (
        <button
          key={item.q}
          type="button"
          onClick={() => ask(item.q)}
          disabled={thinking}
          className="rounded-full border border-line bg-paper px-2.5 py-1 text-left text-[11.5px] font-medium transition hover:border-ink disabled:opacity-50"
        >
          {item.q}
        </button>
      ))}
    </div>
  )

  return (
    <>
      {open && (
        <section
          role="dialog"
          aria-label="Chat de ayuda con Cuyi"
          onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
          className="chat-panel-in fixed inset-x-3 bottom-[88px] z-50 flex max-h-[min(560px,calc(100vh-120px))] flex-col overflow-hidden rounded-[20px] border border-line bg-paper shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:inset-x-auto sm:right-5 sm:w-[380px]"
        >
          <header className="flex items-center gap-3 bg-ink px-4 py-3 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-lime">
              <Cuyi anim={thinking ? 'escribe' : 'saluda'} px={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block text-sm">Cuyi</strong>
              <span className="flex items-center gap-1.5 text-[11px] text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                {thinking ? 'Escribiendo…' : 'Asistente de DEVUTEC'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar el chat"
              className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-white/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </header>

          <div ref={listRef} aria-live="polite" className="flex flex-1 flex-col gap-3 overflow-y-auto px-3.5 py-4">
            <CuyiMessage role="assistant" text={GREETING} anim="saluda">
              {suggestions}
            </CuyiMessage>
            {messages.map((message, index) => (
              <CuyiMessage key={index} role={message.role} text={message.text} anim={message.anim}>
                {message.suggestions ? suggestions : null}
              </CuyiMessage>
            ))}
            {thinking && (
              <CuyiMessage role="assistant" anim="escribe">
                <span className="flex gap-1 py-1" aria-label="Cuyi está escribiendo">
                  {[0, 1, 2].map((dot) => (
                    <span key={dot} className="chat-dot h-1.5 w-1.5 rounded-full bg-muted" style={{ animationDelay: `${dot * 0.15}s` }} />
                  ))}
                </span>
              </CuyiMessage>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-line bg-surface p-3">
            <div className="flex items-center gap-2 rounded-[14px] border border-line bg-paper px-3 focus-within:border-ink">
              <input
                ref={inputRef}
                value={text}
                onChange={(event) => setText(event.target.value)}
                maxLength={500}
                placeholder="Escribe tu pregunta…"
                aria-label="Tu pregunta para Cuyi"
                className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                style={{ outline: 'none' }}
              />
              <button
                type="submit"
                disabled={!text.trim() || thinking}
                aria-label="Enviar"
                className="grid h-8 w-8 place-items-center rounded-full bg-ink text-white transition hover:scale-105 disabled:opacity-30"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10.5px] text-muted">
              Cuyi usa IA y puede equivocarse.
              {remaining !== null && remaining <= 5 && ` Te quedan ${remaining} preguntas hoy.`}
            </p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? 'Cerrar el chat de ayuda' : 'Abrir el chat de ayuda con Cuyi'}
        aria-expanded={open}
        className="chat-bubble-in group fixed bottom-5 right-5 z-50 grid h-16 w-16 place-items-center rounded-full bg-lime shadow-[0_12px_30px_rgba(0,0,0,0.22)] ring-4 ring-paper transition hover:-translate-y-1 hover:scale-105"
      >
        <Cuyi anim={open ? 'celebra' : 'saluda'} px={2.6} />
        {!open && messages.length === 0 && (
          <span className="chat-hint pointer-events-none absolute bottom-[calc(100%+10px)] right-0 whitespace-nowrap rounded-[12px] bg-ink px-3 py-1.5 text-xs font-medium text-white">
            ¿Te ayudo?
          </span>
        )}
      </button>
    </>
  )
}
