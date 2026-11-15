import PropTypes from 'prop-types'
import Cuyi from '../brand/Cuyi'

// Convierte **negrita** en <strong> y respeta los saltos de línea de la respuesta
function RichText({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={index}>{part.slice(2, -2)}</strong> : part,
  )
}

// Un mensaje del chat. Los de Cuyi llevan su carita al lado, como si él respondiera.
export default function CuyiMessage({ role, text, anim = 'saluda', children }) {
  if (role === 'user') {
    return (
      <div className="chat-msg-in flex justify-end">
        <p className="max-w-[80%] whitespace-pre-line rounded-[16px] rounded-br-[4px] bg-ink px-3.5 py-2.5 text-[13px] leading-relaxed text-white">
          {text}
        </p>
      </div>
    )
  }
  return (
    <div className="chat-msg-in flex items-end gap-2">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime">
        <Cuyi anim={anim} px={1.6} />
      </span>
      <div className="max-w-[80%] rounded-[16px] rounded-bl-[4px] border border-line bg-surface px-3.5 py-2.5 text-[13px] leading-relaxed text-ink">
        {text && (
          <p className="whitespace-pre-line">
            <RichText text={text} />
          </p>
        )}
        {children}
      </div>
    </div>
  )
}

RichText.propTypes = { text: PropTypes.string.isRequired }

CuyiMessage.propTypes = {
  role: PropTypes.oneOf(['user', 'assistant']).isRequired,
  text: PropTypes.string,
  anim: PropTypes.oneOf(['saluda', 'escribe', 'celebra', 'duerme', 'confundido']),
  children: PropTypes.node,
}
