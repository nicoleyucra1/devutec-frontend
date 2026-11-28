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

// «Cómo integrarlo»: el estudiante pega una línea en la web que entrega, marca los pedidos y comprueba que lleguen
// las visitas. Mientras espera la primera visita, se revisa cada 5 segundos.
export default function IntegrationGuide({ contractId, setup, isClient, freelancerName }) {
  const [live, setLive] = useState({ installed: setup.installed, lastEventAt: setup.lastEventAt })
  const firstName = freelancerName?.split(' ')[0] ?? 'El estudiante'

  useEffect(() => {
    if (live.installed) return undefined
    const timer = setInterval(() => {
      metricsService
        .getSetup(contractId)
        .then((data) => setLive({ installed: data.installed, lastEventAt: data.lastEventAt }))
        .catch(() => {})
    }, 5000)
    return () => clearInterval(timer)
  }, [contractId, live.installed])

  const trackSnippet = "// Para otras acciones desde tu código (por ejemplo, al terminar un formulario)\nDevutecMetricas.evento('reserva_confirmada')"

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
        <p className="text-[10px] font-semibold tracking-[0.13em] text-escrow">CÓMO INTEGRARLO</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {isClient ? `Esto lo instala ${firstName} en tu web` : 'Conecta tu web en 2 minutos'}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Es como un Google Analytics de DEVUTEC: cuenta visitas, de dónde llegan, pedidos, contactos y la velocidad de la
          web, y el cliente lo ve en su panel. Es liviano y no frena la página.
        </p>

        <ol className="mt-7 grid gap-8">
          <Step number={1} title="Pega esta línea en tu web">
            Antes de <code className="rounded bg-paper px-1">&lt;/body&gt;</code>, en todas las páginas. En React o Vite va
            en <code className="rounded bg-paper px-1">index.html</code>; en WordPress, en el pie de página del tema.
            <CodeBlock code={setup.snippet} label="Código para instalar las métricas" />
          </Step>

          <Step number={2} title="Marca los botones importantes">
            Agrega <code className="rounded bg-paper px-1">data-devutec=&quot;pedido&quot;</code> al botón que hace el pedido,{' '}
            <code className="rounded bg-paper px-1">&quot;contacto&quot;</code> a WhatsApp, llamar o cómo llegar, y{' '}
            <code className="rounded bg-paper px-1">&quot;reserva&quot;</code> a las reservas.
            <CodeBlock code={setup.orderSnippet} label="Botón de pedido marcado" />
            <p className="mt-3">Si quieres contar otra acción desde tu código:</p>
            <CodeBlock code={trackSnippet} label="Evento propio por código" />
          </Step>

          <Step number={3} title="Publica y abre tu web">
            Abre la web publicada en tu celular o en el navegador y acepta el aviso de métricas. En unos segundos, la visita
            aparece aquí al lado.
          </Step>
        </ol>
      </div>

      <aside className="grid content-start gap-3">
        <div
          role="status"
          className={`rounded-2xl p-5 ${live.installed ? 'bg-escrow-light text-escrow' : 'bg-pending-light text-pending'}`}
        >
          <p className="text-[10px] font-semibold tracking-[0.13em]">ESTADO</p>
          <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
            <span
              className={`h-2.5 w-2.5 rounded-full ${live.installed ? 'bg-escrow' : 'animate-pulse bg-pending'}`}
              aria-hidden="true"
            />
            {live.installed ? 'Conectada' : 'Esperando la primera visita…'}
          </p>
          <p className="mt-1 text-xs leading-relaxed">
            {live.installed
              ? `Última visita ${timeAgo(live.lastEventAt)}. ¡Ya están llegando los datos!`
              : 'Revisamos cada 5 segundos. Abre tu web publicada y acepta el aviso para probar.'}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 text-xs leading-relaxed text-muted">
          <p className="text-[10px] font-semibold tracking-[0.13em] text-ink">PRIVACIDAD</p>
          <p className="mt-2">
            Antes de contar, el visitante ve un aviso y decide (Ley 29733). Si dice que no, no se envía nada.
          </p>
          <p className="mt-2">No usa cookies ni guarda la IP, nombres, correos o teléfonos. Solo cuenta visitas, botones y la velocidad.</p>
        </div>
      </aside>
    </div>
  )
}

IntegrationGuide.propTypes = {
  contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  setup: PropTypes.shape({
    snippet: PropTypes.string,
    orderSnippet: PropTypes.string,
    installed: PropTypes.bool,
    lastEventAt: PropTypes.string,
  }).isRequired,
  isClient: PropTypes.bool,
  freelancerName: PropTypes.string,
}
