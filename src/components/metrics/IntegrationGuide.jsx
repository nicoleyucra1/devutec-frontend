import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { metricsService } from '../../services/metricsService'
import { timeAgo } from '../../utils/format'
import CodeBlock from './CodeBlock'

function Step({ number, title, children }) {
  return (
    <li className="grid grid-cols-[32px_1fr] gap-4">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-lime text-sm font-semibold text-[#1a1a18]" aria-hidden="true">
        {number}
      </span>
      <div className="min-w-0">
        <h3 className="text-base font-semibold">{title}</h3>
        <div className="mt-1.5 text-sm leading-relaxed text-muted">{children}</div>
      </div>
    </li>
  )
}

Step.propTypes = {
  number: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
}

const MARKS = `<!-- Contactos: WhatsApp, llamar, cómo llegar, formularios -->
<a href="https://wa.me/51..." data-devutec="contacto">Pedir por WhatsApp</a>

<!-- Pedidos -->
<button data-devutec="pedido">Pedir</button>

<!-- Reservas -->
<button data-devutec="reserva">Reservar</button>`

// «Cómo integrarlo»: el estudiante pega una línea en la web que entrega (o usa el prompt para su IA, o un POST desde su código),
// marca los botones importantes y comprueba que lleguen datos. Mientras espera el primero, se revisa cada 5 segundos.
export default function IntegrationGuide({ contractId, data, isClient, freelancerName, onIntegrated }) {
  const [live, setLive] = useState({ integrated: data.integrated, lastEventAt: data.lastEventAt })
  const firstName = freelancerName?.split(' ')[0] ?? 'El estudiante'
  const integration = data.integration

  useEffect(() => {
    if (live.integrated) return undefined
    const timer = setInterval(() => {
      metricsService
        .get(contractId)
        .then((fresh) => {
          setLive({ integrated: fresh.integrated, lastEventAt: fresh.lastEventAt })
          if (fresh.integrated) onIntegrated?.(fresh)
        })
        .catch(() => {})
    }, 5000)
    return () => clearInterval(timer)
  }, [contractId, live.integrated, onIntegrated])

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
        <p className="text-[10px] font-semibold tracking-[0.13em] text-escrow">CÓMO INTEGRARLO</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {isClient ? `Esto lo instala ${firstName} en tu web` : 'Conecta la web en 2 minutos'}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Es como un Google Analytics de DEVUTEC: cuenta visitas, contactos, pedidos, reservas y la velocidad, y el cliente lo ve en su
          panel. No usa cookies ni guarda datos personales.
        </p>

        <ol className="mt-7 grid gap-8">
          <Step number={1} title="Pega esta línea en la web">
            Antes de <code className="rounded bg-paper px-1">&lt;/body&gt;</code>, en todas las páginas. En React o Vite va en{' '}
            <code className="rounded bg-paper px-1">index.html</code>; en WordPress, en el pie de página del tema.
            <CodeBlock code={integration.scriptTag} label="Código para instalar las métricas" />
          </Step>

          <Step number={2} title="Marca los botones importantes">
            Agrega <code className="rounded bg-paper px-1">data-devutec</code> a los botones de contacto, pedido y reserva. Las visitas, los
            clics y la velocidad se cuentan solos.
            <CodeBlock code={MARKS} label="Botones marcados" />
          </Step>

          <Step number={3} title="¿Usas IA para programar? Pásale este prompt">
            Ya trae la llave de este proyecto y lo que hay que medir según el tipo de proyecto.
            <CodeBlock code={integration.aiPrompt} label="Prompt para la IA" />
          </Step>

          <Step number={4} title="¿Es una app o una automatización? Usa la API">
            Manda un POST desde tu código cuando pase algo importante.
            <CodeBlock code={integration.postExample} label="Ejemplo de POST" />
          </Step>

          <Step number={5} title="Publica y abre la web">
            Abre la web publicada en tu celular o en el navegador y acepta el aviso. En unos segundos aparece aquí al lado.{' '}
            <a
              href={`/demo/pizzeria-ramon.html?key=${encodeURIComponent(data.publicKey)}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-ink underline underline-offset-2"
            >
              Probar con la página de ejemplo
            </a>{' '}
            (cuenta como prueba).
          </Step>
        </ol>
      </div>

      <aside className="grid content-start gap-3">
        <div role="status" className={`rounded-2xl p-5 ${live.integrated ? 'bg-escrow-light text-escrow' : 'bg-pending-light text-pending'}`}>
          <p className="text-[10px] font-semibold tracking-[0.13em]">ESTADO</p>
          <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
            <span className={`h-2.5 w-2.5 rounded-full ${live.integrated ? 'bg-escrow' : 'animate-pulse bg-pending'}`} aria-hidden="true" />
            {live.integrated ? 'Integrada' : 'Esperando el primer dato…'}
          </p>
          <p className="mt-1 text-xs leading-relaxed">
            {live.integrated
              ? `Ya recibimos datos. Último ${timeAgo(live.lastEventAt)}.`
              : data.requested
                ? 'El cliente pidió métricas: sin el primer dato no se puede enviar la Entrega final.'
                : 'Revisamos cada 5 segundos. Abre tu web publicada para probar.'}
          </p>
          {data.allowedOrigin && <p className="mt-2 break-all text-[11px]">Web: {data.allowedOrigin}</p>}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 text-xs leading-relaxed text-muted">
          <p className="text-[10px] font-semibold tracking-[0.13em] text-ink">PRIVACIDAD</p>
          <p className="mt-2">
            Antes de contar, cada visitante ve un aviso y decide. No usa cookies, no guarda la IP ni nombres, y quita lo que va después del
            «?» en el link.
          </p>
          <p className="mt-2">Conviene mencionarlo en la política de privacidad de la web del cliente.</p>
        </div>
      </aside>
    </div>
  )
}

IntegrationGuide.propTypes = {
  contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  data: PropTypes.shape({
    publicKey: PropTypes.string,
    integrated: PropTypes.bool,
    lastEventAt: PropTypes.string,
    requested: PropTypes.bool,
    allowedOrigin: PropTypes.string,
    integration: PropTypes.shape({
      scriptTag: PropTypes.string,
      postExample: PropTypes.string,
      aiPrompt: PropTypes.string,
    }).isRequired,
  }).isRequired,
  isClient: PropTypes.bool,
  freelancerName: PropTypes.string,
  onIntegrated: PropTypes.func,
}
