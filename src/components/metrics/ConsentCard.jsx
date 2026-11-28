import { useState } from 'react'
import PropTypes from 'prop-types'
import Button from '../ui/Button'

// Antes de activar: el cliente lee el texto legal y marca el consentimiento. El estudiante solo ve que falta
export default function ConsentCard({ data, freelancerName, clientName, busy, onEnable }) {
  const [checked, setChecked] = useState(false)
  const firstName = freelancerName?.split(' ')[0] ?? 'el estudiante'

  if (!data.canManage) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
        <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">MÉTRICAS DE LA WEB</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{clientName ?? 'El cliente'} todavía no activa las métricas</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          {data.requested
            ? 'Las pidió al crear el proyecto. Cuando dé su consentimiento, aquí te aparecerá el código para integrarlas. Es un requisito de la Entrega final.'
            : 'Cuando las active, aquí te aparecerá el código para integrarlas en la web.'}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
      <p className="text-[10px] font-semibold tracking-[0.13em] text-escrow">MÉTRICAS DE TU WEB</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Mira cuántas personas visitan tu web y cuántas te contactan</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {firstName} deja instalada una línea de código en tu web y tú ves tus números aquí, en palabras simples. Los 3 primeros meses son
        gratis y empiezan cuando llega la primera visita real.
      </p>
      <label className="mt-5 flex max-w-2xl cursor-pointer items-start gap-3 rounded-xl border border-line bg-paper p-4 text-xs leading-relaxed text-muted">
        <input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-escrow" />
        <span>{data.consentText}</span>
      </label>
      <Button variant="lime" className="mt-5" disabled={!checked} loading={busy} onClick={onEnable}>
        {busy ? 'Activando…' : 'Activar métricas'}
      </Button>
    </div>
  )
}

ConsentCard.propTypes = {
  data: PropTypes.shape({ canManage: PropTypes.bool, requested: PropTypes.bool, consentText: PropTypes.string }).isRequired,
  freelancerName: PropTypes.string,
  clientName: PropTypes.string,
  busy: PropTypes.bool,
  onEnable: PropTypes.func.isRequired,
}
